# Blackjack Trainer - Implementation Plan

## Overview
This document contains the complete technical implementation strategy for the Blackjack Trainer application, focusing on Redux-first architecture to avoid the timing and rendering issues encountered in previous hook-based implementations.

**Note**: This document contains all detailed implementation patterns, architectural decisions, and technical standards. See `instructions.md` for high-level guidance and workflow rules.

## Documentation Organization
All project documentation is centralized in the `docs/` folder for better organization:
- **Requirements & Specifications**: Core project requirements and design specifications
- **Implementation Guides**: Technical implementation roadmap and detailed patterns (this document)
- **Workflow & Standards**: High-level development guidance and workflow rules
- **Progress Tracking**: Development progress and context management for chat sessions

**Current Documentation Structure**:
- `instructions.md` - High-level development guidance and workflow standards
- `implementation-plan.md` - **This document** - Complete technical implementation details
- `progress.md` - Development progress tracking with project-specific lessons learned
- `lessons-learned.md` - Universal lessons from AI-assisted development (applicable to any project)
- `functional-specifications.md` - Core functionality requirements
- `user-experience-specifications.md` - UX/UI requirements
- `minimal-requirements.md` - Essential MVP features

### Directory Organization
```
blackjack-trainer/
├── docs/                    # All documentation files
│   ├── functional-specifications.md    # Core functionality requirements
│   ├── user-experience-specifications.md # UX/UI requirements
│   ├── minimal-requirements.md          # Essential MVP features
│   ├── instructions.md                  # High-level development guidance
│   ├── implementation-plan.md           # This technical roadmap
│   ├── progress.md                      # Development progress tracking
│   └── lessons-learned.md               # Universal AI-assisted development lessons
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── components/           # React components
│   │   ├── common/          # Reusable UI components
│   │   ├── game/            # Game-specific components
│   │   ├── strategy/        # Strategy guide components
│   │   └── layout/          # Layout and navigation
│   ├── store/               # Redux store configuration
│   │   ├── index.ts         # Store setup and root reducer
│   │   ├── gameSlice.ts     # Game state management
│   │   ├── sessionSlice.ts  # Session stats and history
│   │   └── uiSlice.ts       # UI state (modals, responsive)
│   ├── types/               # TypeScript type definitions
│   │   ├── game.ts          # Game-related types
│   │   ├── strategy.ts      # Strategy engine types
│   │   └── session.ts       # Session and history types
│   ├── utils/               # Utility functions
│   │   ├── gameLogic.ts     # Core blackjack logic
│   │   ├── strategyEngine.ts # Basic strategy evaluation
│   │   ├── cardUtils.ts     # Card manipulation utilities
│   │   └── constants.ts     # Game constants and rules
│   ├── data/                # Static data
│   │   └── strategyCharts.ts # Basic strategy lookup tables
│   ├── hooks/               # Custom React hooks (minimal usage)
│   │   └── useResponsive.ts # Responsive design helper
│   ├── theme/               # MUI theme configuration
│   │   └── index.ts         # Theme setup and customization
│   ├── App.tsx              # Main application component
│   ├── index.tsx            # Application entry point
│   └── index.css            # Global styles
├── .vscode/
│   └── tasks.json           # VSCode task configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .gitignore               # Git ignore rules
└── README.md                # Project overview and setup instructions
```

## Redux Store Architecture

### Store Structure Overview
The Redux store will be organized into three main slices to maintain clear separation of concerns:

```typescript
// Root State Shape
interface RootState {
  game: GameState;
  session: SessionState;
  ui: UIState;
}
```

### Redux Architecture Details

**Store Structure**:
- **gameSlice**: Core game state (hands, deck, phase, actions)
- **sessionSlice**: Statistics, history, learning analytics  
- **uiSlice**: UI state, modals, theme preferences

**Why Redux Toolkit Over Hooks**:
Previous hook-based implementations had rendering/timing issues with complex state:
- Multi-hand scenarios caused synchronization problems
- Action button states didn't update reliably
- Strategy evaluation required global state access

