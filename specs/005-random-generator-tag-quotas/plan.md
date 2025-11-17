# Implementation Plan: Random Exercise Generator with Tag Quotas

**Branch**: `002-random-generator-tag-quotas` | **Date**: 2025-11-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-random-generator-tag-quotas/spec.md`

## Summary

Create a random workout generator that allows users to specify tag quotas (e.g., "Chest: 3, Legs: 2") to generate balanced workout plans by randomly selecting exercises from their existing exercise pool. Users can reroll individual exercises, pin favorites to lock them during regeneration, and save quota templates for quick reuse. All functionality extends feature 001's localStorage-based workout planner with no new dependencies.

**Technical Approach**: Extend existing React application with random generation UI (modal or inline form), quota configuration state management, randomization utilities using Math.random() with Fisher-Yates shuffle, pin status stored in workout plan objects, and quota templates in separate localStorage key. All UI components follow existing patterns from feature 001.

## Technical Context

**Language/Version**: JavaScript ES6+ with React 18 (JSX)
**Primary Dependencies**: React 18 (existing), no new dependencies required
**Storage**: Browser localStorage (JSON format) - extends feature 001 structure with pin metadata and new key for quota templates
**Testing**: Manual browser testing (automated tests not required per constitution)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Single-page web application (extends feature 001)
**Performance Goals**: Random generation <2s (SC-003), quota template load <10s (SC-008), pin toggle <100ms (SC-004), full generation workflow <30s (SC-001)
**Constraints**: Client-side only (no backend), localStorage quota (typically 5-10MB), depends on feature 001 exercise pool, no duplicates within generated plan (SC-007)
**Scale/Scope**: Single-user local storage, unlimited quota templates (localStorage limited), reuses feature 001's ~1000+ plan capacity, mobile-responsive (375px+ viewports)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Compliance

✅ **I. Bun-First Development**
- Status: COMPLIANT
- Evidence: No new package dependencies, extends existing React + Vite setup, all documentation uses Bun commands

✅ **II. Performance by Default**
- Status: COMPLIANT
- Evidence: Performance goals defined in spec (SC-001: <30s generation, SC-003: <2s reroll, SC-004: <100ms pin toggle, SC-008: <10s template load), randomization uses efficient algorithms (Fisher-Yates O(n)), no heavy computation, extends existing localStorage patterns

✅ **III. Component Simplicity**
- Status: COMPLIANT
- Evidence: Extends feature 001 components (PlanForm, PlanList), adds simple random generation UI (quota input form, reroll buttons, pin toggles), uses React built-in hooks (useState for quotas/templates), no external state management library, straightforward randomization logic

✅ **IV. Vite-Optimized Build Pipeline**
- Status: COMPLIANT
- Evidence: No build configuration changes, uses existing Vite setup, Math.random() and array utilities are standard JavaScript APIs

✅ **V. Type Safety & Quality Tooling**
- Status: COMPLIANT
- Evidence: Will use JSDoc comments for randomization utilities and quota template storage, form validation for quota inputs (prevent negative numbers), error boundaries for localStorage errors

### Gates

- ✅ **Gate 1**: No new external dependencies (uses standard JavaScript APIs: Math.random(), Array methods)
- ✅ **Gate 2**: No violation of component simplicity (quota form, reroll/pin UI elements extend existing patterns)
- ✅ **Gate 3**: Performance requirements documented and achievable
- ✅ **Gate 4**: Bun-exclusive commands in all documentation
- ✅ **Gate 5**: No backend complexity (client-side only, extends feature 001 localStorage)

**Result**: ALL GATES PASSED - Proceed to Phase 0

---

### Post-Design Re-Check (Phase 1 Complete)

✅ **I. Bun-First Development**
- Status: COMPLIANT
- Design: No new dependencies introduced, uses standard JavaScript APIs only (Math.random(), Array methods, crypto.randomUUID()), all commands use Bun, documentation updated in CLAUDE.md with new active technologies

✅ **II. Performance by Default**
- Status: COMPLIANT
- Design: Randomization uses Fisher-Yates shuffle (O(n) for n exercises, <1ms typical), localStorage operations are fast native APIs (<10ms read, <50ms write), quota validation is O(n) where n = number of quotas (~5-10 typical), component rendering optimized (controlled components, conditional reroll/pin UI only for generated plans)

✅ **III. Component Simplicity**
- Status: COMPLIANT
- Design: 2 new simple components (QuotaForm ~150 lines, QuotaTemplateManager ~100 lines), extends 2 existing components (PlanList +20 lines, PlanForm +100 lines), 2 utility modules (randomGenerator.js ~150 lines, quotaTemplates.js ~50 lines), React useState for all state management (no external library), clear single responsibility for each module

✅ **IV. Vite-Optimized Build Pipeline**
- Status: COMPLIANT
- Design: No build changes, no new plugins, leverages existing Vite setup, Math.random() and crypto.randomUUID() are standard web APIs (no polyfill), all browser APIs are native

✅ **V. Type Safety & Quality Tooling**
- Status: COMPLIANT
- Design: JSDoc comments planned for utility modules (randomGenerator, quotaTemplates, validation extensions), component prop contracts documented in component-contracts.md, form validation prevents invalid quota inputs (negative numbers, non-existent tags), error boundaries for localStorage errors (inherited from feature 001)

**Final Result**: ALL PRINCIPLES MAINTAINED - Ready for Phase 2 (Tasks)

**Design Artifacts Generated**:
- research.md: Technical decisions for randomization algorithm, exercise pool source, tag detection, pin storage, reroll history, quota templates, validation, regenerate workflow, UI layout, sets/reps inheritance, plan naming
- data-model.md: QuotaTemplate and Exercise Pool entities, WorkoutPlan extensions (pinStatus, isGenerated, generationTimestamp), state model, validation rules, data flow, localStorage structure
- contracts/component-contracts.md: Component interfaces, props, behaviors for 2 new components (QuotaForm, QuotaTemplateManager), modifications to 2 existing components (PlanList, PlanForm), 2 new utilities (randomGenerator.js, quotaTemplates.js), extensions to 2 existing utilities (validation.js, localStorage.js)
- quickstart.md: Developer guide, usage instructions, testing checklist (manual, performance, integration), troubleshooting, performance benchmarks

## Project Structure

### Documentation (this feature)

```text
specs/002-random-generator-tag-quotas/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── component-contracts.md
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Spec quality checklist (existing)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── App.jsx              # Main component - MODIFIED (add random generation trigger)
├── App.css              # Main styles - MODIFIED (quota form, pin/reroll button styles)
├── components/          # FROM FEATURE 001
│   ├── PlanList.jsx     # MODIFIED - Add "Generate Random Workout" button
│   ├── PlanList.css     # MINOR MODIFICATIONS
│   ├── PlanForm.jsx     # MODIFIED - Add reroll/pin UI, integrate QuotaForm
│   ├── PlanForm.css     # MODIFIED - Reroll/pin button styles
│   ├── PlanDetail.jsx   # NO CHANGES (from feature 001)
│   ├── PlanDetail.css   # NO CHANGES
│   ├── ExerciseForm.jsx # NO CHANGES (from feature 001)
│   ├── ExerciseForm.css # NO CHANGES
│   ├── QuotaForm.jsx    # NEW - Tag quota input form
│   ├── QuotaForm.css    # NEW - Quota form styles
│   ├── QuotaTemplateManager.jsx # NEW - Save/load quota templates
│   └── QuotaTemplateManager.css # NEW - Template manager styles
├── utils/               # FROM FEATURE 001
│   ├── localStorage.js  # MODIFIED - Backward compatibility for new WorkoutPlan properties (quotaTemplates.js handles quota templates)
│   ├── dateFormat.js    # NO CHANGES (from feature 001)
│   ├── validation.js    # MODIFIED - Add quota validation
│   ├── randomGenerator.js # NEW - Random exercise selection logic
│   └── quotaTemplates.js  # NEW - Quota template CRUD utilities
├── index.css            # Global styles - MINOR MODIFICATIONS
└── main.jsx             # Entry point - NO CHANGES

public/                  # NO CHANGES
vite.config.js           # NO CHANGES
package.json             # NO CHANGES (no new dependencies)
```

**Structure Decision**: Extends existing feature 001 single-page application. Adds 2 new components (QuotaForm, QuotaTemplateManager) for quota configuration UI, 2 new utilities (randomGenerator.js, quotaTemplates.js) for generation logic and template storage. Modifies existing PlanList (add "Generate Random Workout" button) and PlanForm (add reroll/pin UI). Follows co-location pattern (component + CSS). All logic stays client-side with no backend dependencies.

## Complexity Tracking

**No constitutional violations - this section is empty.**

All principles are followed:
- No new package dependencies (uses standard JavaScript Math.random() and Array methods)
- Simple component architecture (quota forms, reroll/pin buttons extend existing patterns)
- Client-side only, React hooks for state management
- Performance targets defined and achievable with simple randomization algorithms
- Bun-first approach maintained
