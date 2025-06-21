# Blackjack Trainer - Functional Specifications

## Application Overview

The Blackjack Trainer is an interactive web application designed to teach players optimal blackjack strategy. The application provides:
- A simulated blackjack game environment
- Real-time feedback on player decisions versus optimal strategy
- Interactive strategy reference charts
- Detailed game history and session statistics
- Educational training focused on basic strategy

## Target Technology Stack
- **Frontend Framework**: React 19+ with TypeScript
- **UI Library**: Material-UI (MUI) v7+
- **State Management**: Redux Toolkit (RTK) with TypeScript support
- **Build Tool**: Create React App / Vite
- **Styling**: MUI theming system with emotion/styled
- **Deployment**: GitHub Pages with gh-pages package for static hosting

### State Management Requirements
- **Redux Implementation**: Use Redux Toolkit for predictable state management
- **Store Structure**: Centralized store for game state, session data, and UI state
- **Async Actions**: RTK Query or createAsyncThunk for any async operations
- **Type Safety**: Full TypeScript integration with Redux store
- **Performance**: Proper selector usage to prevent unnecessary re-renders
- **Rationale**: Previous implementations using React hooks exclusively encountered rendering and timing issues that were difficult to debug. Redux provides better state predictability and debugging capabilities.

### Deployment Requirements
- **Platform**: GitHub Pages for static file hosting
- **Build Process**: Standard React build process generating static assets
- **Deployment Tool**: gh-pages npm package for automated deployment
- **Repository**: Must maintain existing GitHub repository structure
- **Scripts**: Preserve existing npm scripts for build and deploy processes
- **Routing**: Client-side routing must be compatible with GitHub Pages hosting constraints

### Required Dependencies
- **Core React**: react, react-dom, react-scripts
- **UI Framework**: @mui/material, @mui/icons-material, @emotion/react, @emotion/styled
- **State Management**: @reduxjs/toolkit, react-redux
- **TypeScript**: typescript, @types/react, @types/react-dom, @types/node
- **Testing**: @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- **Deployment**: gh-pages
- **Development**: eslint for code quality

## Core Game Rules

### Blackjack Rules Implementation
- **Dealer Rules**: Dealer stands on soft 17
- **Player Options**: Hit, Stand, Double Down, Split, Surrender
- **Double After Split**: Allowed
- **Maximum Split Hands**: 4 hands maximum
- **Surrender**: Early surrender available on initial 2-card hands (not after splits)
- **Blackjack Payout**: Natural blackjack detection and handling
- **Card Values**: Standard blackjack values (A=1/11, face cards=10)

### Deck Management
- Standard 52-card deck
- Cards shuffled at start of each hand
- No cut card or deck penetration simulation
- Single deck per hand (new deck each deal)

## User Interface Layout

### Main Application Layout
```
┌─────────────────────────────────────────────────────────┐
│                    App Title Header                      │
├─────────────────────────┬───────────────────────────────┤
│                         │                               │
│      Game Area          │     Strategy Reference        │
│   (2/3 width)          │        (1/3 width)           │
│                         │                               │
│  ┌─ Dealer Area ─┐      │  ┌─ Strategy Tables ─┐        │
│  │ Cards & Score │      │  │ - Hard Totals     │        │
│  └───────────────┘      │  │ - Soft Totals     │        │
│                         │  │ - Pair Splitting  │        │
│  ┌─ Player Area ─┐      │  └───────────────────┘        │
│  │ Cards & Score │      │                               │
│  │ (Multi-hand)  │      │                               │
│  └───────────────┘      │                               │
│                         │                               │
│  ┌─ Action Buttons ─┐   │                               │
│  │ Hit|Stand|Double│    │                               │
│  │ Split|Surrender │    │                               │
│  │ NewGame|History │    │                               │
│  └─────────────────┘    │                               │
└─────────────────────────┴───────────────────────────────┘
```

### Responsive Design Requirements
- **Desktop**: Side-by-side layout (game area + strategy guide)
- **Tablet**: Stacked layout with collapsible strategy guide
- **Mobile**: Single column with tabbed strategy access

## Functional Components

### 1. Game Area Component

#### Dealer Display
- **Card Rendering**: Visual card representation with rank and suit
- **Hidden Card**: First dealer card hidden until dealer's turn
- **Score Display**: Hand value with "Dealer: X" format
- **Blackjack Detection**: Special highlighting for natural 21

#### Player Display  
- **Multi-Hand Support**: Display up to 4 hands when splitting
- **Active Hand Highlighting**: Visual indicator of current hand
- **Hand Status**: Show busted, stood, doubled, surrendered states
- **Score Display**: Hand value for each hand
- **Split Hand Indicators**: Clear labeling (Hand 1, Hand 2, etc.)

