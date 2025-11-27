/**
 * Demo GIF Capture Script for Workout Planner Documentation
 *
 * Run with: bun scripts/capture-demo-gifs.ts
 *
 * Prerequisites:
 * - Dev server running at http://localhost:5173
 * - Dependencies installed: bun add -d puppeteer puppeteer-screen-recorder
 * - FFmpeg installed on system: sudo apt install ffmpeg (or brew install ffmpeg)
 */

import puppeteer from 'puppeteer'
import type { Page, Browser } from 'puppeteer'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://localhost:5173'
const GIF_DIR = './docs/gifs'
const VIEWPORT = { width: 1024, height: 768 } // Increased to avoid mobile breakpoints
const FRAME_INTERVAL = 100 // ms between frames (10 fps)

// Clean and recreate GIF directory
if (fs.existsSync(GIF_DIR)) {
  fs.rmSync(GIF_DIR, { recursive: true })
}
fs.mkdirSync(GIF_DIR, { recursive: true })

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Record a GIF using frame-by-frame screenshots (more reliable than video recording)
 */
async function recordGif(
  page: Page,
  name: string,
  actionsFn: () => Promise<void>
): Promise<boolean> {
  const framesDir = path.join(GIF_DIR, `${name}_frames`)
  const gifPath = path.join(GIF_DIR, `${name}.gif`)

  // Create frames directory
  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true })
  }
  fs.mkdirSync(framesDir, { recursive: true })

  console.log(`   Recording ${name}...`)

  let frameCount = 0
  let recording = true

  // Start capturing frames in the background
  const captureFrames = async (): Promise<void> => {
    while (recording) {
      const framePath = path.join(framesDir, `frame_${String(frameCount).padStart(4, '0')}.png`)
      await page.screenshot({ path: framePath })
      frameCount++
      await delay(FRAME_INTERVAL)
    }
  }

  // Start frame capture and run actions concurrently
  const capturePromise = captureFrames()
  await actionsFn()
  recording = false
  await delay(FRAME_INTERVAL * 2) // Wait for last frame

  console.log(`   Converting ${frameCount} frames to GIF...`)

  // Convert frames to GIF with FFmpeg
  try {
    execSync(
      `ffmpeg -y -framerate 10 -i "${framesDir}/frame_%04d.png" -vf "scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "${gifPath}"`,
      { stdio: 'pipe' }
    )

    // Clean up frames directory
    fs.rmSync(framesDir, { recursive: true })

    const stats = fs.statSync(gifPath)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`   ✅ Saved ${name}.gif (${sizeMB} MB, ${frameCount} frames)`)
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`   ❌ Failed to convert ${name}: ${message}`)
    // Clean up on error
    if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true })
    return false
  }
}

/**
 * Inject sample workout plan data
 */
