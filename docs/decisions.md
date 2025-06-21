# Architectural Decisions

## Code Verification Strategy

### **🔧 JavaScript/TypeScript Extension Integration**
**Decision**: Use the `get_errors` tool for rapid error detection instead of relying solely on terminal verification commands.

**Rationale**:
- **Faster Feedback Loop**: `get_errors` provides immediate TypeScript and ESLint feedback without running full compilation
- **Targeted Error Detection**: Can check specific files or directories for issues
- **Reduced Terminal Usage**: Less frequent need for `npm run lint && npm run type-check`
- **More Efficient Development**: Catch issues early in the development process

**Implementation Strategy**:
```
1. During Development: Use `get_errors` to check specific files after changes
2. Before Major Changes: Use `get_errors` to verify current state
3. Terminal Verification: Reserve for final checks and pre-commit validation
4. Continuous Monitoring: Check errors after implementing new features
```

**Examples**:
```typescript
// ✅ GOOD: Check specific files after making changes
get_errors(["/path/to/modified/file.ts", "/path/to/related/file.tsx"])

// ✅ GOOD: Check multiple related files
get_errors(["/src/components/strategy/StrategyGuide.tsx", "/src/utils/strategy/index.ts"])

// ❌ AVOID: Checking directories (use specific files instead)
get_errors(["/src/components/strategy"]) // This will fail
```

**Benefits**:
- **Immediate Feedback**: No need to wait for full compilation cycles
- **Development Velocity**: Faster iteration during feature development
- **Precise Targeting**: Check only the files you're working on
- **Error Context**: Get detailed error information with line numbers and descriptions

**When to Use Each**:
- **`get_errors`**: ✅ Quick checks during development, specific file validation
- **Terminal Commands**: ✅ Final verification, comprehensive builds, pre-commit checks
- **VSCode Tasks**: ✅ When available, for integrated workflow

### Preferred Verification Tasks
**Use VSCode tasks for code verification instead of `npm start`** because:
- `npm start` is a long-running process that doesn't complete on its own
- Build tasks complete with clear success/failure status
- Lint and type-check provide immediate feedback on code quality
- Verification tasks can be chained together for comprehensive checks

### VSCode Tasks for Verification
- **"Quick Verification"**: `npm run lint && npm run type-check` - Fast quality checks
- **"Verify Code Quality"**: Full verification including build, lint, and type-check
- **"Build Production"**: `npm run build` - Ensures production build succeeds
- **"Lint Code"**: `npm run lint` - ESLint checks for code quality
- **"Type Check"**: `npm run type-check` - TypeScript compilation validation

### When to Use Each
- **During Development**: Use "Quick Verification" for rapid feedback
- **Before Commits**: Use "Verify Code Quality" for comprehensive checks
- **CI/CD Simulation**: Use "Build Production" to test deployment readiness

## Redux Architecture Decisions

### Store Structure
- **gameSlice**: Core game state (hands, deck, phase, actions)
- **sessionSlice**: Statistics, history, learning analytics
- **uiSlice**: UI state, modals, theme preferences

### Why Redux Toolkit Over Hooks
Previous hook-based implementations had rendering/timing issues with complex state:
- Multi-hand scenarios caused synchronization problems
- Action button states didn't update reliably
- Strategy evaluation required global state access

Redux provides:
- Predictable state updates with immutability
- Time-travel debugging capabilities
- Better testing isolation
- Proper state separation and modularity

### Async Actions (Thunks)
Game flow requires coordinated async operations:
- **startNewHand**: Deck creation, shuffling, initial dealing
- **playerAction**: Action validation, card dealing, state updates
- **dealerTurn**: Automated dealer play with timing delays
- **resolveHands**: Outcome calculation and result setting

## Component Architecture

### **🎯 SINGLE RESPONSIBILITY PRINCIPLE (MANDATORY)**
**CRITICAL INSTRUCTION**: Prefer small, decomposed files and classes that follow the single responsibility principle.

**This is a STRONG, EMPHASIZED requirement for all future development:**

- **One Purpose Per File**: Each file should have a single, clear responsibility
- **Small, Focused Modules**: Break large files into smaller, composable units
- **Clear Separation of Concerns**: Logic, presentation, data, and utilities should be separate
- **Easy to Test**: Small modules are easier to unit test and debug
- **Better Maintainability**: Changes to one feature don't affect unrelated code

**Examples of Good Decomposition**:
```
// ❌ BAD: Large, multi-purpose file
strategyEngine.ts (500+ lines, multiple responsibilities)

// ✅ GOOD: Decomposed into focused modules
strategy/
├── evaluators/
│   ├── hardHandEvaluator.ts    (handles hard hand strategy)
│   ├── softHandEvaluator.ts    (handles soft hand strategy)
│   └── pairEvaluator.ts        (handles pair splitting strategy)
├── converters/
│   ├── actionConverter.ts      (ActionType ↔ StrategyAction)
│   └── cardConverter.ts        (card value conversions)
├── explanations/
│   └── decisionExplainer.ts    (generates strategy explanations)
└── index.ts                    (clean public API)
```

**Apply This Pattern To**:
- Strategy engine components
- Game logic utilities  
- UI component families
- Redux slice helpers
- Testing utilities

### Layout Hierarchy
```
App
├── GameLayout (main structure)
│   ├── GameArea (core game interface)
│   └── StrategyGuide (strategy table and feedback)
└── Theme Provider + Redux Provider
```

### Data Flow Pattern
- **Unidirectional**: Components dispatch actions → Redux updates state → Components re-render
- **No Prop Drilling**: Direct Redux connections for cleaner component APIs
- **Typed Selectors**: Custom hooks (useAppSelector) for type-safe state access

