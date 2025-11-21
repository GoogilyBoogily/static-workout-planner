# Feature 005 Testing Guide

## Quick Start

```bash
# 1. Start the development server
bun dev

# 2. Open browser
http://localhost:5173

# 3. Open DevTools (F12) for performance monitoring
```

---

## Pre-Testing Setup

### Create Sample Data
To test random generation, you need exercises in the pool:

```
1. Load default exercises (should happen automatically)
2. Create Plan: "Sample Chest Day"
   - Add: Bench Press (Chest) - 4 sets, 8-10 reps
   - Add: Incline Press (Chest) - 3 sets, 10-12 reps
   - Add: Cable Flyes (Chest) - 3 sets, 12-15 reps
   - Add: Dumbbell Press (Chest) - 3 sets, 8-10 reps
   - Add: Push-ups (Chest) - 3 sets, AMRAP

3. Create Plan: "Sample Leg Day"
   - Add: Squats (Legs) - 5 sets, 5 reps
   - Add: Leg Press (Legs) - 4 sets, 10 reps
   - Add: Lunges (Legs) - 3 sets, 12 reps
   - Add: Leg Curl (Legs) - 3 sets, 10 reps
   - Add: Calf Raises (Legs) - 3 sets, 15 reps

4. Create Plan: "Sample Shoulder Day"
   - Add: Military Press (Shoulders) - 4 sets, 8 reps
   - Add: Lateral Raises (Shoulders) - 3 sets, 12 reps
   - Add: Face Pulls (Shoulders) - 3 sets, 15 reps
```

Now you have a populated exercise pool!

---

## Performance Testing (T080)

### Method: Use Chrome DevTools Performance Tab

#### SC-001: Full Workflow (<30s)
```
1. Open DevTools → Performance tab
2. Click Record
3. Perform workflow:
   - Click "Generate Random"
   - Add 5 quotas
   - Click "Generate Workout"
   - View plan
   - Click "Save Plan"
4. Stop recording
5. Check total time in timeline
```
**Expected**: <30 seconds (should be <5s in practice)

#### SC-003: Random Generation (<2s)
```
1. Open DevTools → Console
2. Paste and run:

   console.time('generation');
   // Manually click "Generate Workout" here
   console.timeEnd('generation');

3. Check console output
```
**Expected**: <2000ms (should be <100ms in practice)

#### SC-004: Pin Toggle (<100ms)
```
1. Open DevTools → Performance tab
2. Enable "Screenshots" option
3. Click Record
4. Click pin button once
5. Stop recording
6. Measure time between click and visual update
```
**Expected**: <100ms (should be <20ms in practice)

#### SC-008: Template Load (<10s)
```
1. Create template with 10 quotas
2. Clear form
3. Open DevTools → Console
4. Run:

   console.time('template-load');
   // Click "Load" on template
   console.timeEnd('template-load');

5. Check console output
```
**Expected**: <10000ms (should be <50ms in practice)

---

## Functional Testing (T081)

### Priority 1: Test Generation Flow
**Time**: ~5 minutes

```
✓ Generate workout with valid quotas
✓ Verify exact exercise counts
✓ Check badge appears
✓ Save and reload
✓ Verify persistence
```

### Priority 2: Test Reroll
**Time**: ~3 minutes

```
✓ Reroll single exercise
✓ Verify others unchanged
✓ Reroll 4 times (check history)
✓ Test disabled state
✓ Test "R" keyboard shortcut
```

### Priority 3: Test Pin & Regenerate
**Time**: ~5 minutes

```
✓ Pin 2-3 exercises
✓ Regenerate workout
✓ Verify pins preserved
✓ Check pin status persists
✓ Test "P" and "G" shortcuts
✓ Test all-pinned disabled state
```

### Priority 4: Test Templates
**Time**: ~4 minutes

```
✓ Save template
✓ Load template
✓ Delete template
✓ Verify persistence (close/reopen)
✓ Check empty state
```

---

## Code Review Fixes Checklist

