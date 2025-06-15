import { renderHook, act } from '@testing-library/react';
import { useGameActions } from './useGameActions';
import * as queryParamsUtils from '../logic/utils/queryParamsUtils';

// Mock the dependencies
jest.mock('../logic/utils/queryParamsUtils', () => ({
  parseQueryParams: jest.fn(),
  shouldAutoPlayDealer: jest.fn().mockReturnValue(false)
}));

// Mock the blackjackDealer module
jest.mock('../logic/blackjackDealer', () => ({
  dealerPlayLogic: jest.fn().mockImplementation((dealerCards, deck) => {
    // Simple mock that just returns what it received
    return {
      dealerCards,
      deck,
      log: []
    };
  })
}));

// Mock the blackjackStrategy module
jest.mock('../logic/blackjackStrategy', () => ({
  getOptimalPlay: jest.fn().mockReturnValue('hit'),
  getStrategyKeysForHighlight: jest.fn()
}));

describe('useGameActions Hook', () => {
  // Set up common test data
  const mockCard1 = { rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' };
  const mockCard2 = { rank: '10', suit: '♥', value: 10, id: '10-♥-1' };
  const mockCard3 = { rank: '2', suit: '♦', value: 2, id: '2-♦-1' };
  
  // Create a complete mock game state that matches the GameStateForActions interface
  const mockGameState = {
    deck: [mockCard1, mockCard2, mockCard3],
    setDeck: jest.fn(),
    dealerHand: [],
    setDealerHand: jest.fn(),
    playerHands: [],
    setPlayerHands: jest.fn(),
    currentHandIndex: 0,
    setCurrentHandIndex: jest.fn(),
    gameState: 'new',
    setGameState: jest.fn(),
    message: '',
    setMessage: jest.fn(),
    highlightParams: { 
      type: null,
      playerKey: null,
      dealerKey: null
    },
    setHighlightParams: jest.fn(),
    hideDealerFirstCard: true,
    setHideDealerFirstCard: jest.fn(),
    gameActive: false,
    setGameActive: jest.fn(),
    canSurrenderGlobal: true,
    setCanSurrenderGlobal: jest.fn(),
    currentRoundDealerActionsLog: [],
    setCurrentRoundDealerActionsLog: jest.fn()
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementation for parseQueryParams
    (queryParamsUtils.parseQueryParams as jest.Mock).mockReturnValue({
      dealerCards: null,
      playerCards: null
    });
  });

  test('newGameHandler should initialize game state correctly', () => {
    const { result } = renderHook(() => useGameActions(mockGameState));

    act(() => {
      result.current.newGameHandler();
    });

    // Verify the game was initialized
    expect(mockGameState.setGameActive).toHaveBeenCalledWith(true);
    expect(mockGameState.setDealerHand).toHaveBeenCalled();
    expect(mockGameState.setPlayerHands).toHaveBeenCalled();
    expect(mockGameState.setHideDealerFirstCard).toHaveBeenCalledWith(true);
    expect(mockGameState.setCurrentHandIndex).toHaveBeenCalledWith(0);
    expect(queryParamsUtils.parseQueryParams).toHaveBeenCalled();
  });

  test('newGameHandler should use cards from URL parameters when available', () => {
    // Setup mock to return some predefined cards
    const mockDealerCards = [mockCard1];
    const mockPlayerCards = [mockCard2, mockCard3];
    
    (queryParamsUtils.parseQueryParams as jest.Mock).mockReturnValue({
      dealerCards: mockDealerCards,
      playerCards: mockPlayerCards
    });

    const { result } = renderHook(() => useGameActions(mockGameState));

    act(() => {
      result.current.newGameHandler();
    });

    // Check that the cards from URL were used
    expect(mockGameState.setDealerHand).toHaveBeenCalled();
    expect(mockGameState.setPlayerHands).toHaveBeenCalled();
    // Note: We no longer update the URL, only read from it for initialization
  });

  test('hitHandler should add a card to the current player hand', () => {
    // Setup a game state where we can hit
    const activeHand = {
      cards: [mockCard2, mockCard3],
      busted: false,
      stood: false,
      doubled: false,
      splitFromPair: false,
      surrendered: false,
      isBlackjack: false,
      outcome: null,
      initialCardsForThisHand: [mockCard2, mockCard3],
      actionsTakenLog: []
    };
    
    const gameStateWithActiveHand = {
      ...mockGameState,
      gameState: 'playerTurn',
      gameActive: true,
      playerHands: [activeHand],
      deck: [mockCard1, ...mockGameState.deck],
      canSurrenderGlobal: true,
      currentRoundDealerActionsLog: []
    };

    const { result } = renderHook(() => useGameActions(gameStateWithActiveHand));

    act(() => {
      result.current.hitHandler();
    });

    // Verify a card was dealt to the player's hand
    expect(gameStateWithActiveHand.setPlayerHands).toHaveBeenCalled();
    expect(gameStateWithActiveHand.setDeck).toHaveBeenCalled();
  });

  test('standHandler should mark the current hand as stood', () => {
    // Setup a game state where we can stand
    const activeHand = {
      cards: [mockCard2, mockCard3],
      busted: false,
      stood: false,
      doubled: false,
      splitFromPair: false,
      surrendered: false,
      isBlackjack: false,
      outcome: null,
      initialCardsForThisHand: [mockCard2, mockCard3],
      actionsTakenLog: []
    };
    
    const gameStateWithActiveHand = {
      ...mockGameState,
      gameState: 'playerTurn',
      gameActive: true,
      playerHands: [activeHand],
      currentHandIndex: 0,
      canSurrenderGlobal: true,
      currentRoundDealerActionsLog: []
    };

    const { result } = renderHook(() => useGameActions(gameStateWithActiveHand));

    act(() => {
      result.current.standHandler();
    });

    // Check that the hand was marked as stood
    expect(gameStateWithActiveHand.setPlayerHands).toHaveBeenCalled();
  });
});
