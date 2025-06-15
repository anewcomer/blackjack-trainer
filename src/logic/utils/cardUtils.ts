/**
 * Card-related utility functions
 */

import { Card } from '../game/cardTypes';

/**
 * Card values mapping
 */
export const VALUES: { [key: string]: number } = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

/**
 * Card suits
 */
export const SUITS: string[] = ['♠', '♥', '♦', '♣'];

/**
 * Card ranks
 */
export const RANKS: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/**
 * Calculates the total value of a hand, accounting for Aces
 * 
 * @param handCards - Array of cards in the hand
 * @returns The total value of the hand (Aces are automatically adjusted to 1 if needed)
 */
export function calculateHandValue(handCards: Card[]): number {
  if (!handCards || handCards.length === 0) return 0;
  
  let value = 0;
  let numAces = 0;
  
  for (const card of handCards) {
    value += card.value;
    if (card.rank === 'A') numAces++;
  }
  
  // Adjust aces if needed to prevent busting
  while (value > 21 && numAces > 0) {
    value -= 10; // Change an Ace from 11 to 1
    numAces--;
  }
  
  return value;
}

/**
 * Gets a text representation of a hand's score, indicating if it's a soft hand
 * 
 * @param handCards - Array of cards in the hand
 * @returns A string representing the hand value, with (Soft) indicator if applicable
 */
export function getHandScoreText(handCards: Card[]): string {
  if (!handCards || handCards.length === 0) return '';
  
  const currentScore = calculateHandValue(handCards);
  let text = `${currentScore}`;
  
  // Check if this is a soft hand (contains an Ace counted as 11)
  let hasAce = false;
  let scoreWithAllAcesAsOne = 0;
  
  for (const card of handCards) {
    if (card.rank === 'A') {
      hasAce = true;
      scoreWithAllAcesAsOne += 1;
    } else {
      scoreWithAllAcesAsOne += card.value;
    }
  }
  
  if (hasAce && currentScore > scoreWithAllAcesAsOne && currentScore <= 21) {
    text += ' (Soft)';
  }
  
  return text;
}

/**
 * Creates a new deck of cards
 * 
 * @returns A new array of Card objects
 */
export function createNewDeck(): Card[] {
  const newDeck: Card[] = [];
  
  // Can adjust this to create multiple decks
  for (let i = 0; i < 1; i++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        newDeck.push({ 
          rank, 
          suit, 
          value: VALUES[rank], 
          id: `${rank}-${suit}-${i}-${Math.random().toString(36).substr(2, 9)}` 
        });
      }
    }
  }
  
  return newDeck;
}

/**
 * Shuffles a deck of cards using the Fisher-Yates algorithm
 * 
 * @param deckToShuffle - The deck of cards to shuffle
 * @returns A new shuffled array of cards
 */
export function shuffleDeck(deckToShuffle: Card[]): Card[] {
  let shuffledDeck: Card[] = [...deckToShuffle];
  
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  
  return shuffledDeck;
}

/**
 * Deals a single card from the deck
 * 
 * @param currentDeck - The current deck of cards
 * @returns Object containing the dealt card and the updated deck
 */
export function dealOneCard(currentDeck: Card[]): { card: Card; updatedDeck: Card[] } {
  let deckToDealFrom: Card[] = [...currentDeck];
  
  // If the deck is running low, create a new shuffled deck
  if (deckToDealFrom.length < 20) {
    deckToDealFrom = shuffleDeck(createNewDeck());
  }
  
  const card = deckToDealFrom.pop();
  
  // Emergency handling if the deck is somehow empty
  if (!card) {
    deckToDealFrom = shuffleDeck(createNewDeck());
    const emergencyCard = deckToDealFrom.pop()!;
    return { card: emergencyCard, updatedDeck: deckToDealFrom };
  }
  
  return { card, updatedDeck: deckToDealFrom };
}
