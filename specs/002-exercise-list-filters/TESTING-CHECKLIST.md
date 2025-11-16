# Testing Checklist: Exercise List Filters (002-exercise-list-filters)

## Pre-Testing Setup

- [X] Dev server running at http://localhost:5173
- [X] Sample data CSV available (`/public/sample-workouts.csv`)
- [X] Performance test CSV available (`/public/performance-test-500.csv` - 420 exercises)
- [X] No console errors in dev mode
- [X] No ESLint warnings

---

## User Story 1: Browse All Exercises

### Scenario 1.1: Display all exercises from CSV
- [ ] Load sample data using "Load Sample Data" button
- [ ] Verify all exercises appear in the exercise list
- [ ] Verify exercise names are visible
- [ ] Verify muscle group tags are displayed for each exercise
- [ ] Verify list is readable and properly formatted

### Scenario 1.2: Scroll through list
- [ ] Load sample data
- [ ] Scroll through the entire exercise list
- [ ] Verify all exercises remain readable
- [ ] Verify formatting is consistent throughout

### Scenario 1.3: Empty state handling
- [ ] Refresh page (no data loaded)
- [ ] Verify helpful message appears: "Upload a CSV file or load sample data to get started"
- [ ] Upload empty CSV file (if possible)
- [ ] Verify appropriate message is displayed

**Status**: ✅ PASS / ❌ FAIL / ⏸️ SKIP

---

## User Story 2: Search Exercises by Name

### Scenario 2.1: Search by partial name
- [ ] Load sample data
- [ ] Type "bench" into the search field
- [ ] Verify only exercises containing "bench" appear (case-insensitive)
- [ ] Verify muscle group tags still display correctly

### Scenario 2.2: Clear search field
- [ ] Enter search text (e.g., "press")
- [ ] Verify filtered results appear
- [ ] Clear the search field (click × button or delete all text)
- [ ] Verify all exercises are shown again

### Scenario 2.3: No matching results
- [ ] Type text that matches no exercises (e.g., "zzzzz")
- [ ] Verify message appears: "No exercises match your current filters"
- [ ] Verify message is clearly visible

### Scenario 2.4: Real-time filtering
- [ ] Start typing slowly (e.g., "s", "sq", "squ", "squa", "squat")
- [ ] Verify list updates after each character typed
- [ ] Verify filtering happens in real-time without lag

### Scenario 2.5: Special characters
- [ ] Search for text with special characters (e.g., "press-up", "bent/row")
- [ ] Verify characters are treated as literal text, not regex
- [ ] Verify search works correctly

**Status**: ✅ PASS / ❌ FAIL / ⏸️ SKIP

---

## User Story 3: Filter by Tags/Muscle Groups

### Scenario 3.1: Single tag selection
- [ ] Load sample data
- [ ] Click on the "Chest" tag pill
- [ ] Verify only exercises with "Chest" tag are shown
- [ ] Verify the "Chest" pill shows active state (purple background)

### Scenario 3.2: Multiple tag selection (OR logic)
- [ ] Select "Chest" tag
- [ ] Additionally select "Legs" tag
- [ ] Verify exercises with EITHER "Chest" OR "Legs" are shown
- [ ] Verify both pills show active state

### Scenario 3.3: Deselect all tags
- [ ] Select one or more tags
- [ ] Click each selected tag to deselect
- [ ] Verify all exercises are shown again
- [ ] Verify no pills show active state

### Scenario 3.4: Available tags from CSV
- [ ] Load sample data
- [ ] Verify tag filter section appears
- [ ] Verify all unique muscle groups from CSV appear as clickable pills
- [ ] Verify tags are sorted alphabetically

### Scenario 3.5: Sync with Muscle Diagram
- [ ] Click on a muscle in the MuscleDiagram component
- [ ] Verify corresponding tag pill becomes active
- [ ] Click on a tag pill
- [ ] Verify corresponding muscle highlights in diagram
- [ ] Verify both UIs stay synchronized

**Status**: ✅ PASS / ❌ FAIL / ⏸️ SKIP

---

## User Story 4: Combined Search and Tag Filters

### Scenario 4.1: Search + Tag filters (AND logic)
- [ ] Enter search text (e.g., "press")
- [ ] Select a tag (e.g., "Shoulders")
- [ ] Verify only exercises matching BOTH criteria appear
- [ ] Verify filter indicator shows both active filters

### Scenario 4.2: No results with combined filters
- [ ] Enter search text: "squat"
- [ ] Select tag: "Chest"
- [ ] Verify message appears: "No exercises match your current filters"
- [ ] Verify message is appropriate for combined filters

### Scenario 4.3: Remove search, keep tags
- [ ] Apply both search and tag filters
- [ ] Clear only the search text
- [ ] Verify results update to show all exercises with selected tags
- [ ] Verify tag filter remains active

### Scenario 4.4: Remove tags, keep search
- [ ] Apply both search and tag filters
- [ ] Deselect all tags (keep search text)
- [ ] Verify results update to show all exercises matching search
- [ ] Verify search filter remains active

### Scenario 4.5: Clear All Filters button
- [ ] Apply both search and tag filters
- [ ] Verify "Clear All Filters" button appears
- [ ] Click "Clear All Filters"
- [ ] Verify search field is cleared
- [ ] Verify all tags are deselected
- [ ] Verify all exercises are shown

