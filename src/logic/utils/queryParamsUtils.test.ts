import { 
  parseQueryParams, 
  updateUrlWithGameState,
  shouldAutoPlayDealer
} from './queryParamsUtils';
import { Card, PlayerHand } from '../blackjackTypes';

// Mock window.location methods that are read-only in JSDOM
const mockLocation = {
  search: '',
  href: 'http://localhost:3000/',
  hash: '',
  pathname: '/'
};

// Store original location
const originalLocation = window.location;

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Reset mocks between tests
beforeEach(() => {
  mockLocation.search = '';
  mockLocation.href = 'http://localhost:3000/';
  window.history.replaceState = jest.fn();
});

afterAll(() => {
  // Restore original location
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true
  });
});

// We don't need to test parseCardString directly as it's a private function

describe('parseQueryParams', () => {
  test('should extract dealer and player cards from URL search params', () => {
    // Set up URL search params
    mockLocation.search = '?dealer=AS,2H&player=10D,JC';
    
    const result = parseQueryParams();
    
    expect(result.dealerCards).toEqual([
      { rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' },
      { rank: '2', suit: '♥', value: 2, id: '2-♥-1' }
    ]);
    
    expect(result.playerCards).toEqual([
      { rank: '10', suit: '♦', value: 10, id: '10-♦-1' },
      { rank: 'J', suit: '♣', value: 10, id: 'J-♣-1' }
    ]);
  });
  
  test('should return null when params are not present', () => {
    mockLocation.search = '';
    
    const result = parseQueryParams();
    
    expect(result.dealerCards).toBeNull();
    expect(result.playerCards).toBeNull();
  });
  
  test('should handle invalid card notations', () => {
    mockLocation.search = '?dealer=XX&player=YY';
    
    const result = parseQueryParams();
    
    expect(result.dealerCards).toBeNull();
    expect(result.playerCards).toBeNull();
  });
});

describe('updateUrlWithGameState', () => {
  test('should update URL with current game state', () => {
    const dealerCards: Card[] = [
      { rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' },
      { rank: '10', suit: '♥', value: 10, id: '10-♥-1' }
    ];
    
    const playerHand: Card[] = [
      { rank: 'Q', suit: '♦', value: 10, id: 'Q-♦-1' },
      { rank: '7', suit: '♣', value: 7, id: '7-♣-1' }
    ];
    
    updateUrlWithGameState(dealerCards, playerHand);
    
    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      '',
      expect.stringContaining('?dealer=AS,10H&player=QD,7C')
    );
  });
  
  test('should handle empty hands', () => {
    updateUrlWithGameState([], []);
    
    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      '',
      expect.stringContaining('?dealer=&player=')
    );
  });
});

describe('shouldAutoPlayDealer', () => {
  test('should return true when all player hands are stood', () => {
    const playerHands: PlayerHand[] = [
      {
        cards: [
          { rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' },
          { rank: 'K', suit: '♥', value: 10, id: 'K-♥-1' }
        ],
        busted: false,
        stood: true,
        doubled: false,
        splitFromPair: false,
        surrendered: false,
        isBlackjack: true,
        outcome: null,
        initialCardsForThisHand: [
          { rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' },
          { rank: 'K', suit: '♥', value: 10, id: 'K-♥-1' }
        ],
        actionsTakenLog: []
      }
    ];
    
    expect(shouldAutoPlayDealer(playerHands)).toBe(true);
  });
  
  test('should return true when all player hands are busted', () => {
    const playerHands: PlayerHand[] = [
      {
        cards: [
          { rank: '10', suit: '♠', value: 10, id: '10-♠-1' },
          { rank: '6', suit: '♥', value: 6, id: '6-♥-1' },
          { rank: '8', suit: '♣', value: 8, id: '8-♣-1' }
        ],
        busted: true,
        stood: false,
        doubled: false,
        splitFromPair: false,
        surrendered: false,
        isBlackjack: false,
        outcome: 'Loss',
        initialCardsForThisHand: [
          { rank: '10', suit: '♠', value: 10, id: '10-♠-1' },
          { rank: '6', suit: '♥', value: 6, id: '6-♥-1' }
        ],
        actionsTakenLog: []
      }
    ];
    
    expect(shouldAutoPlayDealer(playerHands)).toBe(true);
  });
  
  test('should return true when all player hands have 21 or more', () => {
    const playerHands: PlayerHand[] = [
      {
        cards: [
          { rank: '10', suit: '♠', value: 10, id: '10-♠-1' },
          { rank: 'A', suit: '♥', value: 11, id: 'A-♥-1' }
        ],
        busted: false,
        stood: false,
        doubled: false,
        splitFromPair: false,
        surrendered: false,
        isBlackjack: true,
        outcome: null,
        initialCardsForThisHand: [
          { rank: '10', suit: '♠', value: 10, id: '10-♠-1' },
          { rank: 'A', suit: '♥', value: 11, id: 'A-♥-1' }
        ],
        actionsTakenLog: []
      }
    ];
    
    expect(shouldAutoPlayDealer(playerHands)).toBe(true);
  });
  
  test('should return false when any player hand is active and under 21', () => {
    const playerHands: PlayerHand[] = [
      {
        cards: [
          { rank: '10', suit: '♠', value: 10, id: '10-♠-1' },
          { rank: '8', suit: '♥', value: 8, id: '8-♥-1' }
        ],
        busted: false,
        stood: false,
        doubled: false,
        splitFromPair: false,
        surrendered: false,
        isBlackjack: false,
        outcome: null,
        initialCardsForThisHand: [
          { rank: '10', suit: '♠', value: 10, id: '10-♠-1' },
          { rank: '8', suit: '♥', value: 8, id: '8-♥-1' }
        ],
        actionsTakenLog: []
      }
    ];
    
    expect(shouldAutoPlayDealer(playerHands)).toBe(false);
  });
});
