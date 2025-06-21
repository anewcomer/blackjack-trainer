# Blackjack Trainer - Minimal Requirements

## Application Purpose
Create an interactive blackjack basic strategy trainer that teaches players optimal decision-making through immediate feedback and practice.

## Core Requirements

### Technology Stack (Fixed)
- **Frontend**: React 19+ with TypeScript
- **UI Framework**: Material-UI (MUI) v7+
- **State Management**: Redux Toolkit (RTK) with TypeScript support
- **Build Tool**: Create React App or Vite
- **Package Manager**: npm
- **Deployment**: GitHub Pages with gh-pages package

### Game Functionality
1. **Basic Blackjack Rules**
   - Standard 52-card deck, shuffled each hand
   - Player receives 2 cards, dealer receives 2 cards (one hidden)
   - Card values: A=1/11, face cards=10, others face value
   - Player wins with 21, loses with >21 (bust)
   - Dealer stands on 17, hits on 16 or less

2. **Player Actions**
   - Hit: Take another card
   - Stand: End turn with current total
   - Double Down: Double bet, take exactly one card (on 2-card hands only)
   - Split: Split pairs into separate hands (when applicable)
   - Surrender: Forfeit hand for half bet (on 2-card hands only, if not split)

3. **Game Flow**
   - New game deals initial cards
   - Player makes decisions for each hand
   - After all player hands complete, dealer plays automatically
   - Display final outcomes (Win/Loss/Push)

### Strategy Training Features
1. **Decision Feedback**
   - After each player action, show whether it was optimal or not
   - Display what the optimal action should have been if incorrect
   - Track running accuracy percentage

2. **Strategy Reference**
   - Display basic strategy charts (Hard totals, Soft totals, Pairs)
   - Highlight the current decision scenario in the chart
   - Charts should be accessible while playing

3. **Session Tracking**
   - Track decisions made, correct vs incorrect
   - Track game outcomes (wins/losses/pushes)
   - Ability to view session history
   - Option to reset session stats

### User Interface Requirements
1. **Layout**
   - Game area showing dealer and player cards with scores
   - Action buttons for player decisions
   - Strategy reference charts
   - Session statistics display

2. **Visual Feedback**
   - Clear indication of correct vs incorrect decisions
   - Visual distinction between active and inactive hands (for splits)
   - Card animations or transitions when dealing

3. **Responsive Design**
   - Must work on desktop, tablet, and mobile devices
   - Strategy charts should remain accessible on all screen sizes

### Accessibility Requirements
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Proper ARIA labels and announcements

### Technical Requirements
- User can play multiple hands of blackjack
- User receives immediate feedback on strategy decisions
- User can view and reference basic strategy charts
- User can track their learning progress over time
- Application works smoothly on all target devices

### Deployment Requirements
- **Platform**: GitHub Pages static hosting
- **Build Process**: Standard React production build
- **Deployment Method**: Automated using gh-pages npm package
- **Repository**: Maintain existing GitHub repository structure
- **Scripts**: Include npm scripts for deployment (build, predeploy, deploy)
- **Compatibility**: Ensure build output is compatible with GitHub Pages routing

### Package Configuration Requirements
- **Homepage URL**: Must include "homepage": "https://anewcomer.github.io/blackjack-trainer"
- **Deploy Script**: Must include gh-pages deployment with correct repository reference
- **ESLint Config**: Include react-app and react-app/jest extensions
- **Browserslist**: Standard React browserslist configuration for production and development

## Out of Scope (for initial version)
- Multiple deck shoes
- Card counting features
- Betting systems
- Advanced strategy variations
- Multiplayer functionality
- Sound effects
- User accounts/persistence across sessions

## Notes
- Basic strategy should assume H17 (dealer hits soft 17), DAS (double after split allowed)
- The application is educational - focus on learning rather than gambling simulation
- Prioritize clear, immediate feedback over complex animations
- Strategy accuracy is more important than visual polish
