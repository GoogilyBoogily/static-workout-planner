/**
 * Screenshot Capture Script for Workout Planner Documentation
 *
 * Run with: bun scripts/capture-screenshots.ts
 *
 * Prerequisites:
 * - Dev server running at http://localhost:5173
 * - Dependencies installed: bun add -d puppeteer sharp
 */

import puppeteer from 'puppeteer'
import type { Page, Browser, ElementHandle } from 'puppeteer'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const BASE_URL = 'http://localhost:5173'
const SCREENSHOT_DIR = './docs/screenshots'
const MAX_HEIGHT = 700 // Max height for README-friendly screenshots (increased for full body diagrams)

// Clean and recreate screenshot directory
if (fs.existsSync(SCREENSHOT_DIR)) {
  fs.rmSync(SCREENSHOT_DIR, { recursive: true })
}
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function captureScreenshots(): Promise<void> {
  console.log('🚀 Starting screenshot capture...\n')

  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page: Page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })

  const screenshots: string[] = []
  const errors: string[] = []

  /**
   * Take a screenshot of a specific element, cropping if too tall
   */
  async function takeElementScreenshot(
    filename: string,
    selector: string,
    description: string
  ): Promise<boolean> {
    try {
      const element = await page.$(selector)
      if (!element) {
        console.log(`   ⚠️ Element not found: ${selector}`)
        errors.push(`${filename} - Element not found: ${selector}`)
        return false
      }

      // Capture as buffer first
      const buffer = await element.screenshot() as Buffer
      const meta = await sharp(buffer).metadata()

      let finalImage = sharp(buffer)
      let truncated = false

      // Crop if too tall
      if (meta.height && meta.width && meta.height > MAX_HEIGHT) {
        truncated = true
        const fadeHeight = 40
        const cropHeight = MAX_HEIGHT

        // Crop to max height
        finalImage = sharp(buffer).extract({
          left: 0,
          top: 0,
          width: meta.width,
          height: cropHeight
        })

        // Create fade gradient overlay (transparent to white/dark)
        const gradientSvg = `<svg width="${meta.width}" height="${fadeHeight}">
          <defs>
            <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
              <stop offset="100%" style="stop-color:rgb(128,128,128);stop-opacity:0.7" />
            </linearGradient>
          </defs>
          <rect width="${meta.width}" height="${fadeHeight}" fill="url(#fade)" />
        </svg>`

        const gradientBuffer = Buffer.from(gradientSvg)

        // Composite gradient at bottom
        finalImage = finalImage.composite([{
          input: gradientBuffer,
          top: cropHeight - fadeHeight,
          left: 0
        }])
      }

      await finalImage.toFile(path.join(SCREENSHOT_DIR, filename))
      screenshots.push(filename)

      const suffix = truncated ? `, truncated from ${meta.height}px` : ''
      console.log(`   ✅ Saved ${filename} (${description}${suffix})`)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`   ❌ Failed to save ${filename}: ${message}`)
      errors.push(`${filename} - ${message}`)
      return false
    }
  }

  try {
    // Navigate to app
    console.log('📍 Navigating to app...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(1000)

    // Inject sample workout plan into localStorage so we can capture all features
    console.log('📦 Injecting sample workout plan...')
    await page.evaluate(() => {
      const samplePlan = {
        id: crypto.randomUUID(),
        name: 'Sample Full Body Workout',
        exercises: [
          {
            id: crypto.randomUUID(),
            name: 'Bench Press',
            tags: ['Chest', 'Triceps'],
            sets: 4,
            reps: 8,
            weight: '135 lbs',
            rest: 90,
            day: 'Monday'
          },
          {
            id: crypto.randomUUID(),
            name: 'Squat',
            tags: ['Quadriceps', 'Glutes'],
            sets: 4,
            reps: 8,
            weight: '185 lbs',
            rest: 120,
            day: 'Monday'
          },
          {
            id: crypto.randomUUID(),
            name: 'Deadlift',
            tags: ['Back', 'Hamstrings'],
            sets: 3,
            reps: 5,
            weight: '225 lbs',
            rest: 180,
            day: 'Monday'
          },
          {
            id: crypto.randomUUID(),
            name: 'Pull-ups',
            tags: ['Back', 'Biceps'],
            sets: 3,
            reps: 10,
            weight: 'Bodyweight',
            rest: 60,
            day: 'Monday'
          },
          {
            id: crypto.randomUUID(),
            name: 'Shoulder Press',
            tags: ['Shoulders', 'Triceps'],
            sets: 3,
            reps: 10,
            weight: '65 lbs',
            rest: 60,
            day: 'Monday'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isGenerated: false
      }

      // Clear existing plans and add sample plan to ensure consistent screenshots
      localStorage.removeItem('workout-plans')
      localStorage.setItem('workout-plans', JSON.stringify([samplePlan]))
      return true
    })

    // Reload to pick up the injected data
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    // 1. Plan List Section
    console.log('📸 1. Capturing Plan List...')
    await takeElementScreenshot('01-plan-list.png', '.plans-section', 'Plans section')

    // 2. Muscle Diagram
    console.log('📸 2. Capturing Muscle Diagram...')
    await takeElementScreenshot('02-muscle-diagram.png', '.muscle-column', 'Muscle diagram')

    // 3. Exercise Library
    console.log('📸 3. Capturing Exercise Library...')
    await takeElementScreenshot('03-exercise-library.png', '.exercise-column', 'Exercise library')

    // 4. Muscle Hover State - Hover over a muscle without clicking
    console.log('📸 4. Capturing Muscle Hover State...')
    let targetMuscle: ElementHandle<Element> | null = null
    try {
      const svgPaths = await page.$$('svg path')
      if (svgPaths.length > 10) {
        targetMuscle = svgPaths[8] ?? null
        if (targetMuscle) {
          await targetMuscle.hover()
          await delay(300)
        }
      }
    } catch {
      // Ignore hover errors
    }
    await takeElementScreenshot('04-muscle-hover.png', '.muscle-column', 'Muscle hover state')

    // 5. Muscle Filter Active - Click to filter, then hover over selected muscle
    console.log('📸 5. Capturing Muscle Filter Active...')
    try {
      if (targetMuscle) {
        await targetMuscle.click()
        await delay(500)
        await targetMuscle.hover()
        await delay(300)
      }
    } catch {
      // Ignore click/hover errors
    }
    await takeElementScreenshot('05-muscle-filter-active.png', '.muscle-column', 'Muscle filter active')

    // 6. Search/Filter Section
    console.log('📸 6. Capturing Filter Section...')
    const searchInput = await page.$('input[type="text"], input[type="search"], input[placeholder*="search" i]')
    if (searchInput) {
      await searchInput.click()
      await searchInput.type('bench', { delay: 50 })
      await delay(500)
    }
    await takeElementScreenshot('06-filters-active.png', '.filter-section', 'Filter section')

    // Reload to clear filters
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    // 7. Exercise Detail Modal
    console.log('📸 7. Capturing Exercise Detail Modal...')
    const exerciseButtons = await page.$$('button.exercise-item')
    if (exerciseButtons.length > 0) {
      const firstButton = exerciseButtons[0]
      if (firstButton) {
        await firstButton.click()
        await delay(800)
        await takeElementScreenshot('07-exercise-detail-modal.png', '.modal-content', 'Exercise detail modal')
        await page.keyboard.press('Escape')
        await delay(300)
      }
    } else {
      console.log('   ⚠️ No exercise buttons found')
      errors.push('07-exercise-detail-modal.png - No exercise buttons found')
    }

    // 8. Create Plan Form
    console.log('📸 8. Capturing Create Plan Form...')
    await page.evaluate(() => window.scrollTo(0, 0))
    await delay(200)

    const createClicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      for (const btn of buttons) {
        const text = btn.textContent?.toLowerCase() || ''
        if (text.includes('create') || text.includes('new plan') || text.includes('+')) {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
          return true
        }
      }
      return false
    })
    await delay(500)

    if (createClicked) {
      // Try to find plan form modal or form element
      const formCaptured = await takeElementScreenshot('08-create-plan-form.png', '.plan-detail-modal, .plan-form, [class*="plan-form"], [class*="modal"]', 'Create plan form')
      if (!formCaptured) {
        // Fallback: capture whatever modal is visible
        await takeElementScreenshot('08-create-plan-form.png', '[class*="modal"]', 'Create plan form')
      }
    }

    await page.keyboard.press('Escape')
    await delay(300)
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    // 9. Quota Form Modal
    console.log('📸 9. Capturing Quota Form...')
    try {
      const genButton = await page.$('.generate-random-button')
      if (genButton) {
        await genButton.click()
        await delay(800)
      } else {
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button')
          for (const btn of buttons) {
            if (btn.textContent?.includes('Generate Random') || btn.textContent?.includes('🎲')) {
              btn.click()
              return true
            }
          }
          return false
        })
        await delay(800)
      }

      await takeElementScreenshot('09-quota-form.png', '.quota-form-modal', 'Quota form')
      await page.keyboard.press('Escape')
      await delay(300)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      console.log('   ⚠️ Could not capture quota form:', message)
      errors.push(`09-quota-form.png - ${message}`)
    }

    // 10. Circuit Timer View (Running State)
    console.log('📸 10. Capturing Circuit Timer (running)...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    try {
      // Click on plan card to select it first (timer needs a selected plan)
      const planCards = await page.$$('.plan-card, [class*="plan-card"]')
      if (planCards.length > 0) {
        const firstCard = planCards[0]
        if (firstCard) {
          await firstCard.click()
          await delay(500)
          await page.keyboard.press('Escape')
          await delay(300)
        }
      }

      // Find and click the timer button
      const timerButton = await page.$('button.timer-button')
      if (timerButton) {
        await timerButton.click()
        await delay(800)
      } else {
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button')
          for (const btn of buttons) {
            if (btn.textContent?.includes('Timer') || btn.textContent?.includes('⏱️')) {
              btn.click()
              return true
            }
          }
          return false
        })
        await delay(800)
      }

      // Start the timer to show running state
      const startButton = await page.$('.start-button')
      if (startButton) {
        await startButton.click()
        await delay(1500) // Let timer start and show exercise phase
        // Pause timer for clean screenshot
        await page.keyboard.press('Space')
        await delay(300)
      }

      await takeElementScreenshot('10-circuit-timer.png', '.circuit-timer', 'Circuit timer running')
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      console.log('   ⚠️ Could not capture circuit timer:', message)
      errors.push(`10-circuit-timer.png - ${message}`)
    }

    // 11. Data Table
    console.log('📸 11. Capturing Data Table...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)
    await takeElementScreenshot('11-data-table.png', '.data-table', 'Data table')

    // 12. Theme Toggle Button (both states combined)
    console.log('📸 12. Capturing Theme Toggle (both states)...')
    try {
      const themeToggle = await page.$('.theme-toggle')
      if (themeToggle) {
        // Capture first state
        const firstStateBuffer = await themeToggle.screenshot() as Buffer

        // Toggle theme
        await themeToggle.click()
        await delay(300)

        // Capture second state
        const secondStateBuffer = await themeToggle.screenshot() as Buffer

        // Get dimensions of the screenshots
        const firstMeta = await sharp(firstStateBuffer).metadata()
        const secondMeta = await sharp(secondStateBuffer).metadata()

        const firstWidth = firstMeta.width ?? 0
        const secondWidth = secondMeta.width ?? 0
        const firstHeight = firstMeta.height ?? 0
        const secondHeight = secondMeta.height ?? 0

        const gap = 16
        const totalWidth = firstWidth + secondWidth + gap
        const maxHeight = Math.max(firstHeight, secondHeight)

        // Combine side by side
        await sharp({
          create: {
            width: totalWidth,
            height: maxHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
          .composite([
            { input: firstStateBuffer, left: 0, top: 0 },
            { input: secondStateBuffer, left: firstWidth + gap, top: 0 }
          ])
          .toFile(path.join(SCREENSHOT_DIR, '12-theme-toggle.png'))

        screenshots.push('12-theme-toggle.png')
        console.log('   ✅ Saved 12-theme-toggle.png (Theme toggle - both states)')
      } else {
        console.log('   ⚠️ Theme toggle not found')
        errors.push('12-theme-toggle.png - Theme toggle not found')
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      console.log(`   ❌ Failed to capture theme toggle: ${message}`)
      errors.push(`12-theme-toggle.png - ${message}`)
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Error during screenshot capture:', message)
    errors.push(`General error: ${message}`)
  } finally {
    await browser.close()
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 SCREENSHOT CAPTURE SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Total screenshots captured: ${screenshots.length}`)
  console.log(`📁 Location: ${path.resolve(SCREENSHOT_DIR)}`)
  console.log('\nCaptured files:')
  screenshots.forEach(s => console.log(`   - ${s}`))

  if (errors.length > 0) {
    console.log(`\n⚠️ Issues encountered (${errors.length}):`)
    errors.forEach(e => console.log(`   - ${e}`))
  }

  console.log('\n✨ Done!')
}

captureScreenshots().catch(console.error)
