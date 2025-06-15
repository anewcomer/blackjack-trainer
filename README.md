# Blackjack Trainer

A React-based application for learning optimal Blackjack strategy through interactive play and feedback.

![Blackjack Trainer Screenshot](screenshot.png)

## 🎮 Features

- **Interactive Gameplay**: Play hands of blackjack with a simulated dealer
- **Strategy Training**: Get real-time feedback on your decisions
- **Strategy Guide**: Visual guide showing the optimal play for every situation
- **Game History**: Track your gameplay history and statistics
- **Performance Stats**: See how well you're following optimal strategy

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
   - **Hit**: Take another card
   - **Stand**: Keep your current hand
   - **Double**: Double your bet and take exactly one more card
   - **Split**: If you have a pair, split them into two separate hands
   - **Surrender**: Give up half your bet and end the hand
3. The strategy guide on the right highlights the optimal play
4. The trainer will inform you if your play matched optimal strategy

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
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── logic/          # Game logic and utilities
│   ├── game/       # Core game mechanics
│   ├── strategy/   # Strategy algorithms
│   └── utils/      # Helper functions
├── themes/         # UI theming
└── index.tsx       # Application entry point
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Blackjack Strategy Charts](https://www.blackjackapprenticeship.com/blackjack-strategy-charts/) for strategy reference
- [Material-UI](https://mui.com/) for UI components
- [React](https://reactjs.org/) for the UI framework