#### Visual Feedback System
- **Correct Decision**: Green flash/border on successful strategy
- **Incorrect Decision**: Red flash with optimal action display  
- **Active Area**: Highlight current player's turn vs dealer's turn
- **Outcome Display**: Win/Loss/Push status with color coding

### 2. Action Buttons Component

#### Game Action Buttons (Primary Row)
- **Hit**: Add card to current hand
- **Stand**: End current hand's turn
- **Double Down**: Double bet and take exactly one card
- **Split**: Split pairs into separate hands  
- **Surrender**: Forfeit hand for half bet return

#### Control Buttons (Secondary Row)
- **New Game**: Start fresh hand
- **Show History**: Open game history modal

#### Button States
- **Enabled/Disabled**: Based on game rules and current state
- **Visual Indicators**: Icons + text labels
- **Responsive Layout**: Grid layout adapting to screen size

### 3. Strategy Guide Component

#### Interactive Strategy Tables
- **Hard Totals**: Player totals 5-21 vs dealer upcards 2-A
- **Soft Totals**: Ace-X combinations vs dealer upcards
- **Pair Splitting**: All pairs vs dealer upcards

#### Table Features
- **Action Color Coding**: 
  - Stand (S) = Green
  - Hit (H) = Blue  
  - Double (D) = Orange
  - Split (P) = Purple
  - Surrender (R) = Red
- **Dynamic Highlighting**: Current decision cell highlighted in yellow
- **Responsive Tables**: Compact mobile-friendly layout
- **Tab Navigation**: Switch between Hard/Soft/Pairs

#### Strategy Reference Legend
- **Action Definitions**: Clear explanation of S/H/D/P/R codes
- **Rule Assumptions**: H17, DAS notation
- **Educational Context**: Basic strategy reference disclaimer

### 4. Card Component

#### Visual Card Design
- **Standard Playing Card**: Rank and suit display
- **Color Coding**: Red suits (♥♦) vs black suits (♠♣)
- **Hidden State**: Face-down card representation
- **Responsive Sizing**: Scales appropriately for device
- **Accessibility**: Proper ARIA labels

### 5. Game History Modal

#### Session Statistics Display
- **Decision Accuracy**: Correct moves / Total decisions percentage
- **Game Outcomes**: Wins / Losses / Pushes count
- **Hands Played**: Total hands in session

#### Detailed Hand History
- **Chronological List**: Most recent hands first
- **Hand Details**: 
  - Initial cards dealt
  - Actions taken with correctness indicators
  - Final hand values and outcomes
  - Dealer actions and final value
- **Action Log**: Step-by-step decision tracking
- **Mistake Highlighting**: Clear indicators of suboptimal plays

#### Data Export Features
- **CSV Download**: Complete session data export
- **Session Reset**: Clear history and start fresh
- **Timestamping**: Accurate game timing records

## Game Flow Logic

### 1. New Game Initialization
```
1. Create and shuffle new deck
2. Deal initial two cards to player
3. Deal initial two cards to dealer (one hidden)
4. Check for natural blackjacks
5. If no blackjacks, begin player decision phase
6. Enable appropriate action buttons based on hand/rules
```

### 2. Player Decision Phase
```
For each active hand:
1. Highlight current hand
2. Calculate available actions based on:
   - Hand composition (pairs, totals)
   - Game rules (DAS, surrender)
   - Number of cards (double only on 2 cards)
3. Enable corresponding action buttons
4. Wait for player action
5. Execute action and provide feedback
6. Advance to next hand or dealer phase
```

### 3. Strategy Evaluation System
```
On each player action:
1. Capture game state before action
2. Determine optimal action using basic strategy
3. Compare player action vs optimal
4. Update session statistics
5. Display feedback message
6. Highlight corresponding strategy table cell
7. Log action details for history
```

### 4. Dealer Play Logic
```
After all player hands resolved:
1. Reveal dealer hole card
2. Apply dealer drawing rules (stand on 17)
3. Animate dealer card draws with delays
4. Calculate final outcomes for all hands
5. Update game statistics
6. Display final results
7. Enable new game
```

### 5. Multi-Hand Management (Splits)
```
When splitting:
1. Create new hand from split card
2. Deal one card to each new hand
3. Handle Ace splitting rules (one card only)
4. Track hand indexes and navigation
5. Maintain separate action logs per hand
6. Calculate individual hand outcomes
```

## Strategy Engine

### Basic Strategy Implementation
- **Hard Totals Chart**: Traditional basic strategy for hard hands
- **Soft Totals Chart**: Optimal play for hands containing aces
- **Pair Splitting Chart**: When to split vs play as hard total
- **Surrender Strategy**: Optimal surrender decisions where allowed

