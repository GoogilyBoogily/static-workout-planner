# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based workout planner with localStorage persistence, random workout generation, muscle diagram visualization, and exercise library features. Built with Vite and **Bun** (not npm/yarn).

## Development Commands

```bash
bun install              # Install dependencies
bun dev                  # Start dev server at http://localhost:5173
bun run build            # Build for production
bun run preview          # Preview production build locally
```

**No tests or linting configured** - manual testing only.

## SpecKit Workflow System

Feature development uses Claude Code slash commands. Run in order:

1. `/speckit.specify` - Create feature specification from natural language
2. `/speckit.plan` - Generate implementation plan from spec
3. `/speckit.tasks` - Generate actionable task list from plan
4. `/speckit.implement` - Execute implementation using tasks
5. `/speckit.analyze` - Cross-artifact consistency analysis

Additional commands: `/speckit.checklist`, `/speckit.clarify`, `/speckit.constitution`, `/speckit.taskstoissues`

**Key directories**:
- `.specify/memory/constitution.md` - Project constitutional principles (must comply)
- `specs/[feature-name]/` - Feature specifications and artifacts

## Architecture

### Key Architectural Decisions
- **No routing library** - Single-page app with view state in `App.jsx` (`currentView`)
- **No global state library** - React hooks only (`useState`, `useMemo`)
- **No backend** - Purely client-side with localStorage persistence
- **Component-scoped CSS** - Each `.jsx` has co-located `.css` file
- **Muscle filtering** - Centralized in `src/utils/muscleFilter.js` with OR-based matching

### State Management
- Local component state for UI (`useState`)
- Lifted state in `App.jsx` for shared data (exercises, plans, filters)
- Cross-tab sync via `window.storage` event listener
- Derived state uses `useMemo` for expensive filtering

### Data Flow
1. Exercise library loads from `/public/default-workouts.csv` (or user uploads CSV)
2. PapaParse parses CSV (headers in first row)
3. CSV columns: Exercise, Muscle Group, Description, Equipment, YouTube URL
4. Workout plans (sets, reps, weight, rest) stored in localStorage, not CSV

### Key Dependencies
- **React 18** - UI framework
- **PapaParse** - CSV parsing
- **@mjcdev/react-body-highlighter** - Interactive muscle diagram (only external component library)
- **Vite** - Build tool with HMR

## Data Model & Persistence

### localStorage Keys
- `workout-plans` - Array of workout plan objects
- `workout-quota-templates` - Array of quota template objects

### Entity IDs
Use `crypto.randomUUID()` for all entities (plans, exercises, templates).

### Utility Modules
All in `src/utils/`:
- `localStorage.js` - Centralized storage operations (never call localStorage directly)
- `muscleFilter.js` - Exercise filtering by muscle groups (OR-based matching)
- `youtube.js` - YouTube URL parsing and privacy-enhanced embed URLs
- `validation.js` - Form validation utilities
- `dateFormat.js` - Timestamp formatting
- `randomGenerator.js` - Fisher-Yates shuffle, workout generation, reroll/pin workflow
- `quotaTemplates.js` - Quota template CRUD with localStorage

## Constitutional Principles

**All changes must comply with `.specify/memory/constitution.md`**. Key requirements:

1. **Bun-First** - NEVER use npm/yarn commands
2. **Performance by Default** - Question every new dependency, minimize re-renders
3. **Component Simplicity** - No component libraries unless necessary, avoid premature abstraction
4. **Vite-Optimized** - Use Vite defaults, minimal custom configuration
5. **JSDoc over TypeScript** - Type hints via comments, manual testing prioritized

## Code Patterns & Conventions

### Component Patterns

- Event handlers prefixed with `handle` (e.g., `handleSavePlan`)
- Modals controlled by parent state with `onClose` callback
- Props destructured with default values

### State Rules

- Lift state only when multiple components share it
- `useMemo` for expensive filtering/sorting
- Form state local to component, bubble up on save

### localStorage Rules

- **Always use `src/utils/localStorage.js`** - never call localStorage directly
- Validate data on load; return empty array/object if corrupted

### CSS Conventions

- Each `.jsx` has matching `.css` file
- Class names: kebab-case (e.g., `.exercise-list-item`)
- Dark mode via CSS custom properties in `index.css` + `prefers-color-scheme`
