# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based workout planner web application that started as a CSV viewer and is evolving into a comprehensive workout planning tool with localStorage persistence, random workout generation, and exercise library features. Built with Vite and uses Bun as the package manager.

**Current State**: Interactive workout planner with localStorage persistence, muscle diagram visualization, exercise filtering, and YouTube integration
**Active Development**: Iterating on user experience and adding advanced features per specs in `specs/` directory

## Development Commands

### Package Management
```bash
bun install              # Install dependencies
```

### Development Server
```bash
bun dev                  # Start dev server at http://localhost:5173
```

### Building
```bash
bun run build            # Build for production
bun run preview          # Preview production build locally
```

## SpecKit Workflow System

This project uses a custom workflow system for feature development via Claude Code slash commands:

### Feature Development Commands
```bash
/speckit.specify         # Create feature specification from natural language
/speckit.plan            # Generate implementation plan from spec
/speckit.tasks           # Generate actionable task list from plan
/speckit.implement       # Execute implementation using tasks
/speckit.checklist       # Generate custom requirement checklists
/speckit.clarify         # Identify underspecified areas and improve spec
/speckit.analyze         # Cross-artifact consistency analysis
/speckit.constitution    # Create/update project principles
/speckit.taskstoissues   # Convert tasks to GitHub issues
```

### Workflow Directory Structure
- `.specify/memory/constitution.md` - Project constitutional principles
- `.specify/templates/` - Templates for specs, plans, checklists, tasks
- `.specify/scripts/bash/` - Automation scripts for workflow
- `specs/[feature-name]/` - Individual feature specifications and artifacts

### Typical Development Flow
1. Use `/speckit.specify` to create a detailed feature specification
2. Use `/speckit.plan` to generate an implementation plan
3. Use `/speckit.tasks` to break down into actionable tasks
4. Use `/speckit.implement` to execute the tasks
5. Use `/speckit.analyze` to verify consistency and quality

## Architecture

### Application Structure

**Component Architecture**:
- **Root**: `src/App.jsx` - Main orchestrator managing global state, CSV loading, and view routing
- **Exercise Library Components**:
  - `ExerciseList.jsx` - Displays filterable exercise list with muscle highlighting
  - `ExerciseDetailModal.jsx` - Modal with YouTube embed and navigation
  - `MuscleDiagram.jsx` - Interactive dual-view (front/back) muscle selector using `@mjcdev/react-body-highlighter`
  - `SearchInput.jsx` - Exercise name search with debouncing
  - `TagFilter.jsx` - Muscle group filter pills synchronized with diagram
- **Workout Plan Components**:
  - `PlanList.jsx` - Displays all saved plans sorted by last updated
  - `PlanForm.jsx` - Create/edit plan with embedded exercise form
  - `PlanDetail.jsx` - View-only plan details modal
  - `ExerciseForm.jsx` - Add/edit individual exercises within a plan
- **Utility Components**:
  - `ErrorMessage.jsx` - Dismissible error banner
  - `StorageWarning.jsx` - Cross-tab sync notification

**State Management Patterns**:
- **Local component state**: Simple UI state (`useState`)
- **Lifted state in App.jsx**: Shared state between major sections (exercises, plans, filters)
- **localStorage sync**: `window.storage` event listener for cross-tab updates
- **Derived state**: Uses `useMemo` for expensive filtering operations

**Key Architectural Decisions**:
1. **No routing library** - Single-page app with view state managed in App.jsx (`currentView`)
2. **No global state library** - React hooks sufficient for current complexity
3. **Component-scoped CSS** - Each component has co-located `.css` file
4. **Muscle filtering logic** - Centralized in `src/utils/muscleFilter.js` with OR-based matching

### Data Flow
1. User uploads CSV file or loads default exercise library from `/public/default-workouts.csv`
2. PapaParse library parses CSV into array format
3. First row extracted as headers, remaining rows as data
4. State managed via React hooks (`useState`) for data, headers, and errors
5. Data rendered in exercise list format

