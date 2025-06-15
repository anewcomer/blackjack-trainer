# Blackjack Trainer Project Notes

## Project Overview

This document tracks the progress, improvements, features, and future plans for the Blackjack Trainer application. It serves as a central reference for anyone working on the project.

## Recent Features and Fixes

### Enhanced Card Component (Completed June 2025)
- ✅ Added a visually appealing card back with gradients and patterns
- ✅ Improved card face design for better aesthetics
- ✅ Doubled card size from 40x60px to 80x120px with proportional internal elements
- ✅ Fixed animation for dealer hole card so it no longer fades out or flies away

### Strategy Highlight Improvements (Completed June 2025)
- ✅ Fixed strategy highlight tool to update after player actions (hit, double)
- ✅ Ensured strategy guide accurately reflects current hand state

### Testing Infrastructure (Completed June 2025)
- ✅ Added VS Code task for running tests without watch mode
- ✅ Fixed all linting and TypeScript errors in test files
- ✅ Set up proper mocking patterns for complex components

### Fixed Errors and Issues (Completed June 2025)
- ✅ Fixed all TypeScript and linting errors across the project
- ✅ Fixed broken tests and updated test assertions
- ✅ Added proper mocks for Framer Motion and other dependencies
- ✅ Fixed ARIA role/label issues in components and tests
- ✅ Modified query parameter support to be one-way only (URL → state, not state → URL)

## Completed Milestones

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

### Query String Parameters for Game Setup (Completed May 2025)

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
- Modified to use query string only for initialization (one-way: URL → state)
- Implemented auto-standing for test scenarios
- Enhanced documentation

## Recent Features and Fixes

### Enhanced Card Component
- ✅ Added a visually appealing card back with gradients and patterns
- ✅ Improved card face design for better aesthetics
- ✅ Doubled card size from 40x60px to 80x120px with proportional internal elements
- ✅ Fixed animation for dealer hole card so it no longer fades out or flies away

### Strategy Highlight Improvements
- ✅ Fixed strategy highlight tool to update after player actions (hit, double)
- ✅ Ensured strategy guide accurately reflects current hand state



### Fixed Errors and Issues
- ✅ Fixed all TypeScript and linting errors across the project
- ✅ Fixed broken tests and updated test assertions
- ✅ Added proper mocks for Framer Motion and other dependencies
- ✅ Fixed ARIA role/label issues in components and tests
- ✅ Added VS Code task to run tests without watch mode

## Testing Strategy and Implementation

### Testing Approach

We use a multi-layered testing strategy with Jest and React Testing Library:

1. **Unit Tests**: Verify individual functions and components work correctly in isolation
2. **Component Tests**: Validate UI components render correctly with different props/states
3. **Integration Tests**: Ensure different parts of the application work together properly
4. **End-to-End Tests**: Browser-based tests to validate complete user flows (planned for future)

### Testing Infrastructure

- ✅ Set up Jest with React Testing Library
- ✅ Created consistent mocking patterns for complex components
- ✅ Added VS Code task for running tests without watch mode
- ✅ Fixed all linting and TypeScript errors in test files

### Implemented Tests

| Category | Test File | Coverage |
|---------|----------|----------|
| **Utility Tests** | `blackjackUtils.test.ts` | Hand value calculation, deck creation, card dealing |
| | `queryParamsUtils.test.ts` | URL parameter parsing, game state handling |
| **Hook Tests** | `useGameActions.test.ts` | Game actions (hit, stand, etc.) |
| | `useGameState.test.ts` | Game state management |
| **Component Tests** | `Card.test.tsx` | Card rendering in various states |
| | `GameArea.test.tsx` | Game area composition and rendering |
| | `Actions.test.tsx` | Game action buttons |
| | `HandArea.test.tsx` | Player and dealer hand areas |
| **Context Tests** | `BlackjackContext.test.tsx` | Context provider functionality |

### Running Tests

```bash
# Run all tests (watch mode)
npm test

# Run tests once without watch mode
npm test -- --watchAll=false

# Run tests with coverage report
npm test -- --coverage

# Run specific tests
npm test -- ComponentName
```

## Future Improvements

### High Priority

| Area | Task | Status | Description |
|------|------|--------|-------------|
| **Testing** | Integration tests for game flow | ⬜ Planned | Test complete game scenarios |
| | Accessibility testing | ⬜ Planned | Verify screen reader compatibility |
| **Animation** | Dealer card flip animation | ⬜ Planned | Add flip animation when dealer's hand is revealed |
| **Development** | Test coverage reporting | ⬜ Planned | Add VS Code task for generating coverage reports |

### Medium Priority

| Area | Task | Status | Description |
|------|------|--------|-------------|
| **Animation** | Win/loss celebration animations | ⬜ Planned | Add visual feedback for game outcomes |
| **Accessibility** | Sound effects with volume controls | ⬜ Planned | Add audio feedback with accessibility options |
| **Performance** | Component memoization | ⬜ Planned | Implement advanced memoization for more components |
| **Development** | Task for running specific tests | ⬜ Planned | Add VS Code task to run individual test files |

### Low Priority

| Area | Task | Status | Description |
|------|------|--------|-------------|
| **Testing** | End-to-end browser tests | ⬜ Future | Add Playwright tests for complete user flows |
| **Animation** | Card shuffle animation | ⬜ Future | Add visual card shuffling animation |
| **Performance** | Web Workers | ⬜ Future | Use Web Workers for expensive calculations |
| | Code-splitting | ⬜ Future | Add code-splitting for better load times |
| **Accessibility** | ARIA live region improvements | ⬜ Future | Enhance card animations with ARIA live regions |

### Completed Improvements

| Area | Task | Status | Completion Date |
|------|------|--------|----------------|
| **Testing** | Unit tests for utility functions | ✅ Complete | May 2025 |
| | Component tests | ✅ Complete | May 2025 |
| | Unit tests for game hooks and logic | ✅ Complete | May 2025 |
| **Development** | VS Code task for running tests without watch mode | ✅ Complete | June 2025 |
| | Problem matchers for TypeScript and ESLint | ✅ Complete | June 2025 |

## Development Guidelines

### Quick Reference

| Task | Command/Approach |
|------|-----------------|
| Check for errors | Use `#get_errors` on files before building |
| Run tests (watch mode) | `npm test` |
| Run tests (once) | VS Code task: "Run tests once" or `npm test -- --watchAll=false` |
| Run specific tests | `npm test -- ComponentName` |
| Run build | VS Code task: "Run build" or `npm run build` |
| Run lint | VS Code task: "Run lint" or `npm run lint` |

### Best Practices

#### Code Quality
- Use `#get_errors` to check for compilation issues before building
- Create dedicated utility files for new functionality
- Follow TypeScript best practices with proper typing
- Maintain consistent code style using ESLint

#### Testing
- Keep tests independent of each other
- Write focused tests that test one behavior at a time
- Use descriptive test names that explain the scenario
- Test behavior, not implementation details
- Use snapshots sparingly and intentionally

#### Feature Development
- Follow a documentation-first approach
  - "Let's start by documenting this feature in the README.md, then implement the code."
- Test game scenarios using query parameters
  - Example: `http://localhost:3000/?dealer=AS,KH&player=9D,10C`
- Update notes.md with progress for continuous documentation

#### Accessibility
- Ensure keyboard navigation works for all features
- Provide proper ARIA attributes for custom components
- Test with screen readers periodically
- Support reduced motion preferences
