# Blackjack Trainer Project Notes

## Project Milestones & Progress

### Architecture Improvements

#### Objectives
- Refactor the large `useBlackjackGame` hook into smaller, focused hooks
- Create a custom context provider for state management
- Improve separation of concerns between UI and game logic
- Update components to use the context directly

#### Progress
- ✅ Created `BlackjackContext.tsx` with provider and custom hook
- ✅ Split large hook into focused components:
  - ✅ `useGameState` - Core game state management
  - ✅ `useGameActions` - Game actions (hit, stand, etc.)
  - ✅ `useGameHistory` - History and statistics
- ✅ Updated all components to consume the BlackjackContext directly
- ✅ Organized React component structure with clearer responsibilities

### Code Organization

#### Objectives
- Improve project folder structure
- Group related logic files into appropriate subdirectories
- Split types into logical groups
- Create index files for simplified imports

#### Progress
- ✅ Created subdirectories in the `logic` folder:
  - ✅ `game/` - Core game mechanics
  - ✅ `strategy/` - Strategy calculation
  - ✅ `utils/` - Utility functions
- ✅ Split types into logical groups:
  - ✅ `cardTypes.ts`
  - ✅ `gameTypes.ts`
  - ✅ `historyTypes.ts`
  - ✅ `strategyTypes.ts`
- ✅ Created `index.ts` files for simplified imports
- ✅ Added query parameter support with dedicated utility file (`queryParamsUtils.ts`)

### TypeScript Improvements

#### Objectives
- Use more precise types throughout the application
- Add proper interfaces for hook parameters
- Remove any implicit `any` types
- Add type guards where needed

#### Progress
- ✅ Added proper interfaces for hook parameters
- ✅ Added type annotations to callbacks and functions
- ✅ Removed implicit `any` types
- ✅ Used more specific types for game state
- ✅ Added proper return types for all functions

### Documentation Improvements

#### Objectives
- Create a comprehensive README
- Add proper JSDoc comments
- Create architecture documentation
- Add contributor guidelines

#### Progress
- ✅ Created a comprehensive README.md with:
  - Project description
  - Features list
  - How to play instructions
  - Technical details
  - Development workflow
- ✅ Added ARCHITECTURE.md with design decisions
- ✅ Added CONTRIBUTING.md with guidelines
- ✅ Added proper JSDoc comments to functions, especially in utility files
- ✅ Added query parameters documentation to README.md

### Accessibility Improvements

#### Objectives
- Add proper ARIA attributes
- Implement keyboard navigation
- Add focus management
- Support screen reader users
- Enhance visual accessibility

#### Progress
- ✅ Enhanced all components with proper ARIA attributes:
  - Added `aria-label` attributes
  - Added `aria-live` regions for dynamic content
  - Added proper `role` attributes
- ✅ Implemented keyboard navigation:
  - ✅ Created `useKeyboardNavigation` hook
  - ✅ Added shortcuts for all game actions:
    - 'H' - Hit
    - 'S' - Stand
    - 'D' - Double
    - 'P' - Split
    - 'R' - Surrender
    - 'N' - New Game
    - 'I' - Show History
- ✅ Added focus management:
  - ✅ Created `useFocusTrap` hook for modals
  - ✅ Added "Skip to content" link
  - ✅ Improved focus visibility
- ✅ Enhanced screen reader support:
  - ✅ Added descriptive text for game states
  - ✅ Added text alternatives for cards
  - ✅ Improved table accessibility
- ✅ Enhanced visual accessibility:
  - ✅ Added high contrast mode support
  - ✅ Improved color contrast
  - ✅ Added support for reduced motion preferences

### Animation and Performance

#### Objectives
- Add card animations
- Optimize React rendering
- Implement memoization
- Improve responsive design
- Support reduced motion preferences

#### Progress
- ✅ Added card animations:
  - ✅ Card dealing animations
  - ✅ Card flip animations
  - ✅ Hover effects
  - ✅ New card animations
- ✅ Implemented performance optimizations:
  - ✅ Used React.memo for pure components
  - ✅ Added custom comparison functions
  - ✅ Used useMemo for expensive calculations
  - ✅ Used useCallback for functions passed to child components
- ✅ Improved responsive design:
  - ✅ Enhanced mobile view
  - ✅ Added grid-based responsive layout
  - ✅ Improved card layout for smaller screens
  - ✅ Added flexible sizing for game areas

### Feature Enhancements

#### Objectives
- Add game history tracking
- Implement strategy guide
- Add session statistics
- Support query string parameters for testing

#### Progress
- ✅ Implemented game history tracking
- ✅ Added strategy guide component
- ✅ Created session statistics component
- ✅ Added query string parameter support:
  - ✅ Created `queryParamsUtils.ts` utility
  - ✅ Modified game initialization to handle parameters
  - ✅ Added support for dealer and player hand setting
  - ✅ Added documentation for query string usage

## Recent Features

### Query String Parameters for Game Setup

Added support for setting the dealer and player hands via URL query parameters, useful for testing and debugging:

```
http://localhost:3000/?dealer=AS,KH&player=9D,10C
```

- **Card Format**: Rank (A, 2-10, J, Q, K) followed by suit (S, H, D, C)
- **Extended Usage**: Can specify more than two cards for complex scenarios
- **Testing Examples**:
  - Player blackjack: `?dealer=10H,6D&player=AS,KD`
  - Dealer blackjack: `?dealer=AS,KD&player=10H,7D`
  - Player bust scenario: `?dealer=10H,5D&player=10S,7D,9C`
  - Soft hand play: `?dealer=10H,5D&player=AS,6D`

Implementation details:
- Created utility functions for parsing query parameters
- Added URL state management
- Implemented auto-standing for test scenarios
- Enhanced documentation

## Future Improvements

### Testing
- ✅ Add unit tests for utility functions
- ✅ Add component tests
- ✅ Add unit tests for game hooks and logic
- ⬜ Add additional component tests for complex UI components
- ⬜ Add integration tests for game flow
- ⬜ Add accessibility testing
- ⬜ Add end-to-end browser tests (planned for future)
- ⬜ Add browser tests (planned for later)

### Animation Enhancements
- ⬜ Add dealer card flip animation when hand is complete
- ⬜ Add win/loss celebration animations
- ⬜ Add card shuffle animation

### Performance Optimizations
- ⬜ Implement advanced memoization for more components
- ⬜ Use Web Workers for expensive calculations
- ⬜ Add code-splitting

### Accessibility Enhancements
- ⬜ Add comprehensive automated accessibility testing
- ⬜ Add sound effects with volume controls
- ⬜ Improve card animations with ARIA live regions

## Development Tips

### Using the get_errors Tool
Before running builds, use the `get_errors` tool to check for compilation issues:
```
Before checking code changes via the build process, use #get_errors to check files for issues.
```

### Testing with Query Parameters
Test different game scenarios using query parameters:
```
http://localhost:3000/?dealer=AS,KH&player=9D,10C
```

### Creating Utility Files
For new functionality, create dedicated utility files rather than adding code to existing files:
```
Let's create a new utility file for handling the query parameters functionality.
```

### Documentation-First Approach
Define features in documentation before implementation:
```
Let's start by documenting this feature in the README.md, then implement the code.
```