**Redux Benefits**:
- Predictable state updates with immutability
- Time-travel debugging capabilities
- Better testing isolation
- Proper state separation and modularity

**Async Actions (Thunks)**:
Game flow requires coordinated async operations:
- **startNewHand**: Deck creation, shuffling, initial dealing
- **playerAction**: Action validation, card dealing, state updates
- **dealerTurn**: Automated dealer play with timing delays
- **resolveHands**: Outcome calculation and result setting

### 1. Game Slice (`gameSlice.ts`)
**Purpose**: Manages all active game state and logic

```typescript
interface GameState {
  // Core Game State
  deck: Card[];
  playerHands: PlayerHand[];
  currentHandIndex: number;
  dealerHand: DealerHand;
  gamePhase: 'BETTING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'GAME_OVER';
  
  // Game Rules and Options
  canSurrender: boolean;
  doubleAfterSplit: boolean;
  maxSplitHands: number;
  
  // Current Turn State
  availableActions: ActionType[];
  lastAction: ActionResult | null;
  
  // Hand Resolution
  handOutcomes: HandOutcome[];
  gameResult: GameResult | null;
}
```

**Key Actions**:
- `dealNewHand()` - Initialize new game with shuffled deck
- `playerAction()` - Process hit, stand, double, split, surrender
- `dealerTurn()` - Execute dealer's automated play
- `evaluateHands()` - Calculate final outcomes
- `resetGame()` - Clear state for new hand

### 2. Session Slice (`sessionSlice.ts`)
**Purpose**: Tracks statistics, history, and learning progress

```typescript
interface SessionState {
  // Session Statistics
  stats: {
    handsPlayed: number;
    decisionsCorrect: number;
    decisionsTotal: number;
    accuracy: number;
    wins: number;
    losses: number;
    pushes: number;
  };
  
  // Detailed History
  gameHistory: GameHistoryEntry[];
  currentSessionStart: number;
  
  // Learning Analytics
  mistakePatterns: MistakePattern[];
  recentAccuracy: number[];
}
```

**Key Actions**:
- `recordDecision()` - Log player action vs optimal strategy
- `recordGameResult()` - Update win/loss statistics
- `addHistoryEntry()` - Store complete hand details
- `calculateAccuracy()` - Update running accuracy percentage
- `resetSession()` - Clear session data

### 3. UI Slice (`uiSlice.ts`)
**Purpose**: Manages interface state and user experience

```typescript
interface UIState {
  // Modal and Dialog State
  showHistory: boolean;
  showStrategyGuide: boolean;
  activeStrategyTab: 'HARD' | 'SOFT' | 'PAIRS';
  
  // Visual Feedback
  lastFeedback: FeedbackMessage | null;
  highlightedCell: StrategyCell | null;
  
  // Responsive Design
  screenSize: 'MOBILE' | 'TABLET' | 'DESKTOP';
  sidebarCollapsed: boolean;
  
  // Accessibility
  announcements: string[];
  reducedMotion: boolean;
}
```

**Key Actions**:
- `setFeedback()` - Display strategy feedback messages
- `highlightStrategy()` - Highlight relevant strategy table cell
- `toggleModal()` - Control modal visibility
- `updateScreenSize()` - Handle responsive layout changes

## Component Hierarchy

### 1. Layout Components

#### `App.tsx` - Root Application
- Redux store provider
- MUI theme provider
- Route configuration (if needed)
- Global error boundary

#### `GameLayout.tsx` - Main Layout Container
```typescript
// Responsive layout structure
<Container>
  <AppHeader />
  <Grid container>
    <Grid item xs={12} md={8}>
      <GameArea />
    </Grid>
    <Grid item xs={12} md={4}>
      <StrategyGuide />
    </Grid>
  </Grid>
  <FeedbackSnackbar />
  <GameHistoryModal />
</Container>
```

