# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based workout planner web application that started as a CSV viewer and is evolving into a comprehensive workout planning tool with localStorage persistence, random workout generation, and exercise library features. Built with Vite and uses Bun as the package manager.

**Current State**: Basic CSV viewer with file upload and sample data loading
**Planned Features**: Interactive workout planner, random workout generator with tag quotas, exercise library with muscle group filters and YouTube integration

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

**Current Implementation**:
- **Single-page React application** with minimal component structure
- **Main component**: `src/App.jsx` - handles CSV loading, parsing, and display
- **Styling**: Component-scoped CSS (`App.css`) and global styles (`index.css`) with dark mode support

**Planned Evolution** (see `specs/` directory for detailed specifications):
1. **Workout Planner with localStorage** (`001-planner-localstorage`)
   - Full CRUD operations for workout plans and exercises
   - UUID-based entity identification using `crypto.randomUUID()`
   - Client-side persistence with localStorage (JSON format)
   - Reorderable exercises within plans

2. **Random Workout Generator** (`002-random-generator-tag-quotas`)
   - Tag-based quota system (e.g., "3 chest, 2 legs, 2 back")
   - Exercise reroll (replace individual exercises)
   - Pin functionality (lock exercises during regeneration)
   - Quota template management (save/reuse configurations)

3. **Exercise Library Features** (multiple specs)
   - Interactive muscle diagram visualization
   - Muscle group and tag-based filtering
   - YouTube video integration for exercise demonstrations
   - Expandable exercise details

### Data Flow
1. User uploads CSV file or loads sample data from `/public/sample-workouts.csv`
2. PapaParse library parses CSV into array format
3. First row extracted as headers, remaining rows as data
4. State managed via React hooks (`useState`) for data, headers, and errors
5. Data rendered in HTML table format

### CSV Processing
- Uses PapaParse for client-side CSV parsing
- Expected format: First row contains headers, subsequent rows contain data
- Sample data demonstrates workout tracking: Exercise, Sets, Reps, Weight, Rest, Day
- Empty rows automatically filtered out during parsing

### Key Dependencies
- **React 18**: UI framework
- **PapaParse**: CSV parsing library
- **Vite**: Build tool and dev server
- **Bun**: Package manager (not npm/yarn)

## Important Notes

- This project uses **Bun**, not npm or yarn - always use `bun` commands
- Sample data file located in `public/` directory is served statically by Vite
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

**Workout Plans** (from `001-planner-localstorage`):
```javascript
{
  id: "uuid-v4",              // crypto.randomUUID()
  name: "Chest Day",
  exercises: [
    {
      id: "uuid-v4",
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

**Quota Templates** (from `002-random-generator-tag-quotas`):
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
- `workout-plans` - Array of workout plan objects
- `quota-templates` - Array of quota template objects
- Future: `exercise-library` - Custom user exercises

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
- **Sample Data Loading**: Static CSV from `/public/sample-workouts.csv`
- **Basic Table Display**: Workout data rendering

### In Development
- **002-random-generator-tag-quotas** (current branch): Random workout generation with tag quotas, exercise reroll/pin, and quota template management

### Planned Features (see `specs/` directory)
- **001-planner-localstorage**: Full workout planner with CRUD operations and localStorage persistence
- **001-muscle-diagram**: Interactive muscle group visualization
- **002-exercise-list-filters**: Filter exercises by muscle groups and tags
- **003-exercise-details-youtube**: YouTube video integration for exercise demonstrations

### Technology Additions by Feature
- **localStorage features**: Uses browser localStorage API, `crypto.randomUUID()`, JSON serialization
- **Random generation**: Uses `Math.random()`, Fisher-Yates shuffle algorithm
- **YouTube integration**: Uses YouTube iframe embed API (no package needed)
- **No new npm packages required**: All features use browser APIs and existing dependencies
