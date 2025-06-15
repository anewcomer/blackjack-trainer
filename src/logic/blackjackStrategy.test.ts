import { getStrategyKeysForHighlight, getOptimalPlay } from './blackjackStrategy';
import { Card, PlayerHand } from './blackjackTypes';

describe('Blackjack Strategy', () => {
  // Setup common test cards
  const createCard = (rank: string, suit: string): Card => {
    const value = rank === 'A' ? 11 : 
                 ['K', 'Q', 'J', '10'].includes(rank) ? 10 : 
                 parseInt(rank, 10);
    return { rank, suit, value, id: `${rank}-${suit}-1` };
  };

  describe('getStrategyKeysForHighlight', () => {
    it('should return null values for invalid inputs', () => {
      // Case: null player hand
      expect(getStrategyKeysForHighlight(null, [], false)).toEqual({ 
        type: null, playerKey: null, dealerKey: null 
      });
      
      // Case: empty player cards
      const emptyHand: PlayerHand = { 
        cards: [], 
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
      expect(getStrategyKeysForHighlight(emptyHand, [], false)).toEqual({ 
        type: null, playerKey: null, dealerKey: null 
      });
      
      // Case: empty dealer cards
      const validHand: PlayerHand = { 
        cards: [createCard('7', '♠')], 
        busted: false, 
        stood: false, 
        doubled: false, 
        splitFromPair: false, 
        surrendered: false, 
        isBlackjack: false, 
        outcome: null, 
        initialCardsForThisHand: [createCard('7', '♠')], 
        actionsTakenLog: [] 
      };
      expect(getStrategyKeysForHighlight(validHand, [], false)).toEqual({ 
        type: null, playerKey: null, dealerKey: null 
      });
    });

    it('should identify pairs correctly', () => {
      // Pair of Aces
      const acePair: PlayerHand = {
        cards: [createCard('A', '♠'), createCard('A', '♥')],
        busted: false, 
        stood: false, 
        doubled: false, 
        splitFromPair: false, 
        surrendered: false, 
        isBlackjack: false, 
        outcome: null, 
        initialCardsForThisHand: [createCard('A', '♠'), createCard('A', '♥')], 
        actionsTakenLog: []
      };
      
      const dealerCards = [createCard('10', '♠')];
      
      const result = getStrategyKeysForHighlight(acePair, dealerCards, false);
      
      expect(result).toEqual({
        type: 'pairs',
        playerKey: 'A,A',
        dealerKey: 'T'
      });
    });

    it('should identify soft hands correctly', () => {
      // A,6 soft 17
      const soft17: PlayerHand = {
        cards: [createCard('A', '♠'), createCard('6', '♥')],
        busted: false, 
        stood: false, 
        doubled: false, 
        splitFromPair: false, 
        surrendered: false, 
        isBlackjack: false, 
        outcome: null, 
        initialCardsForThisHand: [createCard('A', '♠'), createCard('6', '♥')], 
        actionsTakenLog: []
      };
      
      const dealerCards = [createCard('4', '♠')];
      
      const result = getStrategyKeysForHighlight(soft17, dealerCards, false);
      
      expect(result).toEqual({
        type: 'soft',
        playerKey: 'A,6',
        dealerKey: '4'
      });
    });

    it('should identify hard hands correctly', () => {
      // Hard 16 (10+6)
      const hard16: PlayerHand = {
        cards: [createCard('10', '♠'), createCard('6', '♥')],
        busted: false, 
        stood: false, 
        doubled: false, 
        splitFromPair: false, 
        surrendered: false, 
        isBlackjack: false, 
        outcome: null, 
        initialCardsForThisHand: [createCard('10', '♠'), createCard('6', '♥')], 
        actionsTakenLog: []
      };
      
      const dealerCards = [createCard('7', '♠')];
      
      const result = getStrategyKeysForHighlight(hard16, dealerCards, false);
      
      expect(result).toEqual({
        type: 'hard',
        playerKey: '16',
        dealerKey: '7'
      });
    });

    it('should handle dealer hidden card scenario', () => {
      const playerHand: PlayerHand = {
        cards: [createCard('10', '♠'), createCard('5', '♥')],
        busted: false, 
        stood: false, 
        doubled: false, 
        splitFromPair: false, 
        surrendered: false, 
        isBlackjack: false, 
        outcome: null, 
        initialCardsForThisHand: [createCard('10', '♠'), createCard('5', '♥')], 
        actionsTakenLog: []
      };
      
      // First card hidden, second card visible
      const dealerCards = [createCard('A', '♠'), createCard('8', '♥')];
      
      const result = getStrategyKeysForHighlight(playerHand, dealerCards, true);
      
      expect(result).toEqual({
        type: 'hard',
        playerKey: '15',
        dealerKey: '8'
      });
    });
  });

  describe('getOptimalPlay', () => {
    it('should recommend Hit for hard 8 vs any dealer card', () => {
      const playerHand = [createCard('5', '♠'), createCard('3', '♥')];
      const dealerCard = createCard('10', '♠');
      
      const recommendation = getOptimalPlay(playerHand, dealerCard, false, false, false);
      
      expect(recommendation).toBe('H');
    });

    it('should recommend Split for pair of Aces', () => {
      const playerHand = [createCard('A', '♠'), createCard('A', '♥')];
      const dealerCard = createCard('9', '♠');
      
      const recommendation = getOptimalPlay(playerHand, dealerCard, true, false, false);
      
      expect(recommendation).toBe('P');
    });

    it('should recommend Double for hard 11 vs dealer 6 when doubling allowed', () => {
      const playerHand = [createCard('6', '♠'), createCard('5', '♥')];
      const dealerCard = createCard('6', '♠');
      
      const recommendation = getOptimalPlay(playerHand, dealerCard, false, true, false);
      
      expect(recommendation).toBe('D');
    });

    it('should recommend Hit for hard 11 vs dealer 6 when doubling NOT allowed', () => {
      const playerHand = [createCard('6', '♠'), createCard('5', '♥')];
      const dealerCard = createCard('6', '♠');
      
      const recommendation = getOptimalPlay(playerHand, dealerCard, false, false, false);
      
      expect(recommendation).toBe('H');
    });

    it('should recommend Surrender for hard 16 vs dealer Ace when surrender allowed', () => {
      const playerHand = [createCard('10', '♠'), createCard('6', '♥')];
      const dealerCard = createCard('A', '♠');
      
      const recommendation = getOptimalPlay(playerHand, dealerCard, false, false, true);
      
      expect(recommendation).toBe('R');
    });

    it('should recommend Hit for soft 18 vs dealer 9', () => {
      const playerHand = [createCard('A', '♠'), createCard('7', '♥')];
      const dealerCard = createCard('9', '♠');
      
      const recommendation = getOptimalPlay(playerHand, dealerCard, false, false, false);
      
      expect(recommendation).toBe('H');
    });

    it('should recommend Stand for soft 18 vs dealer 8', () => {
      const playerHand = [createCard('A', '♠'), createCard('7', '♥')];
      const dealerCard = createCard('8', '♠');
      
      const recommendation = getOptimalPlay(playerHand, dealerCard, false, false, false);
      
      expect(recommendation).toBe('S');
    });

    it('should recommend Stand for hard 17 or higher', () => {
      const playerHand = [createCard('10', '♠'), createCard('7', '♥')];
      const dealerCard = createCard('A', '♠');
      
      const recommendation = getOptimalPlay(playerHand, dealerCard, false, false, false);
      
      expect(recommendation).toBe('S');
    });

    it('should recommend Double for soft 17 vs dealer 6 when doubling allowed', () => {
      const playerHand = [createCard('A', '♠'), createCard('6', '♥')];
      const dealerCard = createCard('6', '♠');
      
      const recommendation = getOptimalPlay(playerHand, dealerCard, false, true, false);
      
      expect(recommendation).toBe('D');
    });
  });
});
