# Testing Strategy for Blackjack Trainer

This document outlines the testing strategy for the Blackjack Trainer application to ensure code quality, reliability, and maintainability.

## Testing Layers

The testing strategy involves multiple testing layers:

1. **Unit Tests**: Verify individual functions and components work correctly in isolation
2. **Integration Tests**: Ensure different parts of the application work together properly
3. **Component Tests**: Validate UI components render correctly with different props/states
4. **End-to-End Tests**: Browser-based tests to validate complete user flows (future)

## Test Coverage

### Current Test Coverage

We've set up a solid foundation of unit tests covering:

- **Utility Functions**: Tests for card handling, calculation, and URL parameter functions
  - `blackjackUtils.test.ts`: Tests for core game utilities like hand value calculation
  - `queryParamsUtils.test.ts`: Tests for URL parameter handling for dealer/player hands

- **Game Logic**: Tests for the core game mechanics
  - Hook tests like `useGameActions.test.ts` to verify actions like hit, stand, etc.

- **React Context**: Tests for state management
  - `BlackjackContext.test.ts`: Testing the context provider and consumer patterns

- **UI Components**: Testing the rendering and behavior of UI components
  - `Card.test.tsx`: Testing card display with various states
  - `GameArea.test.tsx`: Testing game area composition and rendering

### Planned Test Coverage

- **Additional Component Tests**:
  - Actions component
  - HandArea component
  - Strategy Guide component
  - History Modal

- **Integration Tests**:
  - Game flow tests (dealing, playing hands, determining winners)
  - Strategy recommendations

- **Accessibility Tests**:
  - Screen reader compatibility
  - Keyboard navigation
  - Focus management

- **End-to-End Tests**:
  - Complete game flows using browser automation (Playwright)
  - User interactions and visual regression tests

## Testing Approach

1. **Testing Framework**: Using Jest with React Testing Library

2. **Mocking Strategy**: 
   - Mock external dependencies and API calls
   - Mock complex components when testing container components
   - Use Jest mock functions to verify function calls

3. **Test Naming Convention**:
   - Descriptive test names that explain the scenario and expected outcome
   - Group related tests with describe blocks

4. **Test Structure**:
   - Arrange: Set up test data and conditions
   - Act: Execute the code being tested
   - Assert: Verify the expected outcomes

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run specific tests
npm test -- ComponentName
```

## Continuous Integration

In a CI environment, tests should be automatically run:
- On pull requests
- Before deployments
- On scheduled intervals

## Best Practices

1. Keep tests independent - no test should depend on another test
2. Write focused tests that test one aspect at a time
3. Use descriptive test names
4. Maintain test data separately from test logic
5. Don't test implementation details, test behavior
6. Keep tests fast and efficient
7. Use snapshots sparingly and intentionally
