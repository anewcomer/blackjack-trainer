import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';
import { Card } from '../logic/blackjackTypes';

describe('useGameState Hook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useGameState());
    
    expect(result.current.deck.length).toBeGreaterThan(0);
    expect(result.current.playerHands).toEqual([]);
    expect(result.current.currentHandIndex).toBe(0);
    expect(result.current.dealerHand).toEqual([]);
    expect(result.current.gameActive).toBe(false);
    expect(result.current.message).toBe('Click "New Game" to start.');
    expect(result.current.hideDealerFirstCard).toBe(true);
    expect(result.current.canSurrenderGlobal).toBe(false);
    expect(result.current.highlightParams).toEqual({ type: null, playerKey: null, dealerKey: null });
    expect(result.current.currentRoundDealerActionsLog).toEqual([]);
  });
  
  it('should allow updating the deck', () => {
    const { result } = renderHook(() => useGameState());
    const newDeck: Card[] = [{ rank: 'A', suit: '♠', value: 11, id: 'A-♠-test' }];
    
    act(() => {
      result.current.setDeck(newDeck);
    });
    
    expect(result.current.deck).toEqual(newDeck);
  });
  
  it('should allow updating player hands', () => {
    const { result } = renderHook(() => useGameState());
    const mockHand = {
      cards: [{ rank: '10', suit: '♠', value: 10, id: '10-♠-test' }],
      busted: false,
      stood: false, 
      doubled: false,
      splitFromPair: false,
      surrendered: false,
      isBlackjack: false,
      outcome: null,
      initialCardsForThisHand: [],
      actionsTakenLog: []
    };
    
    act(() => {
      result.current.setPlayerHands([mockHand]);
    });
    
    expect(result.current.playerHands).toEqual([mockHand]);
  });
  
  it('should allow updating dealer hand', () => {
    const { result } = renderHook(() => useGameState());
    const mockDealerHand = [{ rank: 'K', suit: '♥', value: 10, id: 'K-♥-test' }];
    
    act(() => {
      result.current.setDealerHand(mockDealerHand);
    });
    
    expect(result.current.dealerHand).toEqual(mockDealerHand);
  });
  
  it('should allow updating game active state', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setGameActive(true);
    });
    
    expect(result.current.gameActive).toBe(true);
  });
  
  it('should allow updating message', () => {
    const { result } = renderHook(() => useGameState());
    const newMessage = 'Player wins!';
    
    act(() => {
      result.current.setMessage(newMessage);
    });
    
    expect(result.current.message).toBe(newMessage);
  });
  
  it('should allow updating hide dealer card state', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setHideDealerFirstCard(false);
    });
    
    expect(result.current.hideDealerFirstCard).toBe(false);
  });
  
  it('should allow updating surrender state', () => {
    const { result } = renderHook(() => useGameState());
    
    result.current.setCanSurrenderGlobal(true);
    
    expect(result.current.canSurrenderGlobal).toBe(true);
  });
  
  it('should allow updating highlight params', () => {
    const { result } = renderHook(() => useGameState());
    const newParams = { type: 'hard' as const, playerKey: '17', dealerKey: 'A' };
    
    act(() => {
      result.current.setHighlightParams(newParams);
    });
    
    expect(result.current.highlightParams).toEqual(newParams);
  });
  
  it('should allow updating dealer actions log', () => {
    const { result } = renderHook(() => useGameState());
    const mockAction = { action: 'hit', card: { rank: '4', suit: '♦', value: 4, id: '4-♦-test' } };
    
    act(() => {
      result.current.setCurrentRoundDealerActionsLog([mockAction]);
    });
    
    expect(result.current.currentRoundDealerActionsLog).toEqual([mockAction]);
  });
});
