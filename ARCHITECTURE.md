# Blackjack Trainer Architecture

This document outlines the architecture and design decisions of the Blackjack Trainer application.

## Application Architecture

### Overview

Blackjack Trainer is built using React and TypeScript with a component-based architecture. The application is designed to be modular, maintainable, and testable.

### Key Architectural Patterns

1. **React Context API for State Management**
   - Centralized game state using context providers
   - Reduced prop drilling through components
   - Clear separation of concerns with specialized context providers

2. **Custom Hooks for Logic Encapsulation**
   - Game state management (`useGameState`)
   - Game actions and rules (`useGameActions`)
   - History tracking and statistics (`useGameHistory`)

3. **Component Hierarchy**
   - Presentational components for UI elements
   - Container components for connecting to context
   - Clear prop interfaces for all components

## Code Organization

### Directory Structure

```
src/
├── components/     # React UI components
│   ├── Actions/      # Game action buttons
│   ├── App/          # Main application component
│   ├── Card/         # Card rendering component
│   ├── GameArea/     # Game table and hands display
│   ├── HistoryModal/ # Game history display
│   └── StrategyGuide/# Strategy chart display
│
├── context/        # React context providers
│   └── BlackjackContext.tsx # Main game context
│
├── hooks/          # Custom React hooks
│   ├── useGameActions.ts    # Game action handlers
│   ├── useGameHistory.ts    # History tracking
│   ├── useGameState.ts      # Core game state management
│   └── useDealerLogic.ts    # Dealer AI logic
│
├── logic/          # Game logic and utilities
│   ├── game/             # Core game mechanics
│   │   ├── gameTypes.ts     # Game-specific types
│   │   └── gameRules.ts     # Game rules configuration
│   ├── strategy/         # Strategy algorithms
│   │   ├── strategyTypes.ts # Strategy-related types
│   │   └── strategyData.ts  # Strategy chart data
│   └── utils/            # Helper functions
│       └── cardUtils.ts     # Card manipulation utilities
│
└── themes/         # UI theming
    └── darkTheme.ts    # Material UI theme configuration
```

### State Management

The application uses a combination of React Context and custom hooks to manage state:

1. **BlackjackContext**: Provides global game state and actions to all components
2. **useGameState**: Manages core game state like deck, hands, and game status
3. **useGameActions**: Encapsulates game actions like hit, stand, split, etc.
4. **useGameHistory**: Tracks game history and statistics

## Design Decisions

### Why React Context Instead of Redux?

- The application state has clear boundaries and doesn't require middleware
- Context API provides sufficient functionality for our state management needs
- Reduces bundle size and complexity

### Why Custom Hooks?

- Better separation of concerns
- Easier testing of individual pieces of logic
- Improved code reusability
- More maintainable codebase with smaller, focused functions

### TypeScript Usage

- Strong typing for game logic to prevent errors
- Interface-driven development for component props
- Type guards for more robust code
- Discriminated unions for complex state representations

## Future Architectural Improvements

1. **State Management Enhancement**
   - Consider implementing useReducer for more complex state transitions
   - Add state machine pattern for game flow

2. **Performance Optimizations**
   - Implement memoization for expensive calculations
   - Use React.memo for pure components

3. **Testing Infrastructure**
   - Unit tests for game logic
   - Component testing with React Testing Library
   - Integration tests for game flows