**Status**: ✅ PASS / ❌ FAIL / ⏸️ SKIP

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Press Tab to navigate through filter controls
- [ ] Verify focus indicators are visible on:
  - Search input field
  - Clear search button (×)
  - Tag filter pills
  - Clear All Filters button
- [ ] Use Tab/Shift+Tab to move between controls
- [ ] Press Enter or Space on tag pills to toggle selection
- [ ] Press Enter in search field (verify no errors)
- [ ] Navigate to "Clear All Filters" button and activate with Enter

### Screen Reader Support (if available)
- [ ] Enable screen reader
- [ ] Verify search input has label: "Search exercises by name"
- [ ] Verify tag pills announce state (aria-pressed)
- [ ] Verify "Clear All Filters" button is announced
- [ ] Verify filter indicator content is read properly

### Semantic HTML
- [ ] Verify search input uses `type="search"`
- [ ] Verify tag pills use `<button>` elements
- [ ] Verify proper heading hierarchy in components

**Status**: ✅ PASS / ❌ FAIL / ⏸️ SKIP

---

## Performance Testing

### Large Dataset Performance
- [ ] Upload `/public/performance-test-500.csv` (420 exercises)
- [ ] Verify page loads without freezing
- [ ] Type in search field
- [ ] Verify filtering completes in <1 second (ideally <50ms)
- [ ] Select multiple tags
- [ ] Verify filtering remains fast
- [ ] Combine search + tags with large dataset
- [ ] Verify no noticeable lag

### Browser Console
- [ ] Open browser DevTools console
- [ ] Verify no console errors
- [ ] Verify no console warnings
- [ ] Load large dataset
- [ ] Filter and search
- [ ] Verify no performance warnings

**Status**: ✅ PASS / ❌ FAIL / ⏸️ SKIP

---

## Responsive Design Testing

### Desktop (1200px+)
- [ ] Verify filter section displays properly
- [ ] Verify tag pills wrap nicely
- [ ] Verify search input is centered
- [ ] Verify "Clear All Filters" button is visible

### Tablet (768px - 1199px)
- [ ] Resize browser to tablet width
- [ ] Verify filter section remains usable
- [ ] Verify tag pills wrap appropriately
- [ ] Verify touch targets are large enough

### Mobile (< 768px)
- [ ] Resize browser to mobile width
- [ ] Verify filter section is mobile-friendly
- [ ] Verify tag pills are easily tappable
- [ ] Verify search input takes full width
- [ ] Verify filter indicator stacks vertically
- [ ] Verify "Clear All Filters" button is full width

**Status**: ✅ PASS / ❌ FAIL / ⏸️ SKIP

---

## Edge Cases

### Missing or Empty Data
- [ ] CSV with empty "Muscle Group" column
- [ ] Verify those exercises are excluded from list
- [ ] CSV with some empty muscle groups
- [ ] Verify only exercises with muscle groups appear

### Tag Parsing
- [ ] Exercise with comma-separated tags: "Chest, Shoulders, Triceps"
- [ ] Verify tags are split correctly
- [ ] Verify whitespace is trimmed from each tag
- [ ] Verify all three tags appear in tag filter

### Special Characters in Search
- [ ] Search with quotes: `"bench"`
- [ ] Search with slashes: `press/row`
- [ ] Search with regex metacharacters: `bench.*press`
- [ ] Verify all characters are treated literally

**Status**: ✅ PASS / ❌ FAIL / ⏸️ SKIP

---

## Constitution Compliance

### Bun-First Development
- [X] No npm/yarn commands in code or docs
- [X] All package management uses Bun
- [X] Scripts use `bun` commands

### Performance by Default
- [X] Bundle size not significantly increased
- [X] Used `useMemo` for filtering optimization
- [X] No unnecessary re-renders
- [X] CSS is minimal and optimized

### Component Simplicity
- [X] No new external dependencies added
- [X] Components are focused and simple
- [X] Clear props contracts
- [X] No complex state management library

### Vite-Optimized Build
- [X] No custom Vite configuration added
- [X] Uses Vite's default optimizations
- [X] HMR works correctly during development

### Type Safety & Quality
- [X] No console.log statements in production code
- [X] No ESLint warnings
- [X] Components have clear prop documentation
- [X] Error handling is present

**Status**: ✅ PASS / ❌ FAIL / ⏸️ SKIP

---

## Final Verification

- [ ] All acceptance scenarios pass
- [ ] No regressions in existing functionality
- [ ] CSV upload still works correctly
- [ ] MuscleDiagram still works correctly
- [ ] Exercise detail modal still works correctly
- [ ] Workout plans functionality still works

---

## Test Summary

**Total Scenarios**: ~45
**Passed**: ___
**Failed**: ___
**Skipped**: ___

**Overall Status**: ✅ READY FOR PRODUCTION / ⚠️ NEEDS FIXES / ❌ NOT READY

**Notes**:
[Add any notes about test results, issues found, or recommendations]

---

## Performance Metrics

**Bundle Size**: [Check with `bun run build`]
**Initial Load Time**: ___ms
**Filter Response Time** (420 exercises): ___ms
**Memory Usage**: [Check DevTools Performance tab]

---

**Tester**: _____________
**Date**: _____________
**Environment**: Chrome / Firefox / Safari / Edge (version: ___)
