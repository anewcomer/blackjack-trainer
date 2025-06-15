import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlackjackProvider, useBlackjack } from '../context/BlackjackContext';

// Mock the hooks used by BlackjackProvider
jest.mock('../hooks/useGameState', () => ({
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
    highlightParams: { type: null, playerKey: null, dealerKey: null },
    gameState: 'playerTurn'
  })
}));

jest.mock('../hooks/useGameActions', () => ({
  useGameActions: () => ({
    newGameHandler: jest.fn(),
    hitHandler: jest.fn(),
    standHandler: jest.fn(),
    doubleHandler: jest.fn(),
    splitHandler: jest.fn(),
    surrenderHandler: jest.fn(),
    playerCanHit: true,
    playerCanStand: true,
    playerCanDouble: true,
    playerCanSplit: false,
    playerCanSurrender: true
  })
}));

jest.mock('../hooks/useGameHistory', () => ({
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

// Create a test component that uses the blackjack context
const TestComponent = () => {
  const {
    playerHands,
    dealerHand,
    gameActive,
    message,
    hitHandler,
    standHandler,
    playerCanHit,
    playerCanStand
  } = useBlackjack();

  return (
    <div>
      <h1>Game Message: {message}</h1>
      <p data-testid="game-active">Game Active: {gameActive ? 'Yes' : 'No'}</p>
      <p data-testid="dealer-cards">Dealer Cards: {dealerHand.length}</p>
      <p data-testid="player-cards">Player Cards: {playerHands[0].cards.length}</p>
      <p data-testid="can-hit">Can Hit: {playerCanHit ? 'Yes' : 'No'}</p>
      <p data-testid="can-stand">Can Stand: {playerCanStand ? 'Yes' : 'No'}</p>
      <button onClick={hitHandler} disabled={!playerCanHit}>Hit</button>
      <button onClick={standHandler} disabled={!playerCanStand}>Stand</button>
    </div>
  );
};

describe('BlackjackContext Provider', () => {
  test('provides game state and actions to consuming components', () => {
    render(
      <BlackjackProvider>
        <TestComponent />
      </BlackjackProvider>
    );

    // Check that game state is correctly provided to the consuming component
    expect(screen.getByText('Game Message: Your turn')).toBeInTheDocument();
    expect(screen.getByTestId('game-active')).toHaveTextContent('Game Active: Yes');
    expect(screen.getByTestId('dealer-cards')).toHaveTextContent('Dealer Cards: 1');
    expect(screen.getByTestId('player-cards')).toHaveTextContent('Player Cards: 2');
    expect(screen.getByTestId('can-hit')).toHaveTextContent('Can Hit: Yes');
    expect(screen.getByTestId('can-stand')).toHaveTextContent('Can Stand: Yes');
    
    // Check that buttons are enabled
    expect(screen.getByText('Hit')).not.toBeDisabled();
    expect(screen.getByText('Stand')).not.toBeDisabled();
  });

  test('throws error when useBlackjack is used outside provider', () => {
    // Mock console.error to avoid React's error logging
    const originalError = console.error;
    console.error = jest.fn();

    // We expect render to throw an error
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useBlackjack must be used within a BlackjackProvider');

    // Restore console.error
    console.error = originalError;
  });
});