### Decision Context Factors
- **Player Hand Composition**: Cards, total value, soft/hard
- **Dealer Upcard**: Visible dealer card value
- **Available Actions**: Rule-based action filtering
- **Hand History**: Split status, double eligibility

### Real-Time Highlighting
- **Dynamic Table Updates**: Highlight current decision in strategy tables
- **Multi-Table Coordination**: Show correct table (Hard/Soft/Pairs)
- **Immediate Feedback**: Instant strategy validation

## Educational Features

### Learning Reinforcement
- **Immediate Feedback**: Right/wrong indication on every decision
- **Optimal Action Display**: Show correct play on mistakes
- **Running Accuracy**: Track learning progress percentage
- **Decision Patterns**: Historical view of common mistakes

### Progressive Learning
- **Session Statistics**: Track improvement over time
- **Mistake Analysis**: Identify problematic scenarios
- **Strategy Reference**: Always-visible strategy charts
- **Hand Replay**: Review past decisions in detail

## Data Models

### Game State Management
```typescript
interface GameState {
  deck: Card[]
  playerHands: PlayerHand[]
  currentHandIndex: number
  dealerHand: Card[]
  gameActive: boolean
  canSurrender: boolean
  gameHistory: GameHistoryEntry[]
  sessionStats: SessionStats
}
```

### Player Hand Tracking
```typescript
interface PlayerHand {
  cards: Card[]
  busted: boolean
  stood: boolean
  doubled: boolean
  splitFromPair: boolean
  surrendered: boolean
  isBlackjack: boolean
  outcome: 'Win' | 'Loss' | 'Push' | null
  actionLog: ActionLogEntry[]
}
```

### Strategy Analysis
```typescript
interface ActionLogEntry {
  playerAction: string
  optimalAction: string
  wasCorrect: boolean
  handValueBefore: number
  handValueAfter: number
  cardDealt: Card | null
}
```

## Performance Requirements

### Responsiveness
- **Action Response**: < 100ms for button interactions
- **Animation Smoothness**: 60fps for card dealing animations
- **Table Highlighting**: Instant strategy table updates
- **Modal Loading**: < 200ms for history modal display

### Scalability
- **Session Length**: Support 100+ hands per session
- **History Storage**: Browser local storage for persistence
- **Memory Management**: Efficient hand history cleanup options

### Data Persistence Requirements
- **Session Data**: Store game history and statistics in browser localStorage
- **Data Format**: JSON serialization for game history and session stats
- **Storage Keys**: Use consistent naming convention (e.g., 'blackjack-trainer-*')
- **Data Cleanup**: Provide user option to clear stored data
- **Storage Limits**: Handle localStorage quota gracefully
- **Fallback**: Graceful degradation if localStorage unavailable

### Error Handling Requirements
- **Redux State Errors**: Graceful handling of invalid state transitions
- **LocalStorage Errors**: Handle quota exceeded and access denied scenarios
- **Component Errors**: React error boundaries for component failures
- **Invalid Game States**: Prevent and recover from impossible game conditions
- **Network Errors**: Handle deployment/loading failures gracefully
- **User Feedback**: Clear error messages without technical jargon

## Accessibility Requirements

### Keyboard Navigation
- **Tab Order**: Logical navigation through all interactive elements
- **Action Shortcuts**: Keyboard shortcuts for common actions (H/S/D)
- **Focus Indicators**: Clear visual focus states

### Screen Reader Support
- **Card Announcements**: Proper ARIA labels for all cards
- **Game State**: Announce score changes and game status
- **Action Feedback**: Verbal confirmation of player actions
- **Table Navigation**: Accessible strategy table navigation

### Visual Accessibility
- **Color Contrast**: WCAG AA compliance for all text
- **Color Independence**: Strategy indication beyond color coding
- **Responsive Text**: Scalable fonts for vision accessibility
- **High Contrast Mode**: Support for system accessibility preferences

## Future Enhancement Considerations

### Advanced Features (Not Required for Initial Implementation)
- **Multi-Deck Simulation**: 4, 6, 8 deck shoes with cutting
- **Card Counting Trainer**: Running count practice mode
- **Deviation Strategy**: Index play for advanced players
- **Betting Strategy**: Kelly criterion or basic betting progression
- **Tournament Mode**: Structured tournament simulation
- **Custom Rules**: House rule variations (H17/S17, 3:2/6:5 blackjack)

### Analytics Enhancements
- **Learning Curves**: Visual progress tracking over time
- **Heat Maps**: Mistake frequency by situation
- **Personalized Training**: Focus on player's weak areas
- **Achievement System**: Gamification elements for motivation
