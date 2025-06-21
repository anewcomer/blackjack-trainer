# Blackjack Trainer

An interactive web application designed to teach and perfect optimal blackjack basic strategy. Master your blackjack skills with real-time feedback, strategy guidance, and comprehensive analytics.

🃏 **[Live Demo](https://anewcomer.github.io/blackjack-trainer)** 🃏

## Features

### 🎯 Core Training Features
- **Interactive Blackjack Simulator** - Full featured blackjack game with standard rules
- **Real-time Strategy Feedback** - Immediate indication of optimal vs. actual decisions
- **Strategy Reference Charts** - Interactive hard totals, soft totals, and pair splitting tables
- **Multi-hand Support** - Practice complex split scenarios up to 4 hands
- **Session Analytics** - Track accuracy, decision patterns, and improvement over time

### 🎮 Game Features
- **Complete Rule Set** - Hit, Stand, Double Down, Split, Surrender
- **Dealer Automation** - Accurate dealer play following house rules (stands on soft 17)
- **Hand Management** - Support for complex scenarios including splits and multiple hands
- **Outcome Tracking** - Win/Loss/Push tracking with detailed game history
- **Export Functionality** - Download session data for external analysis

### 🎨 User Experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Accessibility First** - Full keyboard navigation and screen reader support
- **Real-time Highlighting** - Strategy tables highlight current decision scenarios
- **Visual Feedback** - Color-coded success/error indicators
- **Dark/Light Themes** - Material-UI theming with user preference support

## Technology Stack

- **Frontend**: React 19+ with TypeScript
- **State Management**: Redux Toolkit (RTK) with full TypeScript integration
- **UI Framework**: Material-UI (MUI) v7+ with Emotion styling
- **Build Tool**: Create React App with React Scripts 5
- **Testing**: Jest, React Testing Library, Playwright E2E
- **Deployment**: GitHub Pages with automated gh-pages deployment

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/anewcomer/blackjack-trainer.git
cd blackjack-trainer

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Development
```bash
npm start          # Run development server with hot reload
npm test           # Run test suite (watch mode: npm run test:watch)
npm run lint       # Check code style with ESLint
npm run type-check # Validate TypeScript types
```

### Production
```bash
npm run build      # Create production build
npm run deploy     # Deploy to GitHub Pages (maintainers only)
```

## How to Use

### Basic Training Workflow
1. **Start a New Game** - Click "New Game" to deal initial cards
2. **Make Your Decision** - Choose Hit, Stand, Double, Split, or Surrender
3. **Get Instant Feedback** - See if your decision matches optimal strategy
4. **Learn from Mistakes** - Incorrect decisions show the optimal action
5. **Track Progress** - View session statistics and accuracy over time

### Strategy Learning
- **Reference Charts** - Use the strategy tables on the right panel (desktop) or via modal (mobile)
- **Current Scenario Highlighting** - The relevant strategy cell is highlighted for your current hand
- **Action Legend** - Color-coded actions: Hit (Blue), Stand (Green), Double (Orange), Split (Purple), Surrender (Red)

### Advanced Features
- **Multi-hand Splits** - Practice complex scenarios when splitting pairs
- **Game History** - Review detailed action-by-action history of your sessions
- **Export Data** - Download your session data for external analysis
- **Accessibility** - Use keyboard shortcuts: H (Hit), S (Stand), D (Double), P (Split), R (Surrender)

## Game Rules

### Standard Blackjack Rules
- **Dealer**: Stands on soft 17, hits on 16 or less
- **Doubling**: Allowed on any two cards, including after splits
- **Splitting**: Pairs can be split up to 4 hands maximum
- **Surrender**: Available on initial 2-card hands only
- **Deck**: Fresh 52-card deck shuffled for each hand

### Basic Strategy Implementation
- **Hard Totals**: Traditional basic strategy for hands without aces
- **Soft Totals**: Optimal play for hands containing aces counted as 11
- **Pair Splitting**: When to split vs. play as hard total
- **House Rules**: H17 (dealer hits soft 17), DAS (double after split allowed)

## Project Structure

```
src/
├── components/          # React components
│   ├── game/           # Game interface components
│   ├── strategy/       # Strategy tables and feedback
│   ├── session/        # Statistics and history
│   └── common/         # Reusable UI components
├── store/              # Redux state management
│   ├── gameSlice.ts    # Game state and actions
│   ├── sessionSlice.ts # Statistics and history
│   └── uiSlice.ts      # UI state and preferences
├── types/              # TypeScript type definitions
├── utils/              # Game logic utilities
└── data/               # Strategy charts and constants
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

### Testing
- **Unit Tests**: `npm test` - Redux slices, game logic, utility functions
- **Integration Tests**: React Testing Library for component interactions
- **E2E Tests**: Playwright for complex multi-hand scenarios
- **Type Checking**: `npm run type-check` for TypeScript validation

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Basic strategy charts based on mathematical analysis by Edward Thorp and others
- Built with Create React App and Material-UI for rapid development
- Inspired by the need for accessible blackjack training tools

---

**Disclaimer**: This application is for educational purposes only. It teaches basic strategy for blackjack but does not guarantee success in actual gambling scenarios. Please gamble responsibly.