### Quick Verification (5 minutes)

**Critical Fixes**:
- [ ] C1: Open sample data CSV, verify it loads (tags[] support)
- [ ] C2: Create exercise manually, see Muscle Group dropdown
- [ ] C3: Reroll works (auto-fixed by C1)

**High Priority**:
- [ ] H1: Generation shows "Generating..." button state
- [ ] H2: Regenerate 5 times, check React DevTools (no orphaned pins)
- [ ] H3: No console errors during pool building
- [ ] H4: Reroll, save, reload (history cleared)
- [ ] H5: See warnings vs errors in quota form

**Medium Priority**:
- [ ] M1: Inspect pin button in DevTools (role="switch")
- [ ] M3: Try adding same tag twice (prevented)

**Low Priority**:
- [ ] L1: Code has REROLL_HISTORY_SIZE constant (check source)
- [ ] L2: Template dates match plan dates
- [ ] L4: Dropdowns show "(X available)"
- [ ] L5: Regenerate button in header (top of exercises)
- [ ] L6: Press R, P, G keys (shortcuts work)

---

## Regression Testing

### Quick Smoke Test (3 minutes)
```
✓ Create manual plan → works
✓ Search exercises → works
✓ Click exercise → YouTube modal opens
✓ Click muscle diagram → filters work
✓ Add exercise to plan → works
✓ Save plan → persists
```

---

## Known Limitations (Not Bugs)

1. **Reroll history not persisted** - Intentional design, cleared on save
2. **window.confirm() used** - Q1 fix deferred as optional
3. **No custom hook extraction** - Q3 fix deferred as optional

---

## Debugging Tips

### Check localStorage Data
```javascript
// In console:
console.log('Plans:', JSON.parse(localStorage.getItem('workout-plans')))
console.log('Templates:', JSON.parse(localStorage.getItem('workout-quota-templates')))
```

### Check Exercise Pool
```javascript
// Add to App.jsx temporarily:
console.log('Exercise Pool:', exercisePool)
```

### Check Component State
```
1. Install React DevTools extension
2. Open Components tab
3. Select PlanForm component
4. Inspect: exercises, pinStatus, rerollHistory
```

### Clear All Data (Reset)
```javascript
// In console:
localStorage.clear()
location.reload()
```

---

## Common Issues & Solutions

### Issue: Generate button disabled
**Solution**: Create at least one workout plan with exercises first

### Issue: Reroll button disabled
**Solution**: Tag must have 2+ exercises in pool

### Issue: Can't add more quota tags
**Solution**: All tags already added (working as designed)

### Issue: Keyboard shortcuts not working
**Solution**: Click on page (not in input field) to focus

### Issue: Pin status not saving
**Solution**: Click "Save Plan" after pinning

---

## Testing Priorities

If short on time, test in this order:

1. **MUST TEST** (10 min):
   - Generation flow (US1)
   - Pin & regenerate (US3)
   - Critical fixes (C1, C2)

2. **SHOULD TEST** (5 min):
   - Reroll (US2)
   - Templates (US4)
   - High priority fixes (H1-H5)

3. **NICE TO TEST** (5 min):
   - Keyboard shortcuts
   - Accessibility
   - Performance measurements

---

## Success Criteria

**Ready to Ship** if:
- ✅ All User Stories (1-4) work correctly
- ✅ No critical bugs found
- ✅ Performance targets met
- ✅ Backward compatibility confirmed
- ✅ No regressions in features 001-004

**Needs Work** if:
- ❌ Any User Story broken
- ❌ Critical bugs found
- ❌ Data loss or corruption
- ❌ Previous features broken

---

## After Testing

1. Fill out `test-results.md`
2. Report any issues found
3. Mark T080 and T081 complete in tasks.md
4. Create GitHub issues for any bugs
5. Sign off on test results

---

## Questions?

Check:
- `spec.md` - Full feature specification
- `plan.md` - Implementation plan
- `tasks.md` - Task breakdown
- `CLAUDE.md` - Project documentation
