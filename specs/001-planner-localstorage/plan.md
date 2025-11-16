# Implementation Plan: Workout Planner with localStorage Persistence

**Branch**: `001-planner-localstorage` | **Date**: 2025-11-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-planner-localstorage/spec.md`

## Summary

Create an interactive workout planner that allows users to create, edit, and manage workout plans with exercises (sets, reps, weights, rest). All data persists in browser localStorage, enabling offline-first functionality with no backend required. Users can create unlimited plans and exercises (limited only by browser storage quota), reorder exercises with up/down buttons, and view plans with relative timestamps ("2 hours ago") for easy scanning.

**Technical Approach**: React-based single-page application using React hooks for state management, crypto.randomUUID() for entity IDs, localStorage API for persistence, and simple form validation. No external state management library required.

## Technical Context

**Language/Version**: JavaScript ES6+ with React 18 (JSX)
**Primary Dependencies**: React 18 (existing), no new dependencies required
**Storage**: Browser localStorage (JSON format, client-side only)
**Testing**: Manual browser testing (automated tests not required per constitution)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Single-page web application
**Performance Goals**: Plan list loads <500ms with 50 plans, localStorage operations <100ms, plan creation with 5 exercises <2 minutes
**Constraints**: Client-side only (no backend), localStorage quota (typically 5-10MB), no artificial limits on plans/exercises per plan
**Scale/Scope**: Single-user local storage, ~1000+ plans theoretical capacity, mobile-responsive (375px+ viewports)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Compliance

✅ **I. Bun-First Development**
- Status: COMPLIANT
- Evidence: No new package dependencies, uses existing React + Vite setup, all documentation will use Bun commands

✅ **II. Performance by Default**
- Status: COMPLIANT
- Evidence: Performance goals defined in spec (SC-004: <500ms list load, SC-005: <100ms operations), localStorage is fast native API, no heavy computation or network calls

✅ **III. Component Simplicity**
- Status: COMPLIANT
- Evidence: Simple CRUD interface, uses React built-in hooks (useState for plans state, modal state), no external state management library, straightforward form components

✅ **IV. Vite-Optimized Build Pipeline**
- Status: COMPLIANT
- Evidence: No build configuration changes needed, uses existing Vite setup, crypto.randomUUID() is standard web API

✅ **V. Type Safety & Quality Tooling**
- Status: COMPLIANT
- Evidence: Will use JSDoc comments for localStorage utilities and component props, form validation for user inputs, error boundaries for localStorage errors

### Gates

- ✅ **Gate 1**: No new external dependencies (uses browser APIs only: localStorage, crypto.randomUUID())
- ✅ **Gate 2**: No violation of component simplicity (straightforward CRUD forms and lists)
- ✅ **Gate 3**: Performance requirements documented and achievable
- ✅ **Gate 4**: Bun-exclusive commands in all documentation
- ✅ **Gate 5**: No backend complexity (client-side only)

**Result**: ALL GATES PASSED - Proceed to Phase 0

---

### Post-Design Re-Check (Phase 1 Complete)

✅ **I. Bun-First Development**
- Status: COMPLIANT
- Design: No new dependencies introduced, uses browser APIs only (localStorage, crypto.randomUUID()), all commands use Bun, documentation updated in CLAUDE.md with new active technologies

✅ **II. Performance by Default**
- Status: COMPLIANT
- Design: localStorage operations are fast native APIs (<10ms read, <50ms write per research), no heavy computation, plan list sorting is O(n log n) for <1000 plans (negligible), component rendering optimized (controlled components, conditional rendering)

✅ **III. Component Simplicity**
- Status: COMPLIANT
- Design: 6 simple components (PlanList, PlanForm, PlanDetail, ExerciseForm + 2 utility), React useState for all state management (no external library), 3 utility modules (localStorage, dateFormat, validation) ~50-100 lines each, clear single responsibility

✅ **IV. Vite-Optimized Build Pipeline**
- Status: COMPLIANT
- Design: No build changes, no new plugins, leverages existing Vite setup, crypto.randomUUID() is standard web API (no polyfill), all browser APIs are native

✅ **V. Type Safety & Quality Tooling**
- Status: COMPLIANT
- Design: JSDoc comments planned for utility modules (PlansStorage, formatRelativeTime, validateExercise), component prop contracts documented in component-contracts.md, form validation prevents invalid data submission, error boundaries for localStorage errors

**Final Result**: ALL PRINCIPLES MAINTAINED - Ready for Phase 2 (Tasks)

**Design Artifacts Generated**:
- research.md: Technical decisions for localStorage, UUID, date formatting, validation, reordering, cross-tab sync
- data-model.md: Workout Plan and Exercise entities, state model, validation rules, data flow
- contracts/component-contracts.md: Component interfaces, props, behaviors for all 6 components + 3 utilities
- quickstart.md: Developer guide, usage instructions, testing checklist, troubleshooting

## Project Structure

### Documentation (this feature)

```text
specs/001-planner-localstorage/
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
├── App.jsx              # Main component - MODIFIED (add plan management state)
├── App.css              # Main styles - MODIFIED (plan list, form styles)
├── components/          # NEW DIRECTORY
│   ├── PlanList.jsx     # NEW - Display all saved plans
│   ├── PlanList.css     # NEW - Plan list styles
│   ├── PlanForm.jsx     # NEW - Create/edit plan form
│   ├── PlanForm.css     # NEW - Form styles
│   ├── PlanDetail.jsx   # NEW - View plan details (P5)
│   ├── PlanDetail.css   # NEW - Detail view styles
│   ├── ExerciseForm.jsx # NEW - Add/edit exercises within plan
│   └── ExerciseForm.css # NEW - Exercise form styles
├── utils/               # NEW DIRECTORY
│   ├── localStorage.js  # NEW - localStorage read/write/error handling utilities
│   ├── dateFormat.js    # NEW - Relative date formatting ("2 hours ago")
│   └── validation.js    # NEW - Form validation utilities
├── index.css            # Global styles - MINOR MODIFICATIONS
└── main.jsx             # Entry point - NO CHANGES

public/                  # NO CHANGES (no sample data for this feature)

vite.config.js           # NO CHANGES
package.json             # NO CHANGES (no new dependencies)
```

**Structure Decision**: Extends existing single-page application with new components for plan management. Creates `components/` directory for React components (plan list, forms, detail views) and `utils/` for localStorage/formatting utilities. Follows co-location pattern (component + CSS files together). All logic stays client-side with no backend dependencies.

## Complexity Tracking

**No constitutional violations - this section is empty.**

All principles are followed:
- No new package dependencies (uses browser APIs)
- Simple component architecture (forms, lists, detail views)
- Client-side only, React hooks for state management
- Performance targets defined and achievable
- Bun-first approach maintained

