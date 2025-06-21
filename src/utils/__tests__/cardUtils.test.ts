import {
    createDeck,
    shuffleDeck,
    calculateHandValue,
    isBlackjack,
    isBusted,
    canSplit,
    isSoftHand,
    formatHandValue,
} from '../cardUtils';
import { Card, Rank, Suit } from '../../types/game';

describe('cardUtils', () => {
    describe('createDeck', () => {
        it('should create a standard 52-card deck', () => {
            const deck = createDeck();
            expect(deck).toHaveLength(52);
        });

        it('should have 4 cards of each rank', () => {
            const deck = createDeck();
            const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

            ranks.forEach(rank => {
                const cardsOfRank = deck.filter(card => card.rank === rank);
                expect(cardsOfRank).toHaveLength(4);
            });
        });

        it('should have 13 cards of each suit', () => {
            const deck = createDeck();
            const suits = ['♠', '♥', '♦', '♣']; // Using actual suit symbols

            suits.forEach(suit => {
                const cardsOfSuit = deck.filter(card => card.suit === suit);
                expect(cardsOfSuit).toHaveLength(13);
            });
        });

        it('should have correct values for all cards', () => {
            const deck = createDeck();

            // Test Aces
            const aces = deck.filter(card => card.rank === 'A');
            aces.forEach(ace => expect(ace.value).toBe(11));

            // Test face cards
            const faceCards = deck.filter(card => ['J', 'Q', 'K'].includes(card.rank));
            faceCards.forEach(face => expect(face.value).toBe(10));

            // Test number cards
            for (let i = 2; i <= 10; i++) {
                const numberCards = deck.filter(card => card.rank === i.toString());
                numberCards.forEach(card => expect(card.value).toBe(i));
            }
        });
    });

    describe('shuffleDeck', () => {
        it('should return a deck of the same length', () => {
            const originalDeck = createDeck();
            const shuffledDeck = shuffleDeck([...originalDeck]);

            expect(shuffledDeck).toHaveLength(originalDeck.length);
        });

        it('should contain the same cards', () => {
            const originalDeck = createDeck();
            const shuffledDeck = shuffleDeck([...originalDeck]);

            // Check that all original cards are still present
            originalDeck.forEach(originalCard => {
                const foundCard = shuffledDeck.find(
                    card => card.rank === originalCard.rank && card.suit === originalCard.suit
                );
                expect(foundCard).toBeDefined();
            });
        });

        it('should likely change the order (probabilistic test)', () => {
            const originalDeck = createDeck();
            const shuffledDeck = shuffleDeck([...originalDeck]);

            // It's extremely unlikely that shuffle returns the exact same order
            const sameOrder = originalDeck.every((card, index) =>
                card.rank === shuffledDeck[index].rank && card.suit === shuffledDeck[index].suit
            );

            expect(sameOrder).toBe(false);
        });

        it('should not mutate the original array', () => {
            const originalDeck = createDeck();
            const originalFirst = originalDeck[0];

            shuffleDeck(originalDeck);

            expect(originalDeck[0]).toEqual(originalFirst);
        });
    });

    describe('calculateHandValue', () => {
        const createCard = (rank: Rank, suit: Suit = '♥'): Card => ({
            rank,
            suit,
            value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank),
            id: `${suit}${rank}`,
        });

        it('should calculate simple number card values', () => {
            const hand = [createCard('5'), createCard('7')];
            expect(calculateHandValue(hand)).toEqual({ value: 12, isSoft: false });
        });

        it('should calculate face card values', () => {
            const hand = [createCard('K'), createCard('Q')];
            expect(calculateHandValue(hand)).toEqual({ value: 20, isSoft: false });
        });

        it('should handle Ace as 11 when beneficial', () => {
            const hand = [createCard('A'), createCard('9')];
            expect(calculateHandValue(hand)).toEqual({ value: 20, isSoft: true });
        });

        it('should handle Ace as 1 when 11 would bust', () => {
            const hand = [createCard('A'), createCard('6'), createCard('7')];
            expect(calculateHandValue(hand)).toEqual({ value: 14, isSoft: false }); // A(1) + 6 + 7
        });

        it('should handle multiple Aces correctly', () => {
            const hand = [createCard('A'), createCard('A'), createCard('9')];
            expect(calculateHandValue(hand)).toEqual({ value: 21, isSoft: true }); // A(11) + A(1) + 9
        });

        it('should handle multiple Aces all as 1s when necessary', () => {
            const hand = [createCard('A'), createCard('A'), createCard('A'), createCard('9')];
            expect(calculateHandValue(hand)).toEqual({ value: 12, isSoft: false }); // A(1) + A(1) + A(1) + 9
        });

        it('should handle blackjack correctly', () => {
            const hand = [createCard('A'), createCard('K')];
            expect(calculateHandValue(hand)).toEqual({ value: 21, isSoft: true });
        });

        it('should handle empty hand', () => {
            expect(calculateHandValue([])).toEqual({ value: 0, isSoft: false });
        });
    });

    describe('isBlackjack', () => {
        const createCard = (rank: Rank, suit: Suit = '♥'): Card => ({
            rank,
            suit,
            value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank),
            id: `${suit}${rank}`,
        });

        it('should detect Ace-King blackjack', () => {
            const hand = [createCard('A'), createCard('K')];
            expect(isBlackjack(hand)).toBe(true);
        });

        it('should detect Ace-Queen blackjack', () => {
            const hand = [createCard('A'), createCard('Q')];
            expect(isBlackjack(hand)).toBe(true);
        });

        it('should detect Ace-Jack blackjack', () => {
            const hand = [createCard('A'), createCard('J')];
            expect(isBlackjack(hand)).toBe(true);
        });

        it('should detect Ace-10 blackjack', () => {
            const hand = [createCard('A'), createCard('10')];
            expect(isBlackjack(hand)).toBe(true);
        });

        it('should detect King-Ace blackjack (order independent)', () => {
            const hand = [createCard('K'), createCard('A')];
            expect(isBlackjack(hand)).toBe(true);
        });

        it('should not detect 21 with more than 2 cards', () => {
            const hand = [createCard('7'), createCard('7'), createCard('7')];
            expect(isBlackjack(hand)).toBe(false);
        });

        it('should not detect 21 without Ace', () => {
            const hand = [createCard('K'), createCard('Q')];
            expect(isBlackjack(hand)).toBe(false);
        });

        it('should not detect hands totaling less than 21', () => {
            const hand = [createCard('A'), createCard('9')];
            expect(isBlackjack(hand)).toBe(false);
        });

        it('should handle empty hand', () => {
            expect(isBlackjack([])).toBe(false);
        });

        it('should handle single card', () => {
            const hand = [createCard('A')];
            expect(isBlackjack(hand)).toBe(false);
        });
    });

    describe('isBusted', () => {
        const createCard = (rank: Rank, suit: Suit = '♥'): Card => ({
            rank,
            suit,
            value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank),
            id: `${suit}${rank}`,
        });

        it('should detect busted hand over 21', () => {
            const hand = [createCard('K'), createCard('Q'), createCard('5')];
            expect(isBusted(hand)).toBe(true);
        });

        it('should not detect bust for exactly 21', () => {
            const hand = [createCard('K'), createCard('A')];
            expect(isBusted(hand)).toBe(false);
        });

        it('should not detect bust for under 21', () => {
            const hand = [createCard('10'), createCard('9')];
            expect(isBusted(hand)).toBe(false);
        });

        it('should handle Ace correctly (not bust when Ace can be 1)', () => {
            const hand = [createCard('A'), createCard('K'), createCard('5')];
            expect(isBusted(hand)).toBe(false); // A(1) + K(10) + 5 = 16
        });

        it('should handle empty hand', () => {
            expect(isBusted([])).toBe(false);
        });
    });

    describe('canSplit', () => {
        const createCard = (rank: Rank, suit: Suit = '♥'): Card => ({
            rank,
            suit,
            value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank),
            id: `${suit}${rank}`,
        });

        it('should detect number pairs', () => {
            const hand = [createCard('8', '♥'), createCard('8', '♠')];
            expect(canSplit(hand)).toBe(true);
        });

        it('should detect Ace pairs', () => {
            const hand = [createCard('A', '♥'), createCard('A', '♣')];
            expect(canSplit(hand)).toBe(true);
        });

        it('should detect face card pairs', () => {
            const hand = [createCard('K', '♥'), createCard('K', '♦')];
            expect(canSplit(hand)).toBe(true);
        });

        it('should not detect different ranks as pairs', () => {
            const hand = [createCard('K', '♥'), createCard('Q', '♥')];
            expect(canSplit(hand)).toBe(false);
        });

        it('should not detect pairs with more than 2 cards', () => {
            const hand = [createCard('8', '♥'), createCard('8', '♠'), createCard('5', '♣')];
            expect(canSplit(hand)).toBe(false);
        });

        it('should handle empty hand', () => {
            expect(canSplit([])).toBe(false);
        });

        it('should handle single card', () => {
            const hand = [createCard('K')];
            expect(canSplit(hand)).toBe(false);
        });
    });

    describe('isSoftHand', () => {
        const createCard = (rank: Rank, suit: Suit = '♥'): Card => ({
            rank,
            suit,
            value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank),
            id: `${suit}${rank}`,
        });

        it('should detect soft hand with Ace counted as 11', () => {
            const hand = [createCard('A'), createCard('6')];
            expect(isSoftHand(hand)).toBe(true);
        });

        it('should not detect hard hand with Ace counted as 1', () => {
            const hand = [createCard('A'), createCard('6'), createCard('7')];
            expect(isSoftHand(hand)).toBe(false); // A(1) + 6 + 7 = 14 hard
        });

        it('should not detect hand without Ace', () => {
            const hand = [createCard('10'), createCard('6')];
            expect(isSoftHand(hand)).toBe(false);
        });

        it('should handle multiple Aces correctly', () => {
            const hand = [createCard('A'), createCard('A'), createCard('5')];
            expect(isSoftHand(hand)).toBe(true); // A(11) + A(1) + 5 = 17 soft
        });

        it('should handle blackjack as soft', () => {
            const hand = [createCard('A'), createCard('K')];
            expect(isSoftHand(hand)).toBe(true);
        });

        it('should handle empty hand', () => {
            expect(isSoftHand([])).toBe(false);
        });
    });

    describe('formatHandValue', () => {
        const createCard = (rank: Rank, suit: Suit = '♥'): Card => ({
            rank,
            suit,
            value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank),
            id: `${suit}${rank}`,
        });

        it('should describe blackjack correctly', () => {
            const hand = [createCard('A'), createCard('K')];
            expect(formatHandValue(hand)).toBe('Blackjack!');
        });

        it('should describe busted hand correctly', () => {
            const hand = [createCard('K'), createCard('Q'), createCard('5')];
            expect(formatHandValue(hand)).toBe('Bust (25)');
        });

        it('should describe soft hand correctly', () => {
            const hand = [createCard('A'), createCard('6')];
            expect(formatHandValue(hand)).toBe('Soft 17');
        });

        it('should describe hard hand correctly', () => {
            const hand = [createCard('10'), createCard('6')];
            expect(formatHandValue(hand)).toBe('Hard 16');
        });

        it('should handle empty hand', () => {
            expect(formatHandValue([])).toBe('Hard 0');
        });

        it('should prioritize blackjack over soft description', () => {
            const hand = [createCard('A'), createCard('K')];
            expect(formatHandValue(hand)).toBe('Blackjack!');
        });

        it('should prioritize bust over other descriptions', () => {
            const bustHand = [createCard('A'), createCard('K'), createCard('5'), createCard('Q')]; // A(1) + K + 5 + Q = 26 (bust)
            const description = formatHandValue(bustHand);

            expect(description).toContain('Bust');
        });
    });
});
