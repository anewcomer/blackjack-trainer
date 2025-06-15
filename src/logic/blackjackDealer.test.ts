import { dealerPlayLogic } from './blackjackDealer';
import { Card, DealerActionLogEntry } from './blackjackTypes';
import * as utils from './blackjackUtils';
import * as constants from './blackjackConstants';

// Mock setTimeout to make the tests run synchronously
jest.useFakeTimers();

// Spy on blackjackUtils functions
jest.spyOn(utils, 'calculateHandValue');
jest.spyOn(utils, 'dealOneCard');

describe('blackjackDealer', () => {
  // Common test variables
  let mockDealerHand: Card[] = [];
  let mockDeck: Card[] = [];
  let mockDealerActionsLog: DealerActionLogEntry[] = [];
  
  // Mock functions
  const mockSetHideDealerFirstCard = jest.fn();
  const mockSetMessage = jest.fn();
  const mockSetDealerHand = jest.fn();
  const mockSetDeck = jest.fn();
  const mockSetCurrentRoundDealerActionsLog = jest.fn();
  const mockDetermineGameOutcome = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Reset test variables
    mockDealerHand = [
      { rank: '10', suit: '♥', value: 10, id: '10-♥-1' },
      { rank: '6', suit: '♠', value: 6, id: '6-♠-1' }
    ];
    
    mockDeck = [
      { rank: 'A', suit: '♦', value: 11, id: 'A-♦-1' },
      { rank: '5', suit: '♣', value: 5, id: '5-♣-1' },
      { rank: '7', suit: '♠', value: 7, id: '7-♠-1' }
    ];
    
    mockDealerActionsLog = [];
    
    // Mock dealOneCard to return predictable results
    (utils.dealOneCard as jest.Mock).mockImplementation((deck) => {
      const [firstCard, ...restDeck] = deck;
      return {
        card: firstCard,
        updatedDeck: restDeck
      };
    });
    
    // Mock calculateHandValue to add up the values
    (utils.calculateHandValue as jest.Mock).mockImplementation((cards) => {
      return cards.reduce((sum: number, card: Card) => sum + card.value, 0);
    });
  });

  test('should reveal dealer card with a delay', () => {
    dealerPlayLogic(
      mockDealerHand,
      mockDeck,
      mockDealerActionsLog,
      mockSetHideDealerFirstCard,
      mockSetMessage,
      mockSetDealerHand,
      mockSetDeck,
      mockSetCurrentRoundDealerActionsLog,
      mockDetermineGameOutcome
    );
    
    // Initially, card is not revealed yet
    expect(mockSetHideDealerFirstCard).not.toHaveBeenCalled();
    
    // After delay, card should be revealed
    jest.advanceTimersByTime(800);
    expect(mockSetHideDealerFirstCard).toHaveBeenCalledWith(false);
    expect(mockSetMessage).toHaveBeenCalledWith("Dealer's turn...");
  });

  test('should hit when dealer hand is below 17', () => {
    dealerPlayLogic(
      mockDealerHand,
      mockDeck,
      mockDealerActionsLog,
      mockSetHideDealerFirstCard,
      mockSetMessage,
      mockSetDealerHand,
      mockSetDeck,
      mockSetCurrentRoundDealerActionsLog,
      mockDetermineGameOutcome
    );
    
    // Fast forward through all timeouts
    jest.advanceTimersByTime(1000); // Initial delay
    expect(mockSetMessage).toHaveBeenCalledWith("Dealer's turn...");
    
    // Advance to dealer first hit
    jest.advanceTimersByTime(1000);
    expect(mockSetMessage).toHaveBeenCalledWith('Dealer hits at 16...');
    expect(mockSetDealerHand).toHaveBeenCalled();
    expect(mockSetDeck).toHaveBeenCalled();
    
    // After hitting, dealer should have 3 cards (10, 6, A)
    expect(mockSetDealerHand).toHaveBeenCalledWith([
      { rank: '10', suit: '♥', value: 10, id: '10-♥-1' },
      { rank: '6', suit: '♠', value: 6, id: '6-♠-1' },
      { rank: 'A', suit: '♦', value: 11, id: 'A-♦-1' }
    ]);
    
    // Dealer should now have 27 (10 + 6 + 11) but our mock doesn't account for ace value adjustment
    // In a real game, the dealer would bust here
  });

  test('should recognize dealer blackjack immediately', () => {
    // Setup a blackjack hand
    const blackjackHand = [
      { rank: 'A', suit: '♥', value: 11, id: 'A-♥-1' },
      { rank: 'K', suit: '♠', value: 10, id: 'K-♠-1' }
    ];
    
    // Mock to return 21 for blackjack hand
    (utils.calculateHandValue as jest.Mock).mockImplementation((cards) => {
      if (cards.length === 2 && 
          ((cards[0].rank === 'A' && cards[1].value === 10) || 
           (cards[1].rank === 'A' && cards[0].value === 10))) {
        return 21;
      }
      return cards.reduce((sum: number, card: Card) => sum + card.value, 0);
    });
    
    dealerPlayLogic(
      blackjackHand,
      mockDeck,
      mockDealerActionsLog,
      mockSetHideDealerFirstCard,
      mockSetMessage,
      mockSetDealerHand,
      mockSetDeck,
      mockSetCurrentRoundDealerActionsLog,
      mockDetermineGameOutcome
    );
    
    // Reveal dealer card
    jest.advanceTimersByTime(800);
    expect(mockSetHideDealerFirstCard).toHaveBeenCalledWith(false);
    
    // Check for blackjack
    jest.advanceTimersByTime(1000);
    
    // Dealer should not hit with blackjack
    const hitMessage = mockSetMessage.mock.calls.find(call => call[0].includes('hits'));
    expect(hitMessage).toBeUndefined();
    
    // Action log should contain blackjack entry
    expect(mockSetCurrentRoundDealerActionsLog).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ action: 'Blackjack!' })
      ])
    );
    
    // After delays, should call determineGameOutcome
    jest.advanceTimersByTime(1600);
    expect(mockDetermineGameOutcome).toHaveBeenCalled();
  });

  test('should handle soft 17 correctly based on rules', () => {
    // Backup original rule
    const originalRule = constants.GAME_RULES.DEALER_STANDS_ON_SOFT_17;
    
    // Set rule to hit on soft 17
    Object.defineProperty(constants.GAME_RULES, 'DEALER_STANDS_ON_SOFT_17', {
      value: false,
      configurable: true
    });
    
    // Setup a soft 17 hand (A + 6)
    const soft17Hand = [
      { rank: 'A', suit: '♥', value: 11, id: 'A-♥-1' },
      { rank: '6', suit: '♠', value: 6, id: '6-♠-1' }
    ];
    
    // Mock to correctly identify soft 17
    (utils.calculateHandValue as jest.Mock).mockImplementation((cards) => {
      // Check if this is a soft 17
      const hasAce = cards.some((c: Card) => c.rank === 'A');
      const sum = cards.reduce((sum: number, card: Card) => sum + card.value, 0);
      
      if (hasAce && sum === 17) {
        return 17;
      }
      return sum;
    });
    
    dealerPlayLogic(
      soft17Hand,
      mockDeck,
      mockDealerActionsLog,
      mockSetHideDealerFirstCard,
      mockSetMessage,
      mockSetDealerHand,
      mockSetDeck,
      mockSetCurrentRoundDealerActionsLog,
      mockDetermineGameOutcome
    );
    
    // Fast forward through all timeouts
    jest.advanceTimersByTime(1800);
    
    // Dealer should hit on soft 17 when DEALER_STANDS_ON_SOFT_17 is false
    expect(mockSetMessage).toHaveBeenCalledWith('Dealer hits at 17 (soft)...');
    
    // Change rule to stand on soft 17
    Object.defineProperty(constants.GAME_RULES, 'DEALER_STANDS_ON_SOFT_17', {
      value: true,
      configurable: true
    });
    
    // Reset mocks for new test
    jest.clearAllMocks();
    
    dealerPlayLogic(
      soft17Hand,
      mockDeck,
      mockDealerActionsLog,
      mockSetHideDealerFirstCard,
      mockSetMessage,
      mockSetDealerHand,
      mockSetDeck,
      mockSetCurrentRoundDealerActionsLog,
      mockDetermineGameOutcome
    );
    
    // Fast forward through all timeouts
    jest.advanceTimersByTime(1800);
    
    // Dealer should stand on soft 17 when DEALER_STANDS_ON_SOFT_17 is true
    expect(mockSetMessage).toHaveBeenCalledWith('Dealer stands at 17 (soft).');
    
    // Restore original rule
    Object.defineProperty(constants.GAME_RULES, 'DEALER_STANDS_ON_SOFT_17', {
      value: originalRule,
      configurable: true
    });
  });
});
