# Blackjack Trainer

A React-based application for learning optimal Blackjack strategy through interactive play and feedback.

![Blackjack Trainer Screenshot](screenshot.png)

## 🎮 Features

- **Interactive Gameplay**: Play hands of blackjack with a simulated dealer
- **Strategy Training**: Get real-time feedback on your decisions
- **Strategy Guide**: Visual guide showing the optimal play for every situation
- **Game History**: Track your gameplay history and statistics
- **Performance Stats**: See how well you're following optimal strategy
- **Accessibility Support**: Full keyboard navigation, screen reader support, and focus management
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Testing Tools**: Query parameter support for setting up specific game scenarios

## 🎯 Purpose

This application is designed to help players learn optimal blackjack strategy through practice. The trainer provides immediate feedback on each decision, helping users understand why certain plays are better in specific situations.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/anewcomer/blackjack-trainer.git
   cd blackjack-trainer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## 📝 How to Play

1. Click "New Game" to start a hand
2. Make decisions using the action buttons:
   - **Hit**: Take another card (Keyboard: H)
   - **Stand**: Keep your current hand (Keyboard: S)
   - **Double**: Double your bet and take exactly one more card (Keyboard: D)
   - **Split**: If you have a pair, split them into two separate hands (Keyboard: P)
   - **Surrender**: Give up half your bet and end the hand (Keyboard: R)
3. The strategy guide on the right highlights the optimal play
4. The trainer will inform you if your play matched optimal strategy
5. View your game history and stats by clicking the "History" button (Keyboard: I)
6. Start a new game at any time (Keyboard: N)

## 🧠 Game Rules

- Dealer stands on soft 17
- Doubling after split is allowed
- Up to 4 split hands allowed
- Surrender is available on the initial hand only
- 8-deck shoe with continuous shuffling

## 📊 Strategy Basics

The optimal blackjack strategy differs based on three main hand types:
1. **Hard hands**: Hands without an Ace or with an Ace counted as 1
2. **Soft hands**: Hands with an Ace counted as 11
3. **Pairs**: Initial two-card hands with matching ranks

## 🦮 Accessibility Features

The Blackjack Trainer is designed to be accessible to users with diverse abilities:

### Keyboard Navigation
- **Full keyboard support**: All actions can be performed without a mouse
- **Keyboard shortcuts**: Quick access to common actions (see How to Play section)
- **Focus management**: Clear focus indicators and logical tab order
- **Skip link**: "Skip to content" link for keyboard users

### Screen Reader Support
- **Semantic HTML**: Proper document structure with semantic landmarks
- **ARIA attributes**: Enhanced context for assistive technologies
- **Live regions**: Dynamic updates announced to screen readers
- **Text alternatives**: All visual elements have text descriptions

### Visual Enhancements
- **High contrast support**: Compatible with high contrast mode
- **Flexible text sizing**: Content remains usable when zoomed
- **Color independence**: Information is not conveyed by color alone
- **Reduced motion**: Respects user preferences for reduced motion

### Tested With
- NVDA and JAWS screen readers
- Keyboard-only navigation
- Various zoom levels and screen sizes

## 🔧 Technical Highlights

### React Architecture
- **Context API**: Centralized state management using React Context
- **Custom Hooks**: Modular, reusable hooks for specific functionalities
- **Component Structure**: Logical separation of UI and business logic

### Performance Optimizations
- **Memoization**: Strategic use of `useMemo` and `useCallback`
- **React.memo**: Preventing unnecessary re-renders in pure components
- **Batched Updates**: Grouped state updates to minimize render cycles

### Animation
- **Card Animations**: Smooth animations for card dealing and flips
- **Transition Effects**: Visual feedback for game state changes
- **Reduced Motion Support**: Respects user preference for reduced motion

### Code Quality
- **TypeScript**: Strong typing throughout the application
- **JSDoc Comments**: Comprehensive documentation of functions and components
- **Modular Design**: Separated concerns for better maintainability

## 🛠️ Development

### Available Scripts

- `npm start`: Run the app in development mode
- `npm test`: Run the test suite
- `npm run build`: Build the app for production
- `npm run lint`: Run ESLint on the codebase
- `npm run lint fix`: Automatically fix linting issues where possible
- `npm run deploy`: Deploy the app to GitHub Pages

### Project Structure

```
src/
├── components/     # React components
│   ├── Actions/    # Game action buttons
│   ├── App/        # Main application component
│   ├── Card/       # Card display component
│   ├── GameArea/   # Game board and card areas
│   ├── HistoryModal/ # Game history and statistics
│   └── StrategyGuide/ # Strategy chart display
├── context/        # React context providers
│   └── BlackjackContext.tsx # Game state and actions provider
├── hooks/          # Custom React hooks
│   ├── useBlackjackGame.ts # Main game logic (legacy)
│   ├── useFocusTrap.ts     # Accessibility focus management
│   ├── useGameActions.ts   # Game actions (hit, stand, etc.)
│   ├── useGameAreaEffects.ts # UI effects for game area
│   ├── useGameHistory.ts   # History tracking and statistics
│   ├── useGameState.ts     # Core game state management
│   └── useKeyboardNavigation.ts # Keyboard shortcuts
├── logic/          # Game logic and utilities
│   ├── game/       # Core game mechanics
│   ├── strategy/   # Strategy algorithms
│   └── utils/      # Helper functions
│       └── queryParamsUtils.ts # Query parameter handling
├── themes/         # UI theming
│   ├── accessibility.css   # Accessibility enhancements
│   └── darkTheme.ts        # Dark mode theme
└── index.tsx       # Application entry point
```

### Query String Parameters

The application supports setting up specific game scenarios through URL query parameters, which is useful for testing and debugging specific situations.

#### Basic Usage

You can specify the initial dealer and player cards using the `dealer` and `player` query parameters:

```
http://localhost:3000/?dealer=AS,KH&player=9D,10C
```

This sets up a game with:
- **Dealer**: Ace of Spades (hole card) and King of Hearts (up card)
- **Player**: 9 of Diamonds and 10 of Clubs

#### Card Format

Each card is specified using its rank followed by its suit:

- **Rank**: A (Ace), 2-10, J (Jack), Q (Queen), K (King)
- **Suit**: S (Spades ♠), H (Hearts ♥), D (Diamonds ♦), C (Clubs ♣)

Cards are comma-separated without spaces.

#### Extended Usage

You can also specify more than two cards for testing complex scenarios:

```
http://localhost:3000/?dealer=AS,KH,4D&player=9D,10C,2S
```

This will:
- Give the dealer three cards: Ace of Spades, King of Hearts, and 4 of Diamonds 
- Give the player three cards: 9 of Diamonds, 10 of Clubs, and 2 of Spades

When the player has three or more cards:
- If the total is 21 or higher, the player will automatically stand
- If the total exceeds 21, the player is automatically busted

This allows testing various end-game scenarios.

#### Examples

1. Test player blackjack: `?dealer=10H,6D&player=AS,KD`
2. Test dealer blackjack: `?dealer=AS,KD&player=10H,7D`
3. Test player bust scenario: `?dealer=10H,5D&player=10S,7D,9C`
4. Test soft hand play: `?dealer=10H,5D&player=AS,6D`

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Blackjack Strategy Charts](https://www.blackjackapprenticeship.com/blackjack-strategy-charts/) for strategy reference
- [Material-UI](https://mui.com/) for UI components
- [React](https://reactjs.org/) for the UI framework
- [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/) for accessibility guidelines
- [Framer Motion](https://www.framer.com/motion/) for animation capabilities
