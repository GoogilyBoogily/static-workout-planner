# Implementation Plan: Exercise List with Search and Tag Filters

**Branch**: `002-exercise-list-filters` | **Date**: 2025-11-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-exercise-list-filters/spec.md`

## Summary

Add exercise list view with real-time search and tag-based filtering to the workout planner application. Users will be able to search exercises by name and filter by muscle groups using clickable tag pills. The feature extends the existing CSV upload functionality by parsing a "Muscle Group" column and displaying exercises in a dedicated list view (separate from the data table) with filters positioned above the list.

**Technical Approach**: Extend existing React component with new state management for filters, create reusable filter UI components (search input + tag pills), and implement client-side filtering logic using existing PapaParse CSV data.

## Technical Context

**Language/Version**: JavaScript ES6+ with React 18 (JSX)
**Primary Dependencies**: React 18, PapaParse (existing), Vite (existing)
**Storage**: Client-side only (no persistence beyond session state)
**Testing**: Manual browser testing (automated tests not required per constitution)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page web application
**Performance Goals**: Filter updates <1 second, support up to 500 exercises without degradation
**Constraints**: Client-side only, no backend, session-based state (resets on page reload)
**Scale/Scope**: Single feature addition to existing App.jsx, ~2-3 new components, minimal bundle size impact

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Compliance

✅ **I. Bun-First Development**
- Status: COMPLIANT
- Evidence: Package management uses `bun install`, dev commands use `bun dev`, no npm/yarn references

✅ **II. Performance by Default**
- Status: COMPLIANT
- Evidence: Spec defines <1 sec filter update requirement, supports 500 exercises, uses client-side filtering (no network calls), will implement minimal re-renders via React memoization if needed

✅ **III. Component Simplicity**
- Status: COMPLIANT
- Evidence: Extends existing single-component architecture, adds 2-3 small focused components (SearchInput, TagFilter, ExerciseList), uses React built-in hooks only, no additional state management library

✅ **IV. Vite-Optimized Build Pipeline**
- Status: COMPLIANT
- Evidence: No build config changes required, uses existing Vite setup, no new plugins needed

✅ **V. Type Safety & Quality Tooling**
- Status: COMPLIANT
- Evidence: Will use JSDoc comments for complex functions, maintain existing code style, address all console warnings

### Gates

- ✅ **Gate 1**: No new external dependencies required (uses existing React, PapaParse)
- ✅ **Gate 2**: No violation of component simplicity (small, focused components)
- ✅ **Gate 3**: Performance requirements documented and measurable
- ✅ **Gate 4**: Bun-exclusive commands in all documentation

**Result**: ALL GATES PASSED - Proceed to Phase 0

---

### Post-Design Re-Check (Phase 1 Complete)

✅ **I. Bun-First Development**
- Status: COMPLIANT
- Design: No new dependencies, all commands use Bun, documentation updated in CLAUDE.md

✅ **II. Performance by Default**
- Status: COMPLIANT
- Design: useMemo for derived state, <50ms filtering expected for 500 exercises, no unnecessary re-renders

✅ **III. Component Simplicity**
- Status: COMPLIANT
- Design: 3 small focused components (SearchInput, TagFilter, ExerciseList), controlled component pattern, no additional libraries

✅ **IV. Vite-Optimized Build Pipeline**
- Status: COMPLIANT
- Design: No build changes, no new plugins, leverages existing Vite setup

✅ **V. Type Safety & Quality Tooling**
- Status: COMPLIANT
- Design: JSDoc comments planned for complex functions, prop contracts documented, error boundaries considered

**Final Result**: ALL PRINCIPLES MAINTAINED - Ready for Phase 2 (Tasks)

## Project Structure

### Documentation (this feature)

```text
specs/002-exercise-list-filters/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Spec quality checklist (existing)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── App.jsx              # Main component - MODIFIED (add filter orchestration)
├── App.css              # Main styles - MODIFIED (add filter styles)
├── components/          # NEW DIRECTORY
│   ├── ExerciseList.jsx # NEW - Displays filtered exercises
│   ├── ExerciseList.css # NEW - Exercise list styles
│   ├── SearchInput.jsx  # NEW - Search filter component
│   ├── SearchInput.css  # NEW - Search input styles
│   ├── TagFilter.jsx    # NEW - Tag pill filter component
│   └── TagFilter.css    # NEW - Tag filter styles
├── index.css            # Global styles - NO CHANGES
└── main.jsx             # Entry point - NO CHANGES

public/
└── sample-workouts.csv  # MODIFIED - Add "Muscle Group" column

vite.config.js           # NO CHANGES
package.json             # NO CHANGES
```

**Structure Decision**: Single-page application structure with new `components/` directory. Follows existing flat structure but introduces component organization for the new filter UI. Maintains co-location of component files with their styles (Component Simplicity principle). No new build configuration or routing needed.

## Complexity Tracking

**No constitutional violations - this section is empty.**

All principles are followed:
- Uses existing dependencies (PapaParse, React)
- Simple component architecture with clear data flow
- Client-side only, no complex state management
- Performance targets defined and achievable
- Bun-first approach maintained

