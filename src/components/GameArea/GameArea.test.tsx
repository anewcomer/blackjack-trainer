import React from 'react';
import { render, screen } from '@testing-library/react';
import GameArea from './GameArea';
import { BlackjackProvider } from '../../context/BlackjackContext';
import { ThemeProvider } from '@mui/material/styles';
import darkTheme from '../../themes/darkTheme';

// Mock the hooks used by BlackjackProvider
jest.mock('../../hooks/useGameState', () => ({
  useGameState: () => ({
    playerHands: [{
      cards: [
        { rank: '10', suit: '♥', value: 10, id: '10-♥-1' },
        { rank: 'J', suit: '♣', value: 10, id: 'J-♣-1' }
      ],
      busted: false,
      stood: false,
      doubled: false,
      splitFromPair: false,
      surrendered: false,
      isBlackjack: false,
      outcome: null,
      initialCardsForThisHand: [],
      actionsTakenLog: []
    }],
    currentHandIndex: 0,
    dealerHand: [{ rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' }],
    gameActive: true,
    message: 'Your turn',
    hideDealerFirstCard: true,
    highlightParams: { row: null, col: null },
    gameState: 'playerTurn'
  })
}));

jest.mock('../../hooks/useGameActions', () => ({
  useGameActions: () => ({
    hit: jest.fn(),
    stand: jest.fn(),
    doubleDown: jest.fn(),
    split: jest.fn(),
    surrender: jest.fn(),
    dealNewHand: jest.fn(),
    playerCanHit: true,
    playerCanStand: true,
    playerCanDouble: true,
    playerCanSplit: false,
    playerCanSurrender: true
  })
}));

jest.mock('../../hooks/useGameHistory', () => ({
  useGameHistory: () => ({
    gameHistory: [],
    sessionStats: { 
      correctMoves: 0, 
      incorrectMoves: 0, 
      totalDecisions: 0,
      handsPlayed: 0,
      wins: 0,
      losses: 0,
      pushes: 0
    },
    showHistoryModal: false,
    setShowHistoryModal: jest.fn()
  })
}));

// Mock child components to isolate testing of GameArea
jest.mock('./HandArea', () => {
  return {
    __esModule: true,
    default: ({ title, children }: { title: string, children: React.ReactNode }) => (
      <div data-testid={`hand-area-${title.toLowerCase()}`}>{title}{children}</div>
    )
  };
});

jest.mock('./StatusMessage', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="status-message">Status Message Mock</div>
  };
});

jest.mock('./CardList', () => {
  return {
    __esModule: true, 
    default: () => <div data-testid="card-list">Card List Mock</div>
  };
});

jest.mock('../Actions/Actions', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="actions">Actions Mock</div>
  };
});

describe('GameArea Component', () => {
  test('renders game areas and components', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <BlackjackProvider>
          <GameArea />
        </BlackjackProvider>
      </ThemeProvider>
    );

    // Check that HandAreas are rendered
    expect(screen.getByTestId('hand-area-dealer')).toBeInTheDocument();
    expect(screen.getByTestId('hand-area-player')).toBeInTheDocument();

    // Check for status message
    expect(screen.getByTestId('status-message')).toBeInTheDocument();
  });

  // Change the mock to test a different game state
  test('UI changes based on game state', () => {
    // Update the mock for useGameState to return a different game state
    jest.requireMock('../../hooks/useGameState').useGameState = () => ({
      playerHands: [{
        cards: [
          { rank: '10', suit: '♥', value: 10, id: '10-♥-1' },
          { rank: 'J', suit: '♣', value: 10, id: 'J-♣-1' }
        ],
        busted: false,
        stood: true, // Player has stood
        doubled: false,
        splitFromPair: false,
        surrendered: false,
        isBlackjack: false,
        outcome: null,
        initialCardsForThisHand: [],
        actionsTakenLog: []
      }],
      currentHandIndex: 0,
      dealerHand: [{ rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' }],
      gameActive: true,
      message: 'Dealer\'s turn',
      hideDealerFirstCard: false, // Dealer card is revealed
      highlightParams: { row: null, col: null },
      gameState: 'dealerTurn' // Changed to dealer's turn
    });
    
    render(
      <ThemeProvider theme={darkTheme}>
        <BlackjackProvider>
          <GameArea />
        </BlackjackProvider>
      </ThemeProvider>
    );

    // Actions should not be rendered during dealer's turn
    expect(screen.queryByTestId('actions')).not.toBeInTheDocument();
  });
});
