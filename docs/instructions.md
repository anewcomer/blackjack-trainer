# Instructions

We will be building a Blackjack Trainer application from scratch. See the other files in this directory for detailed requirements and specifications.

## Pre-Development Requirements

Before starting any code implementation:

1. **Review All Documentation**: Thoroughly read all specification files in this directory:
   - `functional-specifications.md` - Core functionality and technical requirements
   - `user-experience-specifications.md` - UX/UI requirements and patterns
   - `minimal-requirements.md` - Essential features for MVP

2. **Generate Implementation Plan**: Create `implementation-plan.md` with:
   - Redux store structure and slice organization
   - Component hierarchy and data flow
   - Development phases and dependencies
   - Testing strategy for complex state interactions
   - Build and deployment configuration

### VSCode Task Integration (Preferred)
For commonly needed development activities, create VSCode tasks that can be executed without user intervention:

**Preferred Task Creation Strategy**:
- **Build Tasks**: Automated build processes that can run without approval
- **Test Tasks**: Unit test execution, linting, type checking
- **Development Tasks**: Start dev server, watch mode compilation
- **Deployment Tasks**: Build and deploy to GitHub Pages
- **Validation Tasks**: Run accessibility checks, performance audits

**Terminal Commands**: Reserve for one-off operations, debugging, or complex scenarios requiring user interaction

**Task Benefits**:
- No user approval required for execution
- Consistent development workflow
- Easy integration with VS Code's task runner
- Can be chained together for complex workflows

## Critical Implementation Notes

### State Management (MANDATORY)
- **Redux Toolkit is required** - Previous hook-based implementations had rendering/timing issues
- Design store slices before building components
- Use TypeScript throughout for type safety
- Implement proper selectors to prevent unnecessary re-renders
- Test state transitions thoroughly, especially for multi-hand scenarios

### Development Approach
- **Start with Redux store and types** before any UI components
- Build components incrementally, testing state integration at each step
- Focus on the game logic core before visual polish
- Implement strategy evaluation engine early to validate against requirements
- **Create VSCode tasks** for common development activities (build, test, lint, deploy)

### Quality Assurance
- Test multi-hand splitting scenarios extensively (known complexity area)
- Validate strategy table highlighting works correctly across all scenarios
- Ensure action button states update reliably in all game conditions
- Test responsive layout across device sizes

## Documentation During Development

As we plan and build, maintain these files:
- `decisions.md` - Document architectural choices and rationale
- `issues.md` - Track bugs, especially state synchronization issues
- `features.md` - Log implemented features and any deviations from specs
- `progress.md` - **Regular progress snapshots for context continuity across chat sessions**

### Progress Tracking for Context Management

**Important**: To manage Copilot context effectively across multiple chat sessions:

1. **Create `progress.md`** at the start of implementation with:
   - Current implementation phase
   - Completed components/features
   - Active work in progress
   - Next planned steps
   - Any blockers or pending decisions

2. **Update `progress.md` regularly** (suggested intervals):
   - After completing each major component
   - Before switching between implementation phases
   - When encountering significant issues or making architectural decisions
   - At natural stopping points in development

3. **Progress file format should include**:
   - **Phase**: Current development phase (Planning, Redux Setup, Core Components, etc.)
   - **Completed**: List of finished features/components
   - **In Progress**: Current active work
   - **Next Steps**: Immediate next tasks
   - **Context Notes**: Important decisions or issues that affect ongoing work
   - **File Status**: Key files created/modified with brief descriptions

This enables seamless continuation of work in fresh chat sessions by providing Copilot with comprehensive context about the current state of implementation.

## Success Criteria

The application is complete when:
- All functional requirements from specs are implemented
- Redux state management handles complex scenarios without issues
- Strategy evaluation and feedback work correctly in all game states
- Responsive design works across desktop/tablet/mobile
- Accessibility requirements are met
- No rendering or timing issues observed during testing

## Browser Testing and Debugging Tools

For enhanced development and debugging capabilities, integrate Playwright MCP for browser automation:

### Playwright MCP Integration (Use Sparingly)
- **Purpose**: End-to-end testing for complex scenarios that cannot be tested with faster methods
- **Browser Support**: Chrome only (sufficient for development and validation)
- **Installation**: Install Playwright MCP server for VS Code integration
- **Performance Note**: Use sparingly - prefer faster testing strategies (unit tests, React Testing Library) for routine validation

### Primary Testing Strategy (Preferred)
- **Unit Tests**: Jest + React Testing Library for component logic and Redux state
- **Integration Tests**: Testing Library for component interactions and state updates
- **Fast Feedback**: Use these methods for 90% of testing needs

### Playwright MCP - Limited Use Cases Only
Use Playwright MCP only for scenarios that cannot be tested with faster methods:
- **Complex Multi-Hand Splits**: Full browser testing of 3-4 simultaneous hands
- **Strategy Table Visual Validation**: Screenshot-based verification of highlighting accuracy
- **Performance Bottlenecks**: When Redux state issues require browser-level debugging
- **Final Deployment Validation**: Testing GitHub Pages build in actual Chrome browser
- **Responsive Layout Edge Cases**: When CSS-in-JS behavior differs from test environment

### Testing Priorities (Fast to Slow)
1. **Unit Tests**: Redux slices, game logic, utility functions
2. **Component Tests**: React Testing Library for UI component behavior
3. **Integration Tests**: Component + Redux interactions
4. **Playwright E2E**: Only for scenarios requiring full browser context

### Development Workflow Automation
**Prefer VSCode Tasks for Common Activities**:
- **Build Task**: `npm run build` for production builds
- **Test Task**: `npm test` for running unit tests
- **Lint Task**: `npm run lint` for code quality checks
- **Deploy Task**: `npm run deploy` for GitHub Pages deployment
- **Dev Server Task**: `npm start` for development server
- **Type Check Task**: TypeScript compilation validation

**Benefits of VSCode Tasks**:
- Execute without user approval/intervention
- Consistent development workflow across team members
- Integration with VS Code's built-in task runner
- Can be configured for automatic execution on file changes

**Terminal Commands**: Use for debugging, one-off operations, or when user interaction required

### Playwright Usage Guidelines
- **Minimize Usage**: Reserve for cases where faster testing is insufficient
- **Chrome Only**: No cross-browser testing needed during development
- **Specific Scenarios**: Focus on multi-hand complexity and visual validation
- **Performance Focus**: Use to debug timing/rendering issues from previous implementation

### Usage During Development
- Run Playwright tests after major component implementations
- Use for debugging Redux state synchronization issues
- Validate responsive design works correctly on actual browser viewports
- Test complex multi-hand scenarios that previously caused timing issues

## Common Pitfalls to Avoid

Based on previous implementation challenges:
- Don't use React hooks alone for complex state - use Redux as specified
- Avoid tightly coupled components - maintain clear data flow through Redux
- Don't skip TypeScript types - they prevent many state-related bugs
- Ensure proper cleanup of game state between hands
- Test edge cases like simultaneous splits and doubles thoroughly