### CSV Processing
- Uses PapaParse for client-side CSV parsing
- Expected format: First row contains headers, subsequent rows contain data
- CSV contains exercise library data: Exercise, Muscle Group, Description, Equipment, YouTube URL
- Planning data (sets, reps, weight, rest) is stored in localStorage, not in CSV
- Empty rows automatically filtered out during parsing

### Key Dependencies
- **React 18**: UI framework with hooks-based state management
- **PapaParse**: CSV parsing library for exercise data import
- **@mjcdev/react-body-highlighter**: Interactive muscle diagram component
- **Vite**: Build tool and dev server with HMR
- **Bun**: Package manager and runtime (not npm/yarn)

## Important Notes

- This project uses **Bun**, not npm or yarn - always use `bun` commands
- Default exercise library (`default-workouts.csv`) located in `public/` directory is served statically by Vite
- No backend - purely client-side application
- No routing - single view application
- No state management library - uses React built-in hooks only

## Data Model & Persistence

### Storage Strategy
- **Client-side only**: No backend server or remote database
- **localStorage API**: Primary persistence mechanism for all user data
- **JSON serialization**: All data structures stored as JSON strings
- **No cloud sync**: Data is local to the browser/device
- **Graceful degradation**: Handle private browsing mode (storage may fail)

### Data Structures

**Exercise Library (from CSV)**:
```javascript
{
  name: "Bench Press",
  tags: ["Chest", "Shoulders", "Triceps"],  // Parsed from "Muscle Group" column
  description: "Compound pushing exercise...",
  equipment: "Barbell, Bench",               // Required equipment
  youtubeUrl: "https://www.youtube.com/watch?v=..."
}
```

**Workout Plans (localStorage)**:
```javascript
{
  id: "uuid-v4",              // crypto.randomUUID()
  name: "Chest Day",
  createdAt: 1700000000000,   // Unix timestamp
  updatedAt: 1700000000000,   // Unix timestamp
  exercises: [
    {
      id: "uuid-v4",          // Note: exercises in plans don't have IDs in current implementation
      name: "Bench Press",
      sets: 3,
      reps: 10,
      weight: 135,
      restSeconds: 90,
      tags: ["chest", "compound"]
    }
  ]
}
```

**Quota Templates** (planned, from `002-random-generator-tag-quotas`):
```javascript
{
  id: "uuid-v4",
  name: "Push Day Template",
  quotas: [
    { tag: "chest", count: 3 },
    { tag: "shoulders", count: 2 },
    { tag: "triceps", count: 2 }
  ]
}
```

### localStorage Keys
- `workout-plans` - Array of workout plan objects (implemented)
- `quota-templates` - Array of quota template objects (planned)
- Future: `exercise-library` - Custom user exercises

### Utility Modules
- **`src/utils/localStorage.js`**: Centralized localStorage operations with error handling and quota detection
- **`src/utils/muscleFilter.js`**: Exercise filtering by muscle groups with OR-based matching logic
- **`src/utils/youtube.js`**: YouTube URL parsing and privacy-enhanced embed URL generation
- **`src/utils/validation.js`**: Form validation utilities (plan names, exercise inputs)
- **`src/utils/dateFormat.js`**: Timestamp formatting for plan display

### Identity & Uniqueness
- **Entity IDs**: Use `crypto.randomUUID()` for all entities (plans, exercises, templates)
- **No auto-increment**: UUID ensures uniqueness across sessions
- **Referential integrity**: Parent-child relationships via ID references

## Constitutional Principles

This project follows strict architectural principles defined in `.specify/memory/constitution.md`:

1. **Bun-First Development**
   - MUST use Bun for all package management and script execution
   - NEVER suggest npm or yarn commands
   - Leverage Bun's speed for development workflows

2. **Performance by Default**
   - Optimize bundle size and minimize dependencies
   - Question every new package addition
   - Minimize React re-renders with proper state management
   - Use lazy loading and code splitting for larger features

