import { 
  calculateHandValue, 
  getHandScoreText, 
  createNewDeck, 
  shuffleDeck, 
  dealOneCard 
} from './blackjackUtils';
import { Card } from './blackjackTypes';

describe('calculateHandValue', () => {
  test('should calculate correct value for a hand with no cards', () => {
    expect(calculateHandValue([])).toBe(0);
  });

  test('should calculate correct value for a hand with number cards', () => {
    const hand: Card[] = [
      { rank: '2', suit: '♠', value: 2, id: '2-♠-1' },
      { rank: '10', suit: '♥', value: 10, id: '10-♥-1' },
    ];
    expect(calculateHandValue(hand)).toBe(12);
  });

  test('should calculate correct value for a hand with face cards', () => {
    const hand: Card[] = [
      { rank: 'K', suit: '♦', value: 10, id: 'K-♦-1' },
      { rank: 'Q', suit: '♠', value: 10, id: 'Q-♠-1' },
    ];
    expect(calculateHandValue(hand)).toBe(20);
  });

  test('should calculate correct value for a hand with an ace counted as 11', () => {
    const hand: Card[] = [
      { rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' },
      { rank: '8', suit: '♥', value: 8, id: '8-♥-1' },
    ];
    expect(calculateHandValue(hand)).toBe(19);
  });

  test('should calculate correct value for a hand with an ace counted as 1', () => {
    const hand: Card[] = [
      { rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' },
      { rank: '8', suit: '♥', value: 8, id: '8-♥-1' },
      { rank: '5', suit: '♦', value: 5, id: '5-♦-1' },
    ];
    expect(calculateHandValue(hand)).toBe(14); // Ace is counted as 1
  });

  test('should calculate correct value for a hand with multiple aces', () => {
    const hand: Card[] = [
      { rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' },
      { rank: 'A', suit: '♥', value: 11, id: 'A-♥-1' },
      { rank: '7', suit: '♦', value: 7, id: '7-♦-1' },
    ];
    expect(calculateHandValue(hand)).toBe(19); // One ace is counted as 1, the other as 11
  });
});

describe('getHandScoreText', () => {
  test('should return empty string for empty hand', () => {
    expect(getHandScoreText([])).toBe('');
  });

  test('should return correct score for hard hand', () => {
    const hand: Card[] = [
      { rank: '10', suit: '♠', value: 10, id: '10-♠-1' },
      { rank: '7', suit: '♥', value: 7, id: '7-♥-1' },
    ];
    expect(getHandScoreText(hand)).toBe('17');
  });

  test('should mark score as soft when appropriate', () => {
    const hand: Card[] = [
      { rank: 'A', suit: '♠', value: 11, id: 'A-♠-1' },
      { rank: '6', suit: '♥', value: 6, id: '6-♥-1' },
    ];
    expect(getHandScoreText(hand)).toBe('17 (Soft)');
  });
});

describe('createNewDeck', () => {
  test('should create a standard deck of cards', () => {
    const deck = createNewDeck();
    
    // A standard deck has 52 cards
    expect(deck.length).toBe(52);
    
    // Check all ranks and suits are present
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = ['♠', '♥', '♦', '♣'];
    
    suits.forEach(suit => {
      ranks.forEach(rank => {
        const cardExists = deck.some(card => card.rank === rank && card.suit === suit);
        expect(cardExists).toBe(true);
      });
    });
  });
});

describe('shuffleDeck', () => {
  test('should shuffle the deck', () => {
    const originalDeck = createNewDeck();
    const shuffledDeck = shuffleDeck([...originalDeck]);
    
    // Check that the decks are not in the same order
    // Note: There's a very small chance this test could fail randomly
    // if the shuffle happened to result in the same order
    let sameOrder = true;
    for (let i = 0; i < originalDeck.length; i++) {
      if (originalDeck[i].id !== shuffledDeck[i].id) {
        sameOrder = false;
        break;
      }
    }
    
    expect(sameOrder).toBe(false);
    
    // Check that the shuffled deck contains all the same cards
    expect(shuffledDeck.length).toBe(originalDeck.length);
    
    // Check that all cards are still there (just in different order)
    originalDeck.forEach(originalCard => {
      const cardExists = shuffledDeck.some(shuffledCard => 
        shuffledCard.rank === originalCard.rank && 
        shuffledCard.suit === originalCard.suit
      );
      expect(cardExists).toBe(true);
    });
  });
});

describe('dealOneCard', () => {
  test('should deal the top card from the deck', () => {
    const deck = createNewDeck();
    const expectedCard = deck[deck.length - 1]; // The last card is the top of the deck
    
    const { card, updatedDeck } = dealOneCard([...deck]);
    
    expect(card).toEqual(expectedCard);
    expect(updatedDeck.length).toBe(deck.length - 1);
  });

  test('should create a new deck if the current one is depleted', () => {
    const emptyDeck: Card[] = [];
    
    const { card, updatedDeck } = dealOneCard(emptyDeck);
    
    expect(card).toBeDefined();
    expect(updatedDeck.length).toBeGreaterThan(0);
  });
});