### 2. Game Components

#### `GameArea.tsx` - Central Game Interface
- Dealer display section
- Player hands display (supports multiple hands)
- Action buttons panel
- Game status messages

#### `DealerDisplay.tsx` - Dealer Cards and Score
```typescript
interface DealerDisplayProps {
  cards: Card[];
  score: number;
  hideHoleCard: boolean;
  isActive: boolean;
}
```

#### `PlayerDisplay.tsx` - Player Hands Management
```typescript
interface PlayerDisplayProps {
  hands: PlayerHand[];
  currentHandIndex: number;
  onHandSelect?: (index: number) => void;
}
```

#### `HandDisplay.tsx` - Individual Hand Component
```typescript
interface HandDisplayProps {
  hand: PlayerHand;
  isActive: boolean;
  handIndex: number;
  showOutcome: boolean;
}
```

#### `CardComponent.tsx` - Individual Card Rendering
```typescript
interface CardProps {
  card: Card;
  hidden?: boolean;
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
}
```

#### `ActionButtons.tsx` - Player Action Controls
```typescript
interface ActionButtonsProps {
  availableActions: ActionType[];
  onAction: (action: ActionType) => void;
  disabled: boolean;
}
```

### 3. Strategy Components

#### `StrategyGuide.tsx` - Strategy Reference Container
- Tabbed interface for Hard/Soft/Pairs
- Current situation highlighting
- Responsive collapse/expand functionality

#### `StrategyTable.tsx` - Individual Strategy Chart
```typescript
interface StrategyTableProps {
  tableType: 'HARD' | 'SOFT' | 'PAIRS';
  highlightedCell: StrategyCell | null;
  onCellHover?: (cell: StrategyCell) => void;
}
```

#### `StrategyLegend.tsx` - Action Code Explanations
- Color-coded action definitions (H/S/D/P/R)
- Rule assumptions display

### 4. Feedback and History Components

#### `FeedbackSnackbar.tsx` - Strategy Feedback Display
```typescript
interface FeedbackProps {
  message: FeedbackMessage;
  onClose: () => void;
  autoHideDuration: number;
}
```

#### `GameHistoryModal.tsx` - Session History Display
- Session statistics summary
- Detailed hand history with decisions
- Export functionality

#### `SessionStats.tsx` - Statistics Dashboard
```typescript
interface SessionStatsProps {
  stats: SessionStatistics;
  showDetailed: boolean;
}
```

## Development Phases

### Phase 1: Foundation Setup (Days 1-2)
**Objective**: Establish project structure and core Redux architecture

#### Tasks:
1. **Project Initialization**
   - Create React app with TypeScript template
   - Install and configure dependencies (MUI, Redux Toolkit, etc.)
   - Set up ESLint, Prettier configuration
   - Configure `package.json` with required scripts

2. **Redux Store Setup**
   - Create store configuration with RTK
   - Define TypeScript interfaces for all state shapes
   - Implement game slice with basic actions
   - Set up Redux DevTools integration

3. **VSCode Task Configuration**
   - Create tasks for build, test, lint, deploy
   - Configure development server task
   - Set up type checking task

4. **Basic Project Structure**
   - Create directory structure as outlined
   - Set up MUI theme configuration
   - Create basic App.tsx with providers

**Deliverables**:
- Fully configured React + TypeScript + Redux project
- Working development server
- VSCode tasks for common operations
- Basic store structure with placeholder actions

### Phase 2: Core Game Logic (Days 3-5)
**Objective**: Implement blackjack game mechanics and Redux state management

#### Tasks:
1. **Type Definitions**
   - Complete game-related TypeScript interfaces
   - Card, Hand, and Game state types
   - Action and strategy types

2. **Game Logic Implementation**
   - Card utility functions (shuffle, deal, calculate values)
   - Hand evaluation logic (blackjack, bust, soft/hard totals)
   - Game rules implementation (splits, doubles, surrender)