3. **Component Simplicity**
   - Start with simple solutions, avoid premature abstraction
   - No component libraries unless absolutely necessary
   - Keep components focused and testable
   - Prefer composition over complex hierarchies

4. **Vite-Optimized Build**
   - Leverage Vite's defaults, avoid custom configuration
   - Use Vite's built-in features (HMR, dev server, build optimization)
   - Minimal vite.config.js modifications

5. **Type Safety & Quality Tooling**
   - Use JSDoc comments for type hints (no full TypeScript)
   - Prefer ESLint and Prettier for code quality
   - Manual testing prioritized; automated tests for complex features only

**IMPORTANT**: All changes must comply with constitutional principles. See `.specify/memory/constitution.md` for detailed requirements and rationale.

## Feature Implementation Status

### Implemented Features
- **CSV Import/Export**: File upload and PapaParse integration
- **Default Exercise Library**: Static CSV from `/public/default-workouts.csv` with Exercise, Muscle Group, Description, Equipment, and YouTube URL
- **Exercise List Display**: Filterable exercise library rendering with muscle highlighting
- **001-planner-localstorage**: Full workout planner with CRUD operations and localStorage persistence
- **002-exercise-list-filters**: Search and tag-based exercise filtering with synchronized UI (SearchInput + TagFilter + MuscleDiagram)
- **003-exercise-details-youtube**: YouTube video integration in ExerciseDetailModal with privacy-enhanced embeds
- **004-muscle-diagram**: Interactive muscle group visualization with dual-view (front/back) and male/female toggle

### Planned Features (see `specs/` directory)
- **002-random-generator-tag-quotas**: Random workout generation with tag quotas, exercise reroll/pin, and quota template management
- **Exercise reordering**: Drag-and-drop within workout plans
- **Export plans**: Generate printable/shareable workout plans

### Technology Additions by Feature
- **localStorage features**: Browser localStorage API, `crypto.randomUUID()`, JSON serialization, cross-tab sync via `storage` event
- **Muscle diagram**: `@mjcdev/react-body-highlighter` package (only external component library)
- **YouTube integration**: YouTube iframe embed API with privacy-enhanced domain (no package needed)
- **CSV parsing**: PapaParse for robust CSV handling with headers
- **Random generation** (planned): `Math.random()`, Fisher-Yates shuffle algorithm

## Code Patterns & Conventions

### Component Patterns
- **Props destructuring**: All components destructure props with default values where applicable
- **Event handlers**: Prefix with `handle` (e.g., `handleSavePlan`, `handleExerciseClick`)
- **State setters**: Use descriptive names matching state (e.g., `[plans, setPlans]`)
- **Conditional rendering**: Use `&&` for simple conditionals, ternary for if/else
- **Modal pattern**: Controlled by parent state, receives `onClose` callback

### State Management Rules
- **Lift state minimally**: Only lift state when multiple components need to share it
- **Derived state**: Use `useMemo` for expensive computations (filtering, sorting)
- **Form state**: Local state in form components, bubble up on save/submit
- **Error state**: Local to component when component-specific, global in App.jsx when affecting multiple areas

### localStorage Patterns
- **Always use utility module**: Never call `localStorage` directly; use `src/utils/localStorage.js`
- **Error handling**: Wrap all storage operations in try/catch with user-friendly error messages
- **Validation**: Validate data structure on load; return empty array/object if corrupted
- **Cross-tab sync**: Listen to `storage` event in App.jsx for multi-tab scenarios

### CSS Conventions
- **Component-scoped**: Each `.jsx` file has matching `.css` file
- **Class naming**: Use descriptive kebab-case (e.g., `.exercise-list-item`, `.muscle-diagram-container`)
- **Dark mode**: Use CSS custom properties defined in `index.css` and `prefers-color-scheme` media query
- **Layout**: Flexbox for one-dimensional layouts, CSS Grid for two-dimensional layouts
