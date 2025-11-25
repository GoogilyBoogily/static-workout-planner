/**
 * Screenshot Capture Script for Workout Planner Documentation
 *
 * Run with: bun scripts/capture-screenshots.js
 *
 * Prerequisites:
 * - Dev server running at http://localhost:5173
 * - Puppeteer installed: bun add -d puppeteer
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './docs/screenshots';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeClick(page, selector, options = {}) {
  try {
    await page.waitForSelector(selector, { timeout: 3000 });
    await page.click(selector, options);
    return true;
  } catch {
    return false;
  }
}

async function captureScreenshots() {
  console.log('🚀 Starting screenshot capture...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const screenshots = [];
  const errors = [];

  async function takeScreenshot(filename, description) {
    try {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, filename),
        fullPage: filename.includes('full-page')
      });
      screenshots.push(filename);
      console.log(`   ✅ Saved ${filename}`);
      return true;
    } catch (error) {
      console.log(`   ❌ Failed to save ${filename}: ${error.message}`);
      errors.push(`${filename} - ${error.message}`);
      return false;
    }
  }

  try {
    // Navigate to app
    console.log('📍 Navigating to app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(1000);

    // Inject sample workout plan into localStorage so we can capture all features
    console.log('📦 Injecting sample workout plan...');
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
      };

      // Clear existing plans and add sample plan to ensure consistent screenshots
      localStorage.removeItem('workout-plans');
      localStorage.setItem('workout-plans', JSON.stringify([samplePlan]));
      return true;
    });

    // Reload to pick up the injected data
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(500);

    // 1.1 Plan List View (Main Page)
    console.log('📸 1.1 Capturing Plan List View...');
    await takeScreenshot('01-plan-list.png', 'Plan List View');

    // Full page screenshot early
    console.log('📸 Capturing Full Page Screenshot...');
    await takeScreenshot('00-full-page.png', 'Full Page');

    // 2.1 Exercise Library with Muscle Diagram
    console.log('📸 2.1 Capturing Exercise Library...');
    await page.evaluate(() => window.scrollTo(0, 400));
    await delay(500);
    await takeScreenshot('03-exercise-library.png', 'Exercise Library');

    // 2.2 Muscle Selection Filter - Click on a muscle using Puppeteer click
    console.log('📸 2.2 Capturing Muscle Filter Active...');
    // Try clicking on SVG elements that are muscles
    let muscleClicked = false;
    try {
      // Try to find and click on SVG paths that represent muscles
      const svgPaths = await page.$$('svg path');
      if (svgPaths.length > 10) {
        // Click on a path that's likely a muscle (skip the first few which are outline)
        await svgPaths[8].click();
        muscleClicked = true;
      }
    } catch {
      // Try alternative approach - click on muscle-related elements
      muscleClicked = await page.evaluate(() => {
        const muscleEl = document.querySelector('[data-muscle], .muscle, [class*="muscle"]');
        if (muscleEl) {
          muscleEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        }
        return false;
      });
    }
    await delay(500);
    await takeScreenshot('04-muscle-filter-active.png', 'Muscle Filter Active');

    // 2.3 Search and Equipment Filters
    console.log('📸 2.3 Capturing Filters Active...');
    const searchInput = await page.$('input[type="text"], input[type="search"], input[placeholder*="search" i]');
    if (searchInput) {
      await searchInput.click();
      await searchInput.type('bench', { delay: 50 });
      await delay(500);
    }
    await takeScreenshot('05-filters-active.png', 'Filters Active');

    // Reload to clear filters
    console.log('📍 Reloading app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(500);

    // 3.1 Exercise Detail Modal
    console.log('📸 3.1 Capturing Exercise Detail Modal...');
    // Scroll down to the exercise library section
    await page.evaluate(() => {
      const exerciseList = document.querySelector('.exercise-list, .exercise-column');
      if (exerciseList) {
        exerciseList.scrollIntoView({ behavior: 'instant', block: 'center' });
      } else {
        window.scrollTo(0, 500);
      }
    });
    await delay(500);

    // Click on an exercise item - the items are buttons with class "exercise-item"
    const exerciseButtons = await page.$$('button.exercise-item');
    console.log(`   Found ${exerciseButtons.length} exercise buttons`);

    if (exerciseButtons.length > 0) {
      try {
        await exerciseButtons[0].click();
        await delay(800);
      } catch (e) {
        console.log('   Failed to click exercise button:', e.message);
      }
    }

    // Check for modal - also try checking by class that might be visible
    const modalVisible = await page.evaluate(() => {
      // Look for any modal-like element
      const modals = document.querySelectorAll('.modal, .modal-overlay, [class*="modal"], [role="dialog"]');
      for (const modal of modals) {
        if (modal.offsetParent !== null || getComputedStyle(modal).display !== 'none') {
          return true;
        }
      }
      return false;
    });

    if (modalVisible) {
      await takeScreenshot('06-exercise-detail-modal.png', 'Exercise Detail Modal');
      await page.keyboard.press('Escape');
      await delay(300);
    } else {
      console.log('   ⚠️ Could not open exercise detail modal');
      errors.push('06-exercise-detail-modal.png - Could not open modal');
    }

    // 4.1 Create Plan Form
    console.log('📸 4.1 Capturing Create Plan Form...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await delay(200);

    // Click create plan button
    const createClicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const text = btn.textContent?.toLowerCase() || '';
        if (text.includes('create') || text.includes('new plan') || text.includes('+')) {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        }
      }
      return false;
    });
    await delay(500);
    await takeScreenshot('07-create-plan-form.png', 'Create Plan Form');

    // 4.2 Plan Form with content
    console.log('📸 4.2 Capturing Plan Form with Content...');
    const planInput = await page.$('input[placeholder*="name" i], input[name*="name" i], input[type="text"]');
    if (planInput) {
      await planInput.type('Test Workout Plan', { delay: 30 });
      await delay(200);
    }
    await takeScreenshot('08-plan-form-with-exercises.png', 'Plan Form with Content');

    // Close and reload
    await page.keyboard.press('Escape');
    await delay(300);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(500);

    // 5.1 Quota Form Modal
    console.log('📸 5.1 Capturing Quota Form...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await delay(300);

    // Click the generate random button
    try {
      const genButton = await page.$('.generate-random-button');
      if (genButton) {
        await genButton.click();
        await delay(800);
      } else {
        // Fallback: look for button with Generate Random text
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            if (btn.textContent?.includes('Generate Random') || btn.textContent?.includes('🎲')) {
              btn.click();
              return true;
            }
          }
          return false;
        });
        await delay(800);
      }
    } catch (e) {
      console.log('   Failed to click generate random button:', e.message);
    }

    // Check for modal
    const quotaVisible = await page.evaluate(() => {
      const modals = document.querySelectorAll('.modal, .modal-overlay, [class*="modal"], [role="dialog"]');
      for (const modal of modals) {
        if (modal.offsetParent !== null || getComputedStyle(modal).display !== 'none') {
          return true;
        }
      }
      return false;
    });

    if (quotaVisible) {
      await takeScreenshot('11-quota-form.png', 'Quota Form');
      await page.keyboard.press('Escape');
      await delay(300);
    } else {
      console.log('   ⚠️ Could not open quota form modal');
      errors.push('11-quota-form.png - Could not open modal');
    }

    // 6.1 Circuit Timer View
    console.log('📸 6.1 Capturing Circuit Timer...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(500);

    // Try to click the timer button (button.timer-button or button with ⏱️ emoji)
    try {
      const timerButton = await page.$('button.timer-button');
      if (timerButton) {
        await timerButton.click();
        await delay(500);
      } else {
        // Fallback: look for button with Timer text/emoji
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            if (btn.textContent?.includes('Timer') || btn.textContent?.includes('⏱️')) {
              btn.click();
              return true;
            }
          }
          return false;
        });
        await delay(500);
      }
    } catch (e) {
      console.log('   Failed to click timer button:', e.message);
    }

    const timerVisible = await page.evaluate(() => {
      const timer = document.querySelector('.circuit-timer, [class*="timer-display"], [class*="circuit"]');
      return timer && timer.offsetParent !== null;
    });

    if (timerVisible) {
      await takeScreenshot('13-circuit-timer.png', 'Circuit Timer');
    } else {
      console.log('   ⚠️ Could not open circuit timer view');
      errors.push('13-circuit-timer.png - Could not open timer view');
    }

    // 7.1 Light Theme
    console.log('📸 7.1 Capturing Light Theme...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(500);

    const themeToggled = await page.evaluate(() => {
      const toggles = document.querySelectorAll('button, input[type="checkbox"]');
      for (const toggle of toggles) {
        const text = toggle.textContent?.toLowerCase() || '';
        const title = toggle.title?.toLowerCase() || '';
        const label = toggle.getAttribute('aria-label')?.toLowerCase() || '';
        const className = toggle.className?.toLowerCase() || '';
        if (text.includes('theme') || title.includes('theme') ||
            label.includes('theme') || className.includes('theme')) {
          toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        }
      }
      return false;
    });
    await delay(300);
    await takeScreenshot('15-light-theme.png', 'Light Theme');

    // 7.2 Dark Theme (toggle back)
    console.log('📸 7.2 Capturing Dark Theme...');
    await page.evaluate(() => {
      const toggles = document.querySelectorAll('button, input[type="checkbox"]');
      for (const toggle of toggles) {
        const text = toggle.textContent?.toLowerCase() || '';
        const title = toggle.title?.toLowerCase() || '';
        const label = toggle.getAttribute('aria-label')?.toLowerCase() || '';
        const className = toggle.className?.toLowerCase() || '';
        if (text.includes('theme') || title.includes('theme') ||
            label.includes('theme') || className.includes('theme')) {
          toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        }
      }
      return false;
    });
    await delay(300);
    await takeScreenshot('16-dark-theme.png', 'Dark Theme');

    // 8.1 Data Table View
    console.log('📸 8.1 Capturing Data Table...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(500);
    await takeScreenshot('17-data-table.png', 'Data Table');

  } catch (error) {
    console.error('❌ Error during screenshot capture:', error.message);
    errors.push(`General error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SCREENSHOT CAPTURE SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Total screenshots captured: ${screenshots.length}`);
  console.log(`📁 Location: ${path.resolve(SCREENSHOT_DIR)}`);
  console.log('\nCaptured files:');
  screenshots.forEach(s => console.log(`   - ${s}`));

  if (errors.length > 0) {
    console.log(`\n⚠️ Issues encountered (${errors.length}):`);
    errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log('\n✨ Done!');
}

captureScreenshots().catch(console.error);