3. **Redux Game Slice**
   - Complete game state management actions
   - Hand dealing and card drawing
   - Player action processing
   - Dealer automation logic

4. **Strategy Engine**
   - Basic strategy lookup tables
   - Strategy evaluation function
   - Optimal action determination

**Deliverables**:
- Complete game logic functions
- Fully functional Redux game slice
- Strategy evaluation engine
- Unit tests for core logic

### Phase 3: Basic UI Components (Days 6-8)
**Objective**: Create essential game interface components

#### Tasks:
1. **Card and Hand Components**
   - Card component with suit/rank display
   - Hand display with multiple card support
   - Score calculation and display

2. **Game Area Layout**
   - Dealer and player sections
   - Basic responsive grid layout
   - Game status messaging

3. **Action Button System**
   - Dynamic button enabling/disabling
   - Action dispatching to Redux store
   - Basic visual feedback

4. **Redux Integration**
   - Connect components to Redux store
   - Implement selectors for efficient rendering
   - Test state updates and component re-rendering

**Deliverables**:
- Playable basic blackjack game
- Functional player actions (hit, stand, double, basic functionality)
- Redux-connected components
- Working dealer automation

### Phase 4: Strategy Integration (Days 9-11)
**Objective**: Add strategy evaluation and feedback systems

#### Tasks:
1. **Strategy Tables**
   - Hard totals chart component
   - Soft totals chart component  
   - Pair splitting chart component
   - Dynamic cell highlighting

2. **Feedback System**
   - Real-time strategy evaluation
   - Correct/incorrect decision feedback
   - Strategy table highlighting coordination

3. **Session Tracking**
   - Session statistics Redux slice
   - Decision logging and accuracy calculation
   - Basic statistics display

4. **Learning Features**
   - Mistake identification and logging
   - Running accuracy percentage
   - Decision pattern analysis

**Deliverables**:
- Complete strategy reference system
- Real-time feedback on all decisions
- Session statistics tracking
- Strategy table highlighting

### Phase 5: Advanced Features (Days 12-14)
**Objective**: Implement complex game scenarios and polish

#### Tasks:
1. **Multi-Hand Support**
   - Hand splitting implementation
   - Multiple hand management in Redux
   - Complex hand navigation and display

2. **Advanced Actions**
   - Double down implementation
   - Surrender functionality
   - Re-splitting pairs (up to 4 hands)

3. **Game History**
   - Detailed hand history tracking
   - History modal with full game details
   - Export functionality

4. **Edge Case Handling**
   - Complex split scenarios
   - Ace handling in splits
   - Multiple blackjacks resolution

**Deliverables**:
- Complete multi-hand splitting support
- All player actions fully implemented
- Comprehensive game history system
- Robust edge case handling

### Phase 6: UI Polish and Accessibility (Days 15-17)
**Objective**: Complete responsive design and accessibility features

#### Tasks:
1. **Responsive Design**
   - Mobile layout optimization
   - Tablet-specific adaptations
   - Desktop layout refinement

2. **Accessibility Implementation**
   - Keyboard navigation support
   - Screen reader ARIA labels
   - High contrast support
   - Focus management

3. **Visual Polish**
   - Card dealing animations
   - Smooth state transitions
   - Loading states and feedback
   - Error handling UI

4. **Theme and Styling**
   - Complete MUI theme customization
   - Color coding for strategy feedback
   - Consistent spacing and typography

**Deliverables**:
- Fully responsive design across all devices
- Complete accessibility compliance
- Polished visual design
- Smooth animations and transitions

### Phase 7: Testing and Deployment (Days 18-20)
**Objective**: Comprehensive testing and production deployment

#### Tasks:
1. **Testing Strategy**
   - Unit tests for Redux slices
   - Component integration tests
   - End-to-end testing for complex scenarios
   - Accessibility testing

