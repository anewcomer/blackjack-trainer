// Card utility functions for the Blackjack Trainer

import { Card, Suit, Rank } from '../types/game';
import { SUITS, RANKS, RANK_VALUES } from './constants';

/**
 * Creates a standard deck of 52 cards
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        value: RANK_VALUES[rank],
        id: `${suit}${rank}`, // Simple ID for React keys
      });
    }
  }
  
  return deck;
}

/**
 * Creates multiple decks shuffled together
 */
export function createMultiDeck(numDecks: number = 1): Card[] {
  const multiDeck: Card[] = [];
  
  for (let i = 0; i < numDecks; i++) {
    const deck = createDeck();
    // Add deck number to card IDs to ensure uniqueness
    deck.forEach(card => {
      card.id = `${card.id}-${i}`;
    });
    multiDeck.push(...deck);
  }
  
  return shuffleDeck(multiDeck);
}

/**
 * Shuffles a deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Deals a card from the deck (removes from deck, returns card)
 */
export function dealCard(deck: Card[]): { card: Card | null; remainingDeck: Card[] } {
  if (deck.length === 0) {
    return { card: null, remainingDeck: deck };
  }
  
  const [card, ...remainingDeck] = deck;
  return { card, remainingDeck };
}

/**
 * Deals multiple cards from the deck
 */
export function dealCards(deck: Card[], count: number): { cards: Card[]; remainingDeck: Card[] } {
  const cards: Card[] = [];
  let remainingDeck = [...deck];
  
  for (let i = 0; i < count && remainingDeck.length > 0; i++) {
    const result = dealCard(remainingDeck);
    if (result.card) {
      cards.push(result.card);
      remainingDeck = result.remainingDeck;
    }
  }
  
  return { cards, remainingDeck };
}

/**
 * Calculates the best possible value for a hand
 * Handles Ace conversion from 11 to 1 when needed
 */
export function calculateHandValue(cards: Card[]): { value: number; isSoft: boolean } {
  let value = 0;
  let aces = 0;
  
  // First pass: count non-Aces and count Aces
  for (const card of cards) {
    if (card.rank === 'A') {
      aces++;
      value += 11; // Start with Ace as 11
    } else {
      value += card.value;
    }
  }
  
  // Convert Aces from 11 to 1 if needed to avoid busting
  while (value > 21 && aces > 0) {
    value -= 10; // Convert one Ace from 11 to 1
    aces--;
  }
  
  // Hand is "soft" if it contains an Ace counted as 11
  const isSoft = aces > 0 && value <= 21;
  
  return { value, isSoft };
}

/**
 * Determines if a hand is a blackjack (21 with exactly 2 cards: Ace + 10-value)
 */
export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  
  const hasAce = cards.some(card => card.rank === 'A');
  const hasTen = cards.some(card => card.value === 10);
  
  return hasAce && hasTen;
}

/**
 * Determines if a hand is busted (value > 21)
 */
export function isBusted(cards: Card[]): boolean {
  return calculateHandValue(cards).value > 21;
}

/**
 * Determines if two cards can be split (same rank)
 */
export function canSplit(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return cards[0].rank === cards[1].rank;
}

/**
 * Gets the display name for a card rank
 */
export function getCardDisplayName(card: Card): string {
  return `${card.rank}${card.suit}`;
}

/**
 * Gets a card's numeric value for strategy calculations
 * (different from game value - Aces are always 1 for strategy)
 */
export function getCardStrategyValue(card: Card): number {
  if (card.rank === 'A') return 1;
  return Math.min(card.value, 10);
}

/**
 * Determines if a hand is a "soft" total (contains Ace counted as 11)
 */
export function isSoftHand(cards: Card[]): boolean {
  return calculateHandValue(cards).isSoft;
}

/**
 * Gets the "hard" value of a hand (all Aces counted as 1)
 */
export function getHardValue(cards: Card[]): number {
  return cards.reduce((sum, card) => {
    return sum + (card.rank === 'A' ? 1 : card.value);
  }, 0);
}

/**
 * Formats a hand value for display (e.g., "Soft 17", "Hard 20", "Blackjack!")
 */
export function formatHandValue(cards: Card[]): string {
  if (isBlackjack(cards)) return 'Blackjack!';
  
  const { value, isSoft } = calculateHandValue(cards);
  
  if (value > 21) return `Bust (${value})`;
  
  const prefix = isSoft ? 'Soft' : 'Hard';
  return `${prefix} ${value}`;
}

/**
 * Checks if deck needs reshuffling based on remaining cards
 */
export function needsReshuffle(deck: Card[], totalCards: number, threshold: number = 0.25): boolean {
  return deck.length / totalCards <= threshold;
}