## Development Workflow Decisions

### VSCode Task Strategy
Prefer VSCode tasks over terminal commands for:
- **Build Operations**: Consistent execution without approval delays
- **Quality Checks**: Automated linting and type checking
- **Git Operations**: Standardized commit workflows
- **Development Server**: Background process management

### Code Quality Standards
- **TypeScript Strict Mode**: Full type coverage required
- **ESLint Integration**: Enforce consistent code style
- **No unused imports/variables**: Clean codebase maintenance
- **Proper error handling**: All async operations wrapped

## Game Logic Decisions

### Blackjack Rules Implementation
- **Dealer hits soft 17**: Configurable via GAME_CONFIG
- **Double after split**: Allowed by default
- **Surrender allowed**: First two cards only
- **Max split hands**: 4 hands maximum

### Hand Value Calculation
- **Ace handling**: Dynamic soft/hard calculation
- **Bust detection**: Immediate when hand > 21
- **Blackjack detection**: 21 with exactly 2 cards (excludes splits)

### Strategy Engine Integration
- **Basic Strategy Tables**: Static data in strategyCharts.ts
- **Real-time Feedback**: Compare player actions to optimal strategy
- **Action Logging**: Track decisions for learning analytics

## Testing Strategy

### Verification Hierarchy (Fast → Slow)
1. **Unit Tests**: Redux slices, utility functions, game logic
2. **Component Tests**: React Testing Library for UI behavior
3. **Integration Tests**: Component + Redux state interactions
4. **E2E Tests**: Playwright for complex multi-hand scenarios (sparingly)

### Critical Test Areas
- **Multi-hand splitting**: Known complexity from previous implementation
- **State synchronization**: Action availability and game phase transitions
- **Strategy evaluation**: Accuracy across all game scenarios
- **Responsive layout**: Cross-device compatibility

## Build and Deployment

### GitHub Pages Configuration
- **Build output**: `/build` directory
- **Base URL**: `/blackjack-trainer` for GitHub Pages path
- **Deploy task**: Automated via VSCode task with build dependency

### Production Optimizations
- **Code splitting**: React.lazy for strategy components
- **Bundle analysis**: webpack-bundle-analyzer integration
- **Performance monitoring**: Web Vitals tracking

## Documentation Standards

### File Organization
- **All docs in `/docs` folder**: Centralized documentation
- **Implementation plan**: Comprehensive architecture overview
- **Progress tracking**: Regular snapshots for context continuity
- **Decision log**: This file for architectural rationale

### Context Management
- **Regular progress updates**: After major component completions
- **Decision documentation**: When making architectural choices
- **Issue tracking**: Problems and their resolutions (see `issues.md`)
- **Feature logging**: Deviations from original specifications

### Lessons Learned Integration
See `docs/issues.md` for detailed lessons learned and recurring problem prevention strategies established during development.

## Phase 4 → Phase 5 Transition (June 21, 2025)

### Key Technical Insights for Phase 5

#### Multi-Hand Architecture Requirements
- **Current State**: Single-hand architecture in Redux gameSlice
- **Phase 5 Need**: Support for split hands (up to 4 hands per game)
- **Implementation Strategy**: Extend existing playerHands array, update currentHandIndex logic

#### Critical Code Locations for Phase 5
1. **gameThunks.ts**: SPLIT case is placeholder - needs full implementation
2. **gameSlice.ts**: Need playerSplit action and multi-hand state management
3. **gameLogic.ts**: Has createSplitHand() but needs integration
4. **GameArea.tsx**: UI must display multiple hands simultaneously

#### MUI v7 Layout Patterns Established
- ✅ **Working Pattern**: Stack/Box instead of Grid
- ✅ **Responsive Strategy**: direction={{ xs: 'column', md: 'row' }}
- ✅ **Component Structure**: Modular session components in src/components/session/

#### Session Analytics Integration Points
- **gameThunks.resolveHands()**: Already handles multi-hand outcomes
- **sessionSlice**: Ready for complex hand scenarios
- **UI Components**: Built to handle dynamic data updates

#### Performance Considerations Discovered
- **Real-time Updates**: Redux selectors work well for live UI updates
- **Component Rendering**: Session analytics components are optimized
- **Memory Management**: Need to consider multi-hand state cleanup

## Development Workflow Rules

### **🚫 Git Operations Restriction**
**Decision**: Only the user is allowed to perform `git add` and `git commit` operations.

**Rationale**:
- **User Control**: Maintain full control over commit timing and messages
- **Meaningful Commits**: Ensure commits represent logical development milestones
- **Quality Assurance**: User can review changes before committing
- **Workflow Integrity**: Prevent automated commits that may not align with development goals

**Implementation**:
- **Agent Responsibility**: Focus on code implementation and documentation
- **User Responsibility**: Handle all git staging and commit operations
- **Handoff Process**: Agent completes features and notifies user when ready for commit
- **No Automated Git**: Agent will not use `run_in_terminal` for git operations

**Examples**:
```bash
# ❌ AGENT CANNOT DO:
git add .
git commit -m "message"

# ✅ AGENT CAN DO:
- Implement features
- Update documentation  
- Run tests and builds
- Provide commit suggestions

# ✅ USER WILL DO:
git add .
git commit -m "feat: implement Phase 5 advanced features"
```

**Benefits**:
- **Quality Control**: User reviews all changes before committing
- **Meaningful History**: Commits represent actual development milestones
- **User Agency**: Maintains user control over project versioning