2. **Performance Optimization**
   - Bundle size optimization
   - Redux selector optimization
   - Component re-render prevention
   - Accessibility performance

3. **Deployment Setup**
   - GitHub Pages configuration
   - Build process optimization
   - CI/CD pipeline setup (if applicable)

4. **Documentation**
   - Code documentation
   - User guide creation
   - Developer documentation
   - Performance benchmarks

**Deliverables**:
- Comprehensive test suite
- Production-ready build
- Deployed application on GitHub Pages
- Complete documentation

## Testing Strategy

### Testing Approach Overview

**Primary Testing Strategy (Preferred)**:
- **Unit Tests**: Jest + React Testing Library for component logic and Redux state
- **Integration Tests**: Testing Library for component interactions and state updates
- **Fast Feedback**: Use these methods for 90% of testing needs

### Testing Priorities (Fast to Slow)
1. **Unit Tests**: Redux slices, game logic, utility functions
2. **Component Tests**: React Testing Library for UI component behavior
3. **Integration Tests**: Component + Redux interactions
4. **Playwright E2E**: Only for scenarios requiring full browser context

### Verified Testing Strategy (Proven Successful)
Based on our completed Phase 7 testing (89 tests passing across 7 test suites):

**Redux Testing Approach**:
- Start with integration tests to verify store architecture
- Individual slice tests with proper TypeScript types
- Use `get_errors` tool consistently for TypeScript validation
- Fix Redux slice test structure to match actual state interfaces

**Key Success Patterns**:
- UIState properties: Match test expectations with actual properties
- Type alignment: Ensure tests align with actual interface structures
- Progressive testing: Integration first, then detailed unit tests
- Use VSCode tasks for efficient test running

**Critical Test Areas** (validated):
- Redux Store Integration: Verify all slices work together
- Game slice: Complex thunk integration and state management
- Session slice: Statistics and decision tracking
- UI slice: Modal management and feedback systems
- Utility functions: Card logic and game mechanics

### Playwright MCP Integration (Use Sparingly)
- **Purpose**: End-to-end testing for complex scenarios that cannot be tested with faster methods
- **Browser Support**: Chrome only (sufficient for development and validation)
- **Installation**: Install Playwright MCP server for VS Code integration
- **Performance Note**: Use sparingly - prefer faster testing strategies (unit tests, React Testing Library) for routine validation

### Playwright MCP - Limited Use Cases Only
Use Playwright MCP only for scenarios that cannot be tested with faster methods:
- **Complex Multi-Hand Splits**: Full browser testing of 3-4 simultaneous hands
- **Strategy Table Visual Validation**: Screenshot-based verification of highlighting accuracy
- **Performance Bottlenecks**: When Redux state issues require browser-level debugging
- **Final Deployment Validation**: Testing GitHub Pages build in actual Chrome browser
- **Responsive Layout Edge Cases**: When CSS-in-JS behavior differs from test environment

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

## Build and Deployment Configuration

### Package.json Configuration
```json
{
  "name": "blackjack-trainer",
  "version": "1.0.0",
  "homepage": "https://anewcomer.github.io/blackjack-trainer",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### Dependencies
**Core React & TypeScript**:
- `react` ^19.0.0
- `react-dom` ^19.0.0
- `react-scripts` ^5.0.0
- `typescript` ^5.0.0

**Redux State Management**:
- `@reduxjs/toolkit` ^2.0.0
- `react-redux` ^9.0.0

**Material-UI**:
- `@mui/material` ^7.0.0
- `@mui/icons-material` ^7.0.0
- `@emotion/react` ^11.0.0
- `@emotion/styled` ^11.0.0

**Testing**:
- `@testing-library/react` ^16.0.0
- `@testing-library/jest-dom` ^6.0.0
- `@testing-library/user-event` ^14.0.0

**Deployment**:
- `gh-pages` ^6.0.0

### VSCode Tasks Configuration
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Development Server",
      "type": "shell",
      "command": "npm start",
      "group": "build",
      "isBackground": true,
      "problemMatcher": "$tsc-watch"
    },
    {
      "label": "Build Production",
      "type": "shell", 
      "command": "npm run build",
      "group": "build"
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "npm test",
      "group": "test"
    },
    {
      "label": "Deploy to GitHub Pages",
      "type": "shell",
      "command": "npm run deploy",
      "group": "build",
      "dependsOn": "Build Production"
    },
    {
      "label": "Lint Code",
      "type": "shell",
      "command": "npm run lint",
      "group": "build"
    },
    {
      "label": "Type Check",
      "type": "shell",
      "command": "npm run type-check", 
      "group": "build"
    }
  ]
}
```

