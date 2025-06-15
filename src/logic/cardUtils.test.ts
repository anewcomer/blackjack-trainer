import { 
  calculateHandValue, 
  getHandScoreText, 
  createNewDeck, 
  shuffleDeck, 
  dealOneCard,
  VALUES,
  SUITS,
  RANKS
} from './utils/cardUtils';
import { Card } from './game/cardTypes';

describe('Card Utilities', () => {
  // Helper function to create a card for testing
  const createCard = (rank: string, suit: string): Card => {
    const value = VALUES[rank];
    return { rank, suit, value, id: `${rank}-${suit}-test` };
  };

  describe('calculateHandValue', () => {
    it('should return 0 for an empty hand', () => {
      expect(calculateHandValue([])).toBe(0);
    });

    it('should correctly calculate a simple hand value', () => {
      const hand = [createCard('10', '♠'), createCard('5', '♣')];
      expect(calculateHandValue(hand)).toBe(15);
    });
    
    it('should count Aces as 11 when it doesn\'t cause a bust', () => {
      const hand = [createCard('A', '♠'), createCard('7', '♣')];
      expect(calculateHandValue(hand)).toBe(18);
    });
    
    it('should count Aces as 1 when needed to prevent bust', () => {
      const hand = [createCard('A', '♠'), createCard('K', '♣'), createCard('J', '♦')];
      expect(calculateHandValue(hand)).toBe(21);
    });
    
    it('should handle multiple Aces correctly', () => {
      const hand = [createCard('A', '♠'), createCard('A', '♣'), createCard('A', '♦')];
      expect(calculateHandValue(hand)).toBe(13); // One Ace as 11, two as 1
    });

    it('should recognize blackjack (A + 10-value card)', () => {
      const blackjack1 = [createCard('A', '♠'), createCard('K', '♣')];
      const blackjack2 = [createCard('Q', '♦'), createCard('A', '♥')];
      
      expect(calculateHandValue(blackjack1)).toBe(21);
      expect(calculateHandValue(blackjack2)).toBe(21);
    });
  });

  describe('getHandScoreText', () => {
    it('should return empty string for an empty hand', () => {
      expect(getHandScoreText([])).toBe('');
    });

    it('should return the correct score as string for a hard hand', () => {
      const hand = [createCard('10', '♠'), createCard('7', '♣')];
      expect(getHandScoreText(hand)).toBe('17');
    });

    it('should indicate a soft hand with (Soft) suffix', () => {
      const hand = [createCard('A', '♠'), createCard('6', '♣')];
      expect(getHandScoreText(hand)).toBe('17 (Soft)');
    });

    it('should not show (Soft) for a bust hand even with an Ace', () => {
      const hand = [createCard('A', '♠'), createCard('K', '♣'), createCard('5', '♦')];
      // Ace becomes 1, so total is 16 (not soft)
      expect(getHandScoreText(hand)).toBe('16');
    });
  });

  describe('Deck operations', () => {
    it('should create a new deck with the right number of cards', () => {
      const deck = createNewDeck();
      // 4 suits * 13 ranks = 52 cards
      expect(deck.length).toBe(52);
    });

    it('should create a deck with all combinations of ranks and suits', () => {
      const deck = createNewDeck();
      
      // Check that each rank and suit combination exists exactly once
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          const cardsWithRankAndSuit = deck.filter(card => card.rank === rank && card.suit === suit);
          expect(cardsWithRankAndSuit.length).toBe(1);
        }
      }
    });

    it('should shuffle the deck so the order changes', () => {
      const originalDeck = createNewDeck();
      const shuffledDeck = shuffleDeck([...originalDeck]);
      
      // The shuffled deck should have the same cards but in a different order
      expect(shuffledDeck.length).toBe(originalDeck.length);
      
      // There's a tiny chance this could fail randomly if the shuffle happens to return the same order
      let hasAnyDifference = false;
      for (let i = 0; i < originalDeck.length; i++) {
        if (shuffledDeck[i].id !== originalDeck[i].id) {
          hasAnyDifference = true;
          break;
        }
      }
      expect(hasAnyDifference).toBe(true);
    });

    it('should deal one card from the deck', () => {
      const startingDeck = createNewDeck();
      const startingLength = startingDeck.length;
      
      const { card, updatedDeck } = dealOneCard(startingDeck);
      
      expect(card).toBeDefined();
      expect(updatedDeck.length).toBe(startingLength - 1);
      // The dealt card should not be in the updated deck
      expect(updatedDeck.find(c => c.id === card.id)).toBeUndefined();
    });
    
    it('should create a new deck if the current one is running low', () => {
      // Create a small deck with just a few cards
      const smallDeck: Card[] = [
        createCard('2', '♠'),
        createCard('3', '♠'),
        createCard('4', '♠'),
      ];
      
      // When dealing from small deck, it should be replenished
      const result = dealOneCard(smallDeck);
      
      // The updated deck should be much larger (a new deck)
      expect(result.updatedDeck.length).toBeGreaterThan(smallDeck.length);
    });
  });
});