async function injectSampleData(page: Page): Promise<void> {
  await page.evaluate(() => {
    const samplePlan = {
      id: crypto.randomUUID(),
      name: 'Full Body Workout',
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

    localStorage.removeItem('workout-plans')
    localStorage.setItem('workout-plans', JSON.stringify([samplePlan]))
  })
}

async function captureDemoGifs(): Promise<void> {
  console.log('🎬 Starting GIF capture...\n')

  // Check FFmpeg
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' })
  } catch {
    console.error('❌ FFmpeg not found. Please install FFmpeg first.')
    console.error('   Ubuntu/Debian: sudo apt install ffmpeg')
    console.error('   macOS: brew install ffmpeg')
    process.exit(1)
  }

  const browser: Browser = await puppeteer.launch({
    headless: 'new',  // Use new headless mode for better React compatibility
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page: Page = await browser.newPage()
  await page.setViewport(VIEWPORT)

  const results: string[] = []
  const errors: string[] = []

  try {
    // Initial setup
    console.log('📍 Navigating to app...')
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    console.log('📦 Injecting sample data...')
    await injectSampleData(page)
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    // ============================================
    // 1. Muscle Filtering GIF
    // ============================================
    console.log('\n📸 1. Recording muscle-filtering.gif...')
    const muscleResult = await recordGif(page, 'muscle-filtering', async () => {
      // Scroll to ensure muscle diagram is in view
      await page.evaluate(() => {
        const muscleColumn = document.querySelector('.muscle-column')
        if (muscleColumn) {
          muscleColumn.scrollIntoView({ behavior: 'instant', block: 'start' })
        }
      })
      await delay(1000)

      // Helper to dispatch mouse events (Puppeteer hover doesn't trigger React events properly)
      const dispatchMouseEvent = async (pathIndex: number, eventType: string): Promise<void> => {
        await page.evaluate((index: number, type: string) => {
          const paths = document.querySelectorAll('.muscle-diagram svg path')
          const targetPath = paths[index]
          if (targetPath) {
            const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window })
            targetPath.dispatchEvent(event)
          }
        }, pathIndex, eventType)
      }

      // Check if we have enough paths
      const pathCount = await page.evaluate(() =>
        document.querySelectorAll('.muscle-diagram svg path').length
      )

      if (pathCount > 30) {
        // Hover over chest area (around path 20-25)
        await dispatchMouseEvent(22, 'mouseover')
        await delay(1500)

        // Clear hover and move to back/shoulders
        await dispatchMouseEvent(22, 'mouseout')
        await delay(300)
        await dispatchMouseEvent(45, 'mouseover')
        await delay(1500)

        // Click to filter by that muscle
        await dispatchMouseEvent(45, 'mouseout')
        await delay(300)
        await dispatchMouseEvent(22, 'click')
        await delay(2000)

        // Show filtered state, then clear
        await dispatchMouseEvent(22, 'click')
        await delay(1000)
      }
    })
    if (muscleResult) results.push('muscle-filtering.gif')
    else errors.push('muscle-filtering.gif')

    // Reset page
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    // ============================================
    // 2. Exercise Details GIF
    // ============================================
    console.log('\n📸 2. Recording exercise-details.gif...')
    const exerciseResult = await recordGif(page, 'exercise-details', async () => {
      // Show exercise list
      await delay(1000)

      // Scroll through exercises
      await page.evaluate(() => {
        const exerciseList = document.querySelector('.exercise-list, .exercise-column')
        if (exerciseList) {
          exerciseList.scrollTop = 200
        }
      })
      await delay(1000)

      await page.evaluate(() => {
        const exerciseList = document.querySelector('.exercise-list, .exercise-column')
        if (exerciseList) {
          exerciseList.scrollTop = 0
        }
      })
      await delay(500)

      // Click on first exercise using direct DOM click
      await page.evaluate(() => {
        const btn = document.querySelector('button.exercise-item') as HTMLButtonElement | null
        if (btn) btn.click()
      })
      await delay(2500)

      // Close modal
      await page.keyboard.press('Escape')
      await delay(500)
    })
    if (exerciseResult) results.push('exercise-details.gif')
    else errors.push('exercise-details.gif')

    // Reset page
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    // ============================================
    // 3. Plan Management GIF
    // ============================================
    console.log('\n📸 3. Recording plan-management.gif...')
    const planResult = await recordGif(page, 'plan-management', async () => {
      // Show plan list
      await delay(1500)

      // Click on plan card using direct DOM click
      await page.evaluate(() => {
        const planCard = document.querySelector('.plan-card') as HTMLElement | null
        if (planCard) planCard.click()
      })
      await delay(3000)

      // Close modal
      await page.keyboard.press('Escape')
      await delay(1000)
    })
    if (planResult) results.push('plan-management.gif')
    else errors.push('plan-management.gif')

    // Reset page
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    // ============================================
    // 4. Theme Toggle GIF
    // ============================================
    console.log('\n📸 4. Recording theme-toggle.gif...')
    const themeResult = await recordGif(page, 'theme-toggle', async () => {
      // Show current theme
      await delay(1000)

      // Click theme toggle using direct DOM click
      await page.evaluate(() => {
        const toggle = document.querySelector('.theme-toggle') as HTMLElement | null
        if (toggle) toggle.click()
      })
      await delay(1500)

      // Toggle back
      await page.evaluate(() => {
        const toggle = document.querySelector('.theme-toggle') as HTMLElement | null
        if (toggle) toggle.click()
      })
      await delay(1500)
    })
    if (themeResult) results.push('theme-toggle.gif')
    else errors.push('theme-toggle.gif')

    // Reset page
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    // ============================================
    // 5. Timer Preview GIF
    // ============================================
    console.log('\n📸 5. Recording timer-preview.gif...')
    const timerResult = await recordGif(page, 'timer-preview', async () => {
      // Show initial state with plan card
      await delay(1000)

      // Click timer button using direct DOM click (Puppeteer native click doesn't trigger React properly)
      const timerOpened = await page.evaluate(() => {
        const btn = document.querySelector('button.timer-button') as HTMLButtonElement | null
        if (btn) {
          btn.click()
          return true
        }
        return false
      })

      if (timerOpened) {
        await delay(1500) // Wait for timer UI to load

        // Click start button using direct DOM click
        const timerStarted = await page.evaluate(() => {
          const btn = document.querySelector('.start-button') as HTMLButtonElement | null
          if (btn) {
            btn.click()
            return true
          }
          return false
        })

        if (timerStarted) {
          await delay(3000) // Show timer running

          // Pause to show pause state (Space key works for keyboard events)
          await page.keyboard.press('Space')
          await delay(1500)

          // Resume briefly
          await page.keyboard.press('Space')
          await delay(2000)
        } else {
          // Just show the config form
          await delay(3000)
        }

        // Close timer
        await page.keyboard.press('Escape')
        await delay(500)
      } else {
        console.log('      Timer button not found')
        await delay(3000)
      }
    })
    if (timerResult) results.push('timer-preview.gif')
    else errors.push('timer-preview.gif')

    // Reset page
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await delay(500)

    // ============================================
    // 6. Random Generator GIF
    // ============================================
    console.log('\n📸 6. Recording random-generator.gif...')
    const randomResult = await recordGif(page, 'random-generator', async () => {
      await delay(500)

      // Click generate random button using direct DOM click
      await page.evaluate(() => {
        const btn = (document.querySelector('.generate-random-button') ||
          Array.from(document.querySelectorAll('button')).find(b =>
            b.textContent?.includes('Generate Random') || b.textContent?.includes('🎲')
          )) as HTMLButtonElement | null
        if (btn) btn.click()
      })
      await delay(4000)

      // Close modal
      await page.keyboard.press('Escape')
      await delay(1000)
    })
    if (randomResult) results.push('random-generator.gif')
    else errors.push('random-generator.gif')

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Error during GIF capture:', message)
    errors.push(`General error: ${message}`)
  } finally {
    await browser.close()
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('🎬 GIF CAPTURE SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Successfully created: ${results.length} GIFs`)
  console.log(`📁 Location: ${path.resolve(GIF_DIR)}`)
  console.log('\nCreated files:')
  results.forEach(f => console.log(`   - ${f}`))

  if (errors.length > 0) {
    console.log(`\n⚠️ Issues encountered (${errors.length}):`)
    errors.forEach(e => console.log(`   - ${e}`))
  }

  console.log('\n✨ Done!')
}

captureDemoGifs().catch(console.error)