## Risk Management

### Technical Risks
1. **Redux State Complexity**: Multi-hand splitting creates complex state trees
   - **Mitigation**: Comprehensive unit testing, clear state normalization
   
2. **Component Re-rendering**: Previous implementations had performance issues
   - **Mitigation**: Proper selector usage, React.memo where appropriate
   
3. **Strategy Table Highlighting**: Synchronizing game state with visual feedback
   - **Mitigation**: Centralized highlighting logic in Redux, testing edge cases

### User Experience Risks
1. **Mobile Layout Complexity**: Strategy tables may be cramped on small screens
   - **Mitigation**: Modal/overlay approach for mobile strategy guide
   
2. **Accessibility Compliance**: Complex game interface may be difficult to navigate
   - **Mitigation**: Early accessibility testing, keyboard-first design

### Deployment Risks
1. **GitHub Pages Limitations**: Client-side routing constraints
   - **Mitigation**: Single-page application design, no complex routing needed

## Success Metrics

### Technical Success Criteria
- [ ] All Redux slices handle complex game states without errors
- [ ] Component re-rendering optimized (< 5 re-renders per action)
- [ ] 95%+ test coverage on core game logic
- [ ] No accessibility violations (axe-core)
- [ ] Production build < 2MB total size

### Functional Success Criteria
- [ ] All blackjack rules implemented correctly
- [ ] Strategy evaluation 100% accurate for basic strategy
- [ ] Multi-hand splitting supports up to 4 hands
- [ ] Session statistics tracking works reliably
- [ ] Responsive design works on all target devices

### User Experience Success Criteria
- [ ] Strategy feedback appears within 100ms of action
- [ ] Keyboard navigation covers all functionality
- [ ] Screen reader can play complete game
- [ ] Mobile interface remains usable with strategy guide

## Next Steps

1. **Initialize Project Structure**: Create React app with TypeScript and required dependencies
2. **Set Up Redux Store**: Implement store configuration and basic slice structure
3. **Create VSCode Tasks**: Set up development workflow automation
4. **Begin Type Definitions**: Create comprehensive TypeScript interfaces
5. **Start Core Game Logic**: Implement card utilities and basic game mechanics

This implementation plan provides a comprehensive roadmap for building the Blackjack Trainer application with a Redux-first approach, emphasizing testing, accessibility, and maintainable code architecture.

### Game Rules Implementation Standards

**Blackjack Rules Configuration**:
- **Dealer hits soft 17**: Configurable via GAME_CONFIG
- **Double after split**: Allowed by default
- **Surrender allowed**: First two cards only
- **Max split hands**: 4 hands maximum

**Hand Value Calculation Standards**:
- **Ace handling**: Dynamic soft/hard calculation
- **Bust detection**: Immediate when hand > 21
- **Blackjack detection**: 21 with exactly 2 cards (excludes splits)

**Strategy Engine Integration**:
- **Basic Strategy Tables**: Static data in strategyCharts.ts
- **Real-time Feedback**: Compare player actions to optimal strategy
- **Action Logging**: Track decisions for learning analytics

### Component Architecture Standards

**CRITICAL INSTRUCTION**: Prefer small, decomposed files and classes that follow the single responsibility principle.

**Implementation Requirements**:
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
