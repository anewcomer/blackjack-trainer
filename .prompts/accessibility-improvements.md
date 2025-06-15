# Accessibility Improvements

## Overview

This document outlines the accessibility improvements made to the Blackjack Trainer application to ensure it's usable by people with diverse abilities and disabilities. These improvements follow WCAG (Web Content Accessibility Guidelines) best practices.

## Improvements Implemented

### 1. Semantic HTML

- Added proper semantic elements (`main`, `section`, `aside`, `footer`) to improve document structure
- Added descriptive ARIA landmark roles to key content areas
- Ensured proper heading structure (h1, h2, etc.)

### 2. ARIA Attributes

- Added `aria-label` attributes to provide context for screen readers
- Added `aria-live` regions for dynamic content updates
- Added `role` attributes to enhance element semantics
- Used `aria-disabled` to communicate disabled state

### 3. Focus Management

- Created a custom focus trap for modal dialogs (`useFocusTrap`)
- Added a "Skip to content" link for keyboard users
- Improved focus visibility for keyboard navigation
- Implemented programmatic focus for modal dialogs

### 4. Keyboard Navigation

- Created `useKeyboardNavigation` hook for keyboard shortcuts
- Added keyboard shortcuts for all game actions:
  - 'H' - Hit
  - 'S' - Stand
  - 'D' - Double
  - 'P' - Split
  - 'R' - Surrender
  - 'N' - New Game
  - 'I' - Show History
- Ensured all interactive elements are keyboard accessible
- Added Escape key functionality to close dialogs

### 5. Screen Reader Support

- Added descriptive text for game state changes
- Enhanced card components with proper text alternatives
- Added hidden descriptive text for visual indicators (correct/incorrect moves)
- Improved table headers and data relationships

### 6. Visual Enhancements

- Added CSS utilities to support visibility:
  - Visually hidden elements for screen reader only content
  - Focus indicators for keyboard users
  - High contrast mode support
  - Reduced motion preferences

### 7. Components Enhanced

1. **Card Component**:
   - Added descriptive `aria-label` for each card
   - Proper text alternatives for card suits and ranks

2. **Actions Component**:
   - Added keyboard shortcuts
   - Improved button accessibility with `aria-disabled`
   - Added proper button grouping with `role="toolbar"`

3. **GameArea Component**:
   - Added live regions for game updates
   - Enhanced status messages for screen readers
   - Added descriptive labels for player and dealer areas

4. **HistoryModal Component**:
   - Implemented focus trap
   - Added proper keyboard navigation
   - Enhanced table accessibility
   - Made close actions accessible via keyboard

5. **App Component**:
   - Added skip link for keyboard users
   - Enhanced overall document structure
   - Added keyboard shortcuts documentation

## Best Practices Followed

1. **Keyboard Accessibility**:
   - All interactive elements are keyboard accessible
   - Focus order follows natural reading order
   - Focus is visible and enhanced for keyboard users

2. **Screen Reader Support**:
   - All non-text content has text alternatives
   - Dynamic content changes are announced to screen readers
   - Proper ARIA attributes used according to standards

3. **Color and Contrast**:
   - No information conveyed by color alone
   - High contrast mode supported
   - Visual feedback enhanced for user actions

4. **Reduced Motion**:
   - Respects user preference for reduced motion
   - Animations can be disabled via CSS

## Testing

These accessibility improvements should be tested with:

1. Keyboard-only navigation
2. Screen readers (NVDA, JAWS, VoiceOver)
3. High contrast mode
4. Reduced motion settings
5. Various zoom levels and screen sizes

## Future Improvements

1. Add comprehensive automated accessibility testing
2. Implement further responsive design for different device sizes
3. Add more advanced screen reader announcements for game states
4. Improve card animations with ARIA live regions
5. Add sound effects with volume controls for additional feedback

---

These accessibility improvements ensure that the Blackjack Trainer application can be used by people with diverse abilities, including those who:

- Use screen readers
- Navigate by keyboard only
- Have motor impairments
- Have visual impairments
- Use assistive technologies
- Have cognitive disabilities

By following these accessibility best practices, we've created a more inclusive application that can be enjoyed by a wider audience.
