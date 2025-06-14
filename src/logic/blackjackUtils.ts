// Utility functions and constants for Blackjack Trainer
import { Card } from './types';

export const SUITS: string[] = ['\u2660', '\u2665', '\u2666', '\u2663'];
export const RANKS: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const VALUES: { [key: string]: number } = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

export const GAME_RULES = {
  DEALER_STANDS_ON_SOFT_17: true,
  DOUBLE_AFTER_SPLIT_ALLOWED: true,
  MAX_SPLIT_HANDS: 4,
};

export function createNewDeck(numDecks = 1): Card[] {
  const newDeck: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
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

export function shuffleDeck(deckToShuffle: Card[]): Card[] {
  let shuffledDeck: Card[] = [...deckToShuffle];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
}

export function calculateHandValue(handCards: Card[]): number {
  if (!handCards || handCards.length === 0) return 0;
  let value = 0;
  let numAces = 0;
  for (const card of handCards) {
    value += card.value;
    if (card.rank === 'A') numAces++;
  }
  while (value > 21 && numAces > 0) {
    value -= 10;
    numAces--;
  }
  return value;
}

export function getHandScoreText(handCards: Card[]): string {
  if (!handCards || handCards.length === 0) return '';
  const currentScore = calculateHandValue(handCards);
  let text = `${currentScore}`;
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

export function dealOneCard(currentDeck: Card[], reshuffleIfLow = true, setMessage?: (msg: string) => void): { card: Card; updatedDeck: Card[] } {
  let deckToDealFrom: Card[] = [...currentDeck];
  if (reshuffleIfLow && deckToDealFrom.length < 20) {
    if (setMessage) setMessage('Shuffling new deck...');
    deckToDealFrom = shuffleDeck(createNewDeck());
  }
  const card = deckToDealFrom.pop();
  if (!card) {
    if (setMessage) setMessage('Deck ran out of cards unexpectedly after reshuffle attempt.');
    deckToDealFrom = shuffleDeck(createNewDeck());
    const emergencyCard = deckToDealFrom.pop()!;
    return { card: emergencyCard, updatedDeck: deckToDealFrom };
  }
  return { card, updatedDeck: deckToDealFrom };
}
