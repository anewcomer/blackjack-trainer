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

### Redux Architecture Requirements
- **Redux Toolkit is mandatory** - Previous hook-based implementations had rendering/timing issues
- Design store slices before building components (see implementation-plan.md for details)
- Use TypeScript throughout for type safety
- Implement proper selectors to prevent unnecessary re-renders
- Test state transitions thoroughly, especially for multi-hand scenarios

### Component Architecture Requirements
**CRITICAL INSTRUCTION**: Prefer small, decomposed files and classes that follow the single responsibility principle.

**This is a STRONG, EMPHASIZED requirement for all future development:**
- **One Purpose Per File**: Each file should have a single, clear responsibility
- **Small, Focused Modules**: Break large files into smaller, composable units
- **Clear Separation of Concerns**: Logic, presentation, data, and utilities should be separate
- **Easy to Test**: Small modules are easier to unit test and debug
- **Better Maintainability**: Changes to one feature don't affect unrelated code

*See implementation-plan.md for detailed examples and architectural patterns.*

## Documentation During Development

As we plan and build, maintain these files:
- `progress.md` - **Regular progress snapshots for context continuity across chat sessions**

**Note**: All architectural decisions, implementation details, and technical patterns are documented in `implementation-plan.md`.

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

## Development Workflow Rules

### Git Operations Restriction
**IMPORTANT**: Only the user is allowed to perform `git add` and `git commit` operations.

**Rationale**:
- **User Control**: Maintain full control over commit timing and messages
- **Meaningful Commits**: Ensure commits represent logical development milestones
- **Quality Assurance**: User can review changes before committing
- **Workflow Integrity**: Prevent automated commits that may not align with development goals

**Implementation**:
- **Agent Responsibility**: Focus on code implementation and documentation
- **User Responsibility**: Handle all git staging and commit operations
- **Handoff Process**: Agent completes features and notifies user when ready for commit
- **No Automated Git**: Agent will not use terminal commands for git operations

### Documentation Review Protocol
**Before starting each new development phase, review the `docs/` folder** to ensure:
- **Context Awareness**: Understanding of current project state and requirements
- **Prevent Duplication**: Avoid creating redundant documentation files
- **Maintain Consistency**: Keep documentation organized and up-to-date
- **Informed Development**: Base implementation decisions on documented requirements and progress

**Current Documentation Files**:
- `instructions.md` - This high-level development guide and workflow standards
- `implementation-plan.md` - Detailed technical implementation roadmap and patterns
- `progress.md` - Current development status and completed phases
- `lessons-learned.md` - Universal lessons from AI-assisted development (applicable to any project)
- `functional-specifications.md` - Core feature requirements
- `user-experience-specifications.md` - UI/UX requirements
- `minimal-requirements.md` - Essential MVP features

## Success Criteria

The application is complete when:
- All functional requirements from specs are implemented
- Redux state management handles complex scenarios without issues
- Strategy evaluation and feedback work correctly in all game states
- Responsive design works across desktop/tablet/mobile
- Accessibility requirements are met
- No rendering or timing issues observed during testing

*See implementation-plan.md for detailed testing strategy and workflow automation.*

