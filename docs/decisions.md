# Architectural Decisions

## Code Verification Strategy

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
