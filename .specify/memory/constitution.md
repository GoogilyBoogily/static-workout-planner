<!--
SYNC IMPACT REPORT
Version: 1.0.0 (initial ratification)
Modified Principles: N/A (initial version)
Added Sections: All sections (new constitution)
Removed Sections: N/A
Templates Status:
  ✅ .specify/templates/plan-template.md - Aligned (Constitution Check section references this file)
  ✅ .specify/templates/spec-template.md - Aligned (requirements structure supports performance goals)
  ✅ .specify/templates/tasks-template.md - Aligned (task organization supports principles)
Follow-up TODOs: None
-->

# Workout Planner Constitution

## Core Principles

### I. Bun-First Development

All development MUST use Bun as the primary runtime and package manager. This principle is non-negotiable.

- Package management: Use `bun install`, `bun add`, `bun remove` exclusively
- Script execution: Use `bun run` or direct `bun` commands
- Build processes: Leverage Bun's native bundler capabilities where applicable
- Dependencies: Prefer packages that are Bun-compatible and well-tested with Bun runtime
- Documentation: All setup and development instructions MUST specify Bun commands (never npm/yarn)

**Rationale**: Bun provides superior performance for JavaScript/TypeScript tooling and runtime. Standardizing on Bun eliminates cross-tool compatibility issues and ensures consistent, fast development experience.

### II. Performance by Default

Every feature implementation MUST prioritize performance from the start, not as an afterthought.

- Client-side rendering: Minimize bundle size, use code splitting, lazy loading where appropriate
- Build optimization: Use production builds with minification and tree-shaking enabled
- Asset optimization: Images, fonts, and static assets MUST be optimized for web delivery
- Runtime efficiency: Avoid unnecessary re-renders, use memoization where beneficial
- Measurement: Performance metrics (bundle size, load time, Time to Interactive) MUST be tracked
- No premature optimization: Focus on architectural efficiency, not micro-optimizations without data

**Rationale**: User experience is directly tied to application performance. Performance issues are harder to fix retroactively than to build in from the start. Bun's speed advantages must be complemented by performant client-side code.

### III. Component Simplicity

Architecture MUST favor simplicity and clarity over unnecessary abstraction.

- Start simple: Single-file components for small features; split only when complexity demands it
- Minimal dependencies: Question every new dependency; prefer standard web APIs when practical
- No premature abstraction: Build concrete solutions first; extract patterns when they emerge 2-3 times
- Clear data flow: Props down, events up; avoid deeply nested component hierarchies
- State management: Use React built-in hooks (`useState`, `useContext`) unless application complexity justifies external library

**Rationale**: This is a single-page application with focused scope. Over-engineering with complex state management, routing, or component libraries adds maintenance burden without proportional value. The YAGNI (You Aren't Gonna Need It) principle keeps the codebase maintainable.

### IV. Vite-Optimized Build Pipeline

Build configuration MUST leverage Vite's capabilities for optimal development and production experience.

- Development: Use Vite's dev server with HMR (Hot Module Replacement) for fast feedback
- Production builds: `vite build` with default optimizations (rollup-based bundling, minification)
- Asset handling: Use Vite's static asset handling (`public/` for static files, `src/` for bundled assets)
- Environment config: Use Vite's environment variable conventions (`import.meta.env`)
- Plugin usage: Only add Vite plugins when built-in functionality is insufficient

**Rationale**: Vite is designed for fast builds and optimal DX (Developer Experience). Its defaults are well-tuned for modern web applications. Custom build configurations add complexity and maintenance burden.

### V. Type Safety & Quality Tooling

Code quality MUST be enforced through tooling, not discipline alone.

- Type checking: Use JSDoc comments with TypeScript type definitions where beneficial, or consider full TypeScript migration for larger features
- Linting: Configure ESLint to catch common errors and enforce code style consistency
- Formatting: Use Prettier for automatic code formatting (avoid style debates)
- Error boundaries: Implement React error boundaries to gracefully handle runtime errors
- Development warnings: Address all console warnings during development; production builds MUST be warning-free

**Rationale**: Tooling catches errors early and reduces cognitive load during code review. Consistent formatting improves readability. Type hints improve IDE experience and catch bugs before runtime.

## Architecture Standards

### Component Organization

Components MUST follow a clear organization pattern:

- **File structure**: Co-locate related files (component + styles + tests)
- **Naming**: Use PascalCase for components, kebab-case for filenames
- **Size**: Keep components focused on single responsibility; split when file exceeds ~250 lines
- **Props**: Use destructuring with default values; document complex prop shapes
- **Exports**: Use named exports for better refactoring and tree-shaking

### Data Management

Data handling MUST be predictable and maintainable:

- **Parsing**: Use established libraries (e.g., PapaParse for CSV) for non-trivial data formats
- **Validation**: Validate external data at system boundaries (file uploads, API responses)
- **Error handling**: Provide clear error messages to users; log technical details for debugging
- **State placement**: Lift state only as high as necessary; avoid global state for localized concerns
- **Side effects**: Use `useEffect` with clear dependency arrays; document why effects are needed

### Styling Standards

Styling MUST balance maintainability with performance:

- **CSS approach**: Use CSS Modules or scoped styles to avoid global namespace pollution
- **Design system**: Establish color palette, spacing scale, and typography early
- **Responsive design**: Mobile-first approach; test on multiple viewport sizes
- **Accessibility**: Semantic HTML, proper heading hierarchy, ARIA labels where needed
- **Dark mode**: Support system preference via `prefers-color-scheme` media query

## Development Workflow

### Code Review Standards

All changes MUST undergo review focusing on:

- **Constitution compliance**: Does this change violate any core principles?
- **Performance impact**: Bundle size increase, runtime performance implications
- **Simplicity**: Could this be implemented more simply?
- **Documentation**: Are complex decisions explained in comments or docs?

### Testing Approach

Testing is encouraged but not mandatory for all changes:

- **Manual testing**: Required for all user-facing changes
- **Automated tests**: Add when feature complexity justifies the maintenance cost
- **Test types**: Component tests for complex logic, integration tests for critical user flows
- **Test library**: Use Vitest (Vite-native test runner) if automated tests are added

**Rationale**: For a small-scope application, comprehensive test coverage may be over-investment. Focus testing effort on critical paths and complex business logic.

## Governance

### Constitution Authority

This constitution is the authoritative source for technical decision-making in this project. When conflicts arise between convenience and constitutional principles, principles take precedence.

### Amendment Process

Constitution amendments require:

1. **Proposal**: Document the proposed change and rationale
2. **Impact analysis**: Identify affected code, templates, and workflows
3. **Version bump**: Follow semantic versioning (MAJOR for breaking governance changes, MINOR for new principles, PATCH for clarifications)
4. **Template updates**: Update `.specify/templates/` files to reflect changes
5. **Documentation**: Update `CLAUDE.md` and `README.md` if user-facing changes

### Complexity Justification

When a change violates constitutional principles (e.g., adding complex state management, introducing non-Bun tooling), it MUST be justified in writing:

- Why is the simpler approach insufficient?
- What specific problem does the complexity solve?
- What is the maintenance cost vs. benefit?
- Can we defer this complexity until it's proven necessary?

Unjustified complexity violations MUST be rejected in code review.

### Compliance Review

Constitution compliance is checked at these points:

- **Plan phase**: `.specify/templates/plan-template.md` includes "Constitution Check" section
- **Code review**: Reviewers verify adherence to principles
- **Retrospectives**: Periodic review of whether principles remain fit for purpose

**Version**: 1.0.0 | **Ratified**: 2025-11-15 | **Last Amended**: 2025-11-15
