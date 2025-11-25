---
description: Take screenshots of the various workflows/pages on the application using the Playwright MCP server
---

# Screenshot Capture Workflow

Capture comprehensive screenshots of the Workout Planner application for documentation purposes using the Playwright MCP server.

## Prerequisites

1. **Ensure dev server is running**: Check if `http://localhost:5173` is accessible
   - If not running, start it with `bun dev` in background mode
   - Wait for the server to be ready before proceeding

2. **Create output directory**: `docs/screenshots/`

## Screenshot Sequence

Use the Playwright MCP tools (`mcp__playwright__browser_navigate`, `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_click`, `mcp__playwright__browser_take_screenshot`, `mcp__playwright__browser_wait_for`) to capture the following views.

**Important**: 
- Always use `browser_snapshot` first to get element refs before clicking
- Use `browser_wait_for` with `time: 1` between actions for animations to complete
- Take full-page screenshots where appropriate using `fullPage: true`

### 1. Main Application Views

#### 1.1 Plan List View (Main Page)
- **File**: `01-plan-list.png`
- Navigate to `http://localhost:5173`
- Wait for exercises to load (wait for "My Workout Plans" or exercise list to appear)
- Take screenshot of the main view showing the plan list section

#### 1.2 Empty State (if no plans exist)
- **File**: `02-empty-state.png`
- If localStorage has no plans, capture the empty state with "No workout plans yet" message
- Note: You may need to clear localStorage first: `localStorage.removeItem('workout-plans')`

### 2. Exercise Library Views

#### 2.1 Exercise Library with Muscle Diagram
- **File**: `03-exercise-library.png`
- Scroll down to show the two-column layout with muscle diagram and exercise list
- Take screenshot showing both the muscle diagram and exercise list

#### 2.2 Muscle Selection Filter
- **File**: `04-muscle-filter-active.png`
- Click on a muscle group in the diagram (e.g., "Chest" or "Biceps")
- Wait for filter to apply
- Take screenshot showing filtered exercises with selected muscle highlighted

#### 2.3 Search and Equipment Filters
- **File**: `05-filters-active.png`
- Type a search term in the search box
- Select an equipment filter
- Take screenshot showing active filters and filtered results

### 3. Exercise Detail Modal

#### 3.1 Exercise Detail View
- **File**: `06-exercise-detail-modal.png`
- Click on any exercise in the list to open the detail modal
- Take screenshot of the modal showing exercise details (description, tags, equipment, YouTube link if available)

### 4. Plan Management Workflows

#### 4.1 Create Plan Form
- **File**: `07-create-plan-form.png`
- Click "+ Create New Plan" button
- Take screenshot of the empty plan form

#### 4.2 Plan Form with Exercises
- **File**: `08-plan-form-with-exercises.png`
- Add a plan name
- Add 2-3 exercises using the exercise picker
- Take screenshot showing the form with exercises added

#### 4.3 Plan Detail View
- **File**: `09-plan-detail.png`
- Save a plan (or use existing one)
- Click on a plan name to view details
- Take screenshot of the plan detail modal

#### 4.4 Edit Plan View
- **File**: `10-edit-plan.png`
- Click "Edit" button on a plan
- Take screenshot of the edit form with existing exercises

### 5. Random Workout Generation

#### 5.1 Quota Form Modal
- **File**: `11-quota-form.png`
- Click "Generate Random" button (requires at least one plan with exercises to exist)
- Take screenshot of the quota configuration form

#### 5.2 Quota Form with Selections
- **File**: `12-quota-form-configured.png`
- Add muscle group quotas (e.g., Chest: 2, Back: 2)
- Take screenshot showing configured quotas

### 6. Circuit Timer

#### 6.1 Circuit Timer View
- **File**: `13-circuit-timer.png`
- From a plan card, click the "Timer" button
- Take screenshot of the circuit timer interface

#### 6.2 Timer Running State
- **File**: `14-circuit-timer-running.png`
- Start the timer
- Take screenshot showing active timer with countdown

### 7. Theme Variations

#### 7.1 Light Theme
- **File**: `15-light-theme.png`
- Click the theme toggle to switch to light mode
- Take screenshot of main view in light theme

#### 7.2 Dark Theme
- **File**: `16-dark-theme.png`
- Toggle back to dark mode
- Take screenshot of main view in dark theme

### 8. Data Table View

#### 8.1 Raw Data Table
- **File**: `17-data-table.png`
- Scroll to bottom of page to show the raw CSV data table
- Take screenshot of the data table section

## Execution Steps

1. **Setup**:
   ```bash
   mkdir -p docs/screenshots
   ```

2. **Navigate and capture** each screenshot in sequence using Playwright MCP tools

3. **Cleanup**: Close the browser when done using `mcp__playwright__browser_close`

## Output Summary

After completion, provide a summary listing:
- Total screenshots captured
- Any screenshots that couldn't be captured (and why)
- Location of saved files

## Notes

- If certain views require specific data state (e.g., existing plans), create test data first
- For modals, ensure they're fully visible before taking screenshots
- Use descriptive filenames that match the documented sequence
- Screenshots should be PNG format for quality
