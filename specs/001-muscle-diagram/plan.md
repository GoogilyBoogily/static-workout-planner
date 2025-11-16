# Implementation Plan: Interactive SVG Muscle Diagram

**Branch**: `001-muscle-diagram` | **Date**: 2025-11-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-muscle-diagram/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add an interactive SVG-based muscle diagram showing front and back views of the human body with 12+ major muscle groups. Users can hover to see tooltips (desktop) or tap to select (mobile) muscle regions, with selections persisting across CSV file loads to filter workout exercises by targeted muscle groups. Technical approach uses inline SVG with React state management for hover/selection states, integrated with existing CSV parsing infrastructure.

## Technical Context

**Language/Version**: JavaScript ES6+ with React 18 (JSX)
**Primary Dependencies**: React 18, PapaParse (existing), Vite (existing)
**Storage**: Client-side only (no persistence beyond session state)
**Testing**: Manual testing (per constitution); Vitest available if complexity warrants automated tests
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) on desktop and mobile
**Project Type**: Single-page web application
**Performance Goals**:
- SVG load and interactive <2s on broadband
- Hover feedback <100ms
- Responsive 375px-1920px viewport
- Bundle size increase <50KB for SVG assets

**Constraints**:
- Must use existing React hooks (no external state management per constitution)
- SVG inline (not external file) for interaction control
- Touch-first interaction design (single tap selects, no hover preview on mobile)
- Comma-separated muscle groups in CSV column

**Scale/Scope**:
- 12 muscle groups minimum (front + back views)
- ~15-20 SVG path elements per view
- Integration with existing CSV table filtering logic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Bun-First Development ✅ PASS
- **Requirement**: Use Bun exclusively for package management and tooling
- **Compliance**: No new dependencies requiring npm/yarn. Existing Bun setup sufficient.
- **Action**: None required

### II. Performance by Default ✅ PASS
- **Requirement**: Optimize bundle size, avoid unnecessary re-renders, track metrics
- **Compliance**:
  - SVG will be inline (no external fetch delay)
  - Use React.memo for muscle group components to prevent unnecessary re-renders on parent state changes
  - CSS-based hover states where possible (offload from JS)
  - Conditional rendering for front/back views (only mount active view)
- **Metrics to track**: Bundle size delta, initial load time, interaction latency
- **Action**: Document performance baseline before/after in quickstart.md

### III. Component Simplicity ✅ PASS
- **Requirement**: Start simple, use React built-in hooks, no premature abstraction
- **Compliance**:
  - Single MuscleD iagram component initially
  - useState for view toggle (front/back), selected muscles, hover state
  - Extract MuscleGroup sub-component only if file exceeds 250 lines
  - No external state library needed (selections managed in App.jsx lifted state)
- **Action**: Begin with single-file implementation

### IV. Vite-Optimized Build Pipeline ✅ PASS
- **Requirement**: Use Vite defaults, avoid custom plugins
- **Compliance**: SVG as inline JSX requires no Vite configuration changes
- **Action**: None required

### V. Type Safety & Quality Tooling ⚠️ ADVISORY
- **Requirement**: Use JSDoc or TypeScript for complex props
- **Compliance**: Consider JSDoc for muscle group data structure (name, path, position)
- **Action**: Add JSDoc comments for muscle group prop shape in Phase 1

**GATE RESULT**: ✅ PASS - All constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-muscle-diagram/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (already exists)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A for this feature
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── MuscleDiagram.jsx       # New: Interactive muscle diagram component
├── assets/
│   └── muscle-groups.js        # New: SVG path data and muscle group definitions
├── utils/
│   └── muscleFilter.js         # New: Muscle group filtering logic
├── App.jsx                     # Modified: Integrate diagram, lift selection state
├── App.css                     # Modified: Muscle diagram styles
└── main.jsx                    # Unchanged

public/
└── sample-workouts.csv         # Modified: Add "Muscles" column with sample data

```

**Structure Decision**: Selected Option 1 (Single project). This is a frontend-only feature adding to the existing single-page React application. The muscle diagram is a new component integrated into App.jsx alongside the existing CSV table. No backend, routing, or separate application structure needed per constitution principle III (Component Simplicity).

**Rationale for structure**:
- `components/MuscleDiagram.jsx`: Encapsulates SVG rendering, view toggle, hover/select interactions
- `assets/muscle-groups.js`: Separates SVG path data from component logic for maintainability
- `utils/muscleFilter.js`: Pure function to filter exercises by muscle groups (testable, reusable)
- Lift selection state to `App.jsx` to coordinate between diagram and CSV table

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations. This section is not applicable.
