// Unit tests for strategy coordinate calculator
import { getStrategyCellCoordinates } from '../coordinateCalculator';
import { PlayerHand, Card, Suit, Rank } from '../../../types/game';

// Helper function to create a test card
const createCard = (rank: Rank, suit: Suit): Card => ({
    rank,
    suit,
    value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank),
    id: `${rank}-${suit}-test`
});

// Helper function to create a test player hand
const createPlayerHand = (cards: Card[], handValue: number, isSoft: boolean = false): PlayerHand => ({
    id: 'test-hand',
    cards,
    handValue,
    isSoft,
    busted: false,
    stood: false,
    doubled: false,
    surrendered: false,
    isBlackjack: false,
    splitFromPair: false,
    outcome: null,
    actionLog: []
});

describe('getStrategyCellCoordinates', () => {
    describe('Hard Totals', () => {
        it('should map hard 8 to row 0', () => {
            const playerHand = createPlayerHand([createCard('3', '♥'), createCard('5', '♠')], 8);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toEqual({ table: 'HARD', row: 0, col: 4 }); // 6 is column 4 (2,3,4,5,6,7,8,9,10,A)
        });

        it('should map hard 16 to row 8', () => {
            const playerHand = createPlayerHand([createCard('10', '♥'), createCard('6', '♠')], 16);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toEqual({ table: 'HARD', row: 8, col: 4 });
        });

        it('should map hard 17 to row 9 (17+ row)', () => {
            const playerHand = createPlayerHand([createCard('10', '♥'), createCard('7', '♠')], 17);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toEqual({ table: 'HARD', row: 9, col: 4 });
        });

        // THE SPECIFIC BUG TEST - This was the reported issue
        it('should map hard 19 vs dealer 6 to row 9 (17+ row) - REGRESSION TEST', () => {
            const playerHand = createPlayerHand([createCard('10', '♥'), createCard('9', '♠')], 19);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toEqual({ table: 'HARD', row: 9, col: 4 });
        });

        it('should map hard 18 to row 9 (17+ row)', () => {
            const playerHand = createPlayerHand([createCard('10', '♥'), createCard('8', '♠')], 18);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toEqual({ table: 'HARD', row: 9, col: 4 });
        });

        it('should map hard 20 with non-pair cards to row 9 (17+ row)', () => {
            const playerHand = createPlayerHand([createCard('K', '♥'), createCard('Q', '♠')], 20);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toEqual({ table: 'HARD', row: 9, col: 4 });
        });

        it('should map hard 21 to row 9 (17+ row)', () => {
            const playerHand = createPlayerHand([createCard('10', '♥'), createCard('A', '♠')], 21);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toEqual({ table: 'HARD', row: 9, col: 4 });
        });

        it('should handle different dealer cards correctly', () => {
            const playerHand = createPlayerHand([createCard('10', '♥'), createCard('9', '♠')], 19);

            // Test various dealer cards
            expect(getStrategyCellCoordinates(playerHand, createCard('2', '♣'))).toEqual({ table: 'HARD', row: 9, col: 0 });
            expect(getStrategyCellCoordinates(playerHand, createCard('5', '♣'))).toEqual({ table: 'HARD', row: 9, col: 3 });
            expect(getStrategyCellCoordinates(playerHand, createCard('10', '♣'))).toEqual({ table: 'HARD', row: 9, col: 8 });
            expect(getStrategyCellCoordinates(playerHand, createCard('A', '♣'))).toEqual({ table: 'HARD', row: 9, col: 9 });
        });
    });

    describe('Soft Totals', () => {
        it('should map soft 13 (A,2) to row 0', () => {
            const playerHand = createPlayerHand([createCard('A', '♥'), createCard('2', '♠')], 13, true);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toEqual({ table: 'SOFT', row: 0, col: 4 });
        });

        it('should map soft 20 (A,9) to row 8', () => {
            const playerHand = createPlayerHand([createCard('A', '♥'), createCard('9', '♠')], 20, true);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toEqual({ table: 'SOFT', row: 7, col: 4 }); // A,9 is row 7 (9-2=7)
        });
    });

    describe('Pairs', () => {
        it('should map pair of 8s to pairs table', () => {
            const playerHand = createPlayerHand([createCard('8', '♥'), createCard('8', '♠')], 16);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result?.table).toBe('PAIRS');
        });

        it('should map pair of Aces to pairs table', () => {
            const playerHand = createPlayerHand([createCard('A', '♥'), createCard('A', '♠')], 12);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result?.table).toBe('PAIRS');
        });
    });

    describe('Edge Cases', () => {
        it('should return null for hands with value less than 8', () => {
            const playerHand = createPlayerHand([createCard('2', '♥'), createCard('3', '♠')], 5);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toBeNull();
        });

        it('should return null for hands with value greater than 21', () => {
            const playerHand = createPlayerHand([createCard('10', '♥'), createCard('10', '♠'), createCard('5', '♣')], 25);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            expect(result).toBeNull();
        });

        it('should prioritize pairs over hard totals for 2-card hands', () => {
            const playerHand = createPlayerHand([createCard('10', '♥'), createCard('10', '♠')], 20);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            // Should be pairs table, not hard table
            expect(result?.table).toBe('PAIRS');
        });

        it('should return null for soft hands outside the range (soft 21)', () => {
            const playerHand = createPlayerHand([createCard('A', '♥'), createCard('10', '♠')], 21, true);
            const dealerCard = createCard('6', '♣');

            const result = getStrategyCellCoordinates(playerHand, dealerCard);

            // Soft 21 (A,10) is typically blackjack, not in soft totals chart
            expect(result).toBeNull();
        });
    });
});
