import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  ActionLogEntry,
  PlayerHand,
  DealerActionLogEntry,
  SessionStats,
  PlayerHandHistoryForModal,
  GameHistoryEntry,
  HighlightParams,
  BlackjackGameHook
} from '../logic/blackjackTypes';
import { SUITS, RANKS, VALUES, GAME_RULES } from '../logic/blackjackConstants';
import {
  calculateHandValue,
  getHandScoreText,
  createNewDeck,
  shuffleDeck,
  dealOneCard
} from '../logic/blackjackUtils';
import { getStrategyKeysForHighlight } from '../logic/blackjackStrategy';
import { getOptimalPlay } from '../logic/blackjackOptimalPlay';
import { logRoundToHistory } from '../logic/blackjackHistory';
import { dealerPlayLogic } from '../logic/blackjackDealer';

// --- Type Definitions ---

// --- Card Data ---


export const useBlackjackGame = (): BlackjackGameHook => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>([]);
  const [currentHandIndex, setCurrentHandIndex] = useState<number>(0);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Click "New Game" to start.');
  const [hideDealerFirstCard, setHideDealerFirstCard] = useState<boolean>(true);
  const [canSurrenderGlobal, setCanSurrenderGlobal] = useState<boolean>(false);
  const [highlightParams, setHighlightParams] = useState<HighlightParams>({ type: null, playerKey: null, dealerKey: null });
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [currentRoundDealerActionsLog, setCurrentRoundDealerActionsLog] = useState<DealerActionLogEntry[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    correctMoves: 0, incorrectMoves: 0, totalDecisions: 0,
    wins: 0, losses: 0, pushes: 0, handsPlayed: 0
  });

  const resetSessionStats = useCallback(() => {
    setSessionStats({
        correctMoves: 0, incorrectMoves: 0, totalDecisions: 0,
        wins: 0, losses: 0, pushes: 0, handsPlayed: 0
    });
    setMessage("Session stats reset. Click 'New Game'.");
  }, [setSessionStats, setMessage]);

  // Forward declaration for use in getOptimalPlay
  const getOptimalPlayRef = useRef<((playerHandCards: Card[], dealerUpCard: Card, canSplitCurrent: boolean, canDoubleCurrent: boolean, canSurrenderCurrent: boolean) => string) | null>(null);

  const calculateHandValue = useCallback((handCards: Card[]): number => {
    if (!handCards || handCards.length === 0) return 0;
    let value = 0;
    let numAces = 0;
    for (const card of handCards) {
        value += card.value;
        if (card.rank === 'A') {
            numAces++;
        }
    }
    while (value > 21 && numAces > 0) {
        value -= 10; // Convert an Ace from 11 to 1
        numAces--;
    }
    return value;
  }, []);

  const getHandScoreText = useCallback((handCards: Card[]): string => {
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
        text += " (Soft)";
    }
    return text;
  }, [calculateHandValue]);

  const createNewDeck = useCallback((): Card[] => {
    const newDeck: Card[] = [];
    for (let i = 0; i < 1; i++) { // Using 1 deck for easier testing
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                newDeck.push({ rank, suit, value: VALUES[rank], id: `${rank}-${suit}-${i}-${Math.random().toString(36).substr(2, 9)}` });
            }
        }
    }
    return newDeck;
  }, []);

  const shuffleDeck = useCallback((deckToShuffle: Card[]): Card[] => {
    let shuffledDeck: Card[] = [...deckToShuffle];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
  }, []);

  const dealOneCard = useCallback((currentDeck: Card[]): { card: Card; updatedDeck: Card[] } => {
    let deckToDealFrom: Card[] = [...currentDeck];
    if (deckToDealFrom.length < 20) { // Reshuffle if deck is low
        setMessage("Shuffling new deck...");
        deckToDealFrom = shuffleDeck(createNewDeck());
    }
    const card = deckToDealFrom.pop(); // Should always return a card due to reshuffle logic
    if (!card) {
        // This should ideally not happen if createNewDeck always returns a populated deck
        console.error("Deck ran out of cards unexpectedly after reshuffle attempt.");
        // Fallback: create a new deck and deal from it, though this indicates a deeper issue.
        deckToDealFrom = shuffleDeck(createNewDeck());
        const emergencyCard = deckToDealFrom.pop()!; // Use non-null assertion if confident
        return { card: emergencyCard, updatedDeck: deckToDealFrom };
    }
    return { card, updatedDeck: deckToDealFrom };
  }, [createNewDeck, shuffleDeck, setMessage]);
  const logRoundToHistory = useCallback((resolvedPlayerHands: PlayerHand[], finalDealerHand: Card[], finalDealerActionsLog: DealerActionLogEntry[], dealerBlackjack: boolean, playerBlackjackOnInit: boolean) => {
    const roundEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      playerHands: resolvedPlayerHands.map(hand => ({
        initialCards: hand.initialCardsForThisHand.map(c => `${c.rank}${c.suit}`).join(', '),
        actions: hand.actionsTakenLog.map(log => ({
          action: log.playerAction,
          optimal: log.optimalAction,
          correct: log.wasCorrect,
          valueBefore: log.handValueBefore,
          valueAfter: log.handValueAfter,
          cardDealt: log.cardDealt ? `${log.cardDealt.rank}${log.cardDealt.suit}` : null,
        })),
        finalCards: hand.cards.map(c => `${c.rank}${c.suit}`).join(', '),
        finalScore: calculateHandValue(hand.cards),
        outcome: hand.outcome,
        busted: hand.busted,
        surrendered: hand.surrendered,
        isBlackjack: hand.isBlackjack,
      })),
      dealerUpCard: finalDealerHand.length > 0 ? `${finalDealerHand[0].rank}${finalDealerHand[0].suit}` : 'N/A', // This should be the actual upcard shown
      dealerHoleCard: finalDealerHand.length > 1 ? `${finalDealerHand[1].rank}${finalDealerHand[1].suit}` : 'N/A',
      dealerActions: finalDealerActionsLog.map(log => ({
        action: log.action,
        valueBefore: log.handValueBefore,
        valueAfter: log.handValueAfter,
        cardDealt: log.cardDealt ? `${log.cardDealt.rank}${log.cardDealt.suit}` : null,
      })),
      dealerFinalCards: finalDealerHand.map(c => `${c.rank}${c.suit}`).join(', '),
      dealerFinalScore: calculateHandValue(finalDealerHand),
      dealerBusted: calculateHandValue(finalDealerHand) > 21,
      dealerBlackjackOnInit: dealerBlackjack, // Was dealer Blackjack at the start?
      playerBlackjackOnInit: playerBlackjackOnInit, // Was player Blackjack at the start?
    };
    setGameHistory(prev => [...prev, roundEntry]);
  }, [calculateHandValue]);

  // Moved up: determineGameOutcome (used by newGameHandler, dealerPlayLogic)
  const determineGameOutcome = useCallback((isInitialBlackjackRound: boolean = false, playerHadInitialBlackjack: boolean = false) => {
    const finalDealerValue = calculateHandValue(dealerHand);
    const dealerBusted = finalDealerValue > 21;
    let finalMessages: string[] = [];

    const updatedPlayerHands: PlayerHand[] = playerHands.map(hand => {
        let handOutcome: PlayerHand['outcome'] = hand.outcome; // Preserve if already set (e.g. surrender, initial BJ)
        if (!handOutcome) { // Only determine if not already set
            const playerValue = calculateHandValue(hand.cards);
            if (hand.busted) handOutcome = "Loss";
            else if (dealerBusted) handOutcome = "Win";
            else if (playerValue > finalDealerValue) handOutcome = "Win";
            else if (playerValue < finalDealerValue) handOutcome = "Loss";
            else handOutcome = "Push";
        }
        finalMessages.push(`Hand ${playerHands.indexOf(hand) + 1}: ${handOutcome}`);
        return { ...hand, outcome: handOutcome };
    });

    setPlayerHands(updatedPlayerHands);
    setMessage(finalMessages.join(' | '));
    setGameActive(false);
    logRoundToHistory(updatedPlayerHands, dealerHand, currentRoundDealerActionsLog, isInitialBlackjackRound && calculateHandValue(dealerHand) === 21, playerHadInitialBlackjack);

    // Update session stats
    setSessionStats(prevStats => {
        let newWins = prevStats.wins;
        let newLosses = prevStats.losses;
        let newPushes = prevStats.pushes;
        updatedPlayerHands.forEach(hand => {
            if (hand.outcome === "Win") newWins++;
            else if (hand.outcome === "Loss") newLosses++;
            else if (hand.outcome === "Push") newPushes++;
        });
        return { ...prevStats, wins: newWins, losses: newLosses, pushes: newPushes, handsPlayed: prevStats.handsPlayed + updatedPlayerHands.length };
    });
  }, [dealerHand, playerHands, calculateHandValue, currentRoundDealerActionsLog, logRoundToHistory, setMessage, setPlayerHands, setGameActive, setSessionStats]);

  const newGameHandler = useCallback(() => {
    setMessage("Setting up new game...");
    let currentDeck = shuffleDeck(createNewDeck());

    const dealOne = (deck: Card[]): { card: Card; updatedDeck: Card[] } => {
        if (!deck || deck.length === 0) {
            // This case should ideally not be hit if dealOneCard handles reshuffling
            console.warn("newGameHandler: Dealing from an empty or null deck, attempting recovery.");
            return dealOneCard(shuffleDeck(createNewDeck()));
        }
        return dealOneCard(deck);
    }

    let card1: Card, card2: Card, card3: Card, card4: Card;
    let deckAfterDeal = currentDeck;

    ({ card: card1, updatedDeck: deckAfterDeal } = dealOne(deckAfterDeal));
    ({ card: card2, updatedDeck: deckAfterDeal } = dealOne(deckAfterDeal));
    ({ card: card3, updatedDeck: deckAfterDeal } = dealOne(deckAfterDeal));
    ({ card: card4, updatedDeck: deckAfterDeal } = dealOne(deckAfterDeal));

    const playerCards: Card[] = [card1, card3]; // Assuming dealOne always returns a card
    const dealerCards: Card[] = [card2, card4]; // Assuming dealOne always returns a card

    const initialPlayerHand: PlayerHand = {
        cards: playerCards, busted: false, stood: false, doubled: false,
        splitFromPair: false, surrendered: false,
        isBlackjack: false, outcome: null,
        initialCardsForThisHand: [...playerCards], actionsTakenLog: [],
    };

    setDeck(deckAfterDeal);
    setPlayerHands([initialPlayerHand]);
    setDealerHand(dealerCards);
    setCurrentHandIndex(0);
    setHideDealerFirstCard(true);
    setCanSurrenderGlobal(true);
    setCurrentRoundDealerActionsLog([]);

    const playerValue = calculateHandValue(playerCards);
    const dealerValue = calculateHandValue(dealerCards);
    const playerHasBlackjack = playerValue === 21 && playerCards.length === 2;
    const dealerHasBlackjack = dealerValue === 21 && dealerCards.length === 2;

    if (playerHasBlackjack || dealerHasBlackjack) {
        setGameActive(false); // Game ends immediately
        setPlayerHands(prev => [{ ...prev[0], isBlackjack: playerHasBlackjack, stood: true } as PlayerHand]);
        setHideDealerFirstCard(false);
        let outcomeMessage = "";
        if (playerHasBlackjack && dealerHasBlackjack) {
            outcomeMessage = "Push! Both have Blackjack.";
            setPlayerHands(prev => [{ ...prev[0], outcome: "Push" } as PlayerHand]);
        } else if (playerHasBlackjack) {
            outcomeMessage = "Blackjack! You win!";
            setPlayerHands(prev => [{ ...prev[0], outcome: "Win" } as PlayerHand]);
        } else { // Dealer Blackjack
            outcomeMessage = "Dealer Blackjack! You lose.";
            setPlayerHands(prev => [{ ...prev[0], outcome: "Loss" } as PlayerHand]);
        }
        setMessage(outcomeMessage); // Set message before determineGameOutcome
        // determineGameOutcome will use the playerHands state set just above
        // Need to ensure determineGameOutcome uses the latest playerHands state.
        // Calling determineGameOutcome inside a setPlayerHands updater or useEffect might be more robust.
        // For now, assuming the state updates apply before determineGameOutcome reads them.
        // This is a common React pitfall. Let's pass the updated hands directly.
        // logRoundToHistory needs the final state.
        // Since determineGameOutcome calls logRoundToHistory, and also sets playerHands,
        // it's better to let determineGameOutcome handle the final playerHands state.
        // The setPlayerHands calls above are for immediate UI feedback and setting flags.
        // determineGameOutcome will then consolidate and log.
        determineGameOutcome(true, playerHasBlackjack);
    } else {
        setGameActive(true); // Game is active for player's turn
        setMessage("Your turn. What's your move?");
    }
  }, [createNewDeck, shuffleDeck, dealOneCard, calculateHandValue, determineGameOutcome, setMessage, setDeck, setPlayerHands, setDealerHand, setCurrentHandIndex, setHideDealerFirstCard, setCanSurrenderGlobal, setCurrentRoundDealerActionsLog, setGameActive]);

  // --- Strategy and Mistake Checking ---
  const getStrategyKeysForHighlight = useCallback((playerHandObj: PlayerHand | null, dealerCards: Card[], isDealerCardHidden: boolean): HighlightParams => {
    if (!playerHandObj || playerHandObj.cards.length === 0 || !dealerCards || dealerCards.length === 0) {
      return { type: null, playerKey: null, dealerKey: null };
    }
    const dealerUpCard = isDealerCardHidden ? dealerCards[1] : dealerCards[0]; // dealerCards[1] could be undefined
    if (!dealerUpCard) return { type: null, playerKey: null, dealerKey: null };

    const dealerRank = dealerUpCard.rank;
    let tempDealerKey = (['K', 'Q', 'J'].includes(dealerRank)) ? 'T' : dealerRank;
    if (!['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'A'].includes(tempDealerKey)) tempDealerKey = null as any;
    const dealerKey = tempDealerKey as HighlightParams['dealerKey'];

    const playerCards = playerHandObj.cards;
    const numPlayerCards = playerCards.length;
    const playerValue = calculateHandValue(playerCards);
    let type = null, playerKey = null;

    if (numPlayerCards === 2 && playerCards[0].rank === playerCards[1].rank) {
      type = 'pairs';
      const rank = playerCards[0].rank;
      const rankStr = (['K', 'Q', 'J'].includes(rank)) ? 'T' : rank;
      playerKey = `${rankStr},${rankStr}`;
      if (!['A,A', 'T,T', '9,9', '8,8', '7,7', '6,6', '5,5', '4,4', '3,3', '2,2'].includes(playerKey)) {
        type = null; playerKey = null; // Reset if not a valid pair key
      }
    } else {
      let hasAce = false, nonAceTotal = 0, aceCount = 0;
      playerCards.forEach(card => {
        if (card.rank === 'A') { hasAce = true; aceCount++; }
        else { nonAceTotal += VALUES[card.rank]; }
      });
      if (hasAce && playerValue > nonAceTotal + aceCount) {
        type = 'soft';
        const otherValue = playerValue - 11;
        if (otherValue >= 2 && otherValue <= 9) playerKey = `A,${otherValue}`;
        else { type = null; playerKey = null; } // Reset if not a valid soft key
      } else {
        type = 'hard';
        if (playerValue >= 17) playerKey = '17+';
        else if (playerValue <= 7 && playerValue >= 5) playerKey = '5-7';
        else if (playerValue < 5) playerKey = '5-7'; // Or handle as specific numbers if strategy chart does
        else playerKey = playerValue.toString();
        if (!['17+', '16', '15', '14', '13', '12', '11', '10', '9', '8', '5-7'].includes(playerKey)) {
           playerKey = null; // Reset if not a valid hard key
        }
      }
    }
    return { type: type as HighlightParams['type'], playerKey, dealerKey };
  }, [calculateHandValue]);

  const getOptimalPlay = useCallback((playerHandCards: Card[], dealerUpCard: Card, canSplitCurrent: boolean, canDoubleCurrent: boolean, canSurrenderCurrent: boolean): string => {
    const playerValue = calculateHandValue(playerHandCards);
    const dealerCardRank = dealerUpCard.rank;
    // const dealerIsAce = dealerCardRank === 'A'; // Unused
    // const dealerIsTen = ['10', 'J', 'Q', 'K'].includes(dealerCardRank); // Unused

    const isPlayerPair = playerHandCards.length === 2 && playerHandCards[0].rank === playerHandCards[1].rank;
    let isPlayerSoft = false;
    if (playerHandCards.some(c => c.rank === 'A')) {
        let nonAceTotal = 0;
        let aceCount = 0;
        playerHandCards.forEach(c => {
            if (c.rank === 'A') aceCount++; else nonAceTotal += VALUES[c.rank];
        });
        // A hand is soft if an Ace is counted as 11 and the total is <= 21.
        if (aceCount > 0 && (nonAceTotal + 11 + (aceCount - 1)) === playerValue && playerValue <= 21) {
            isPlayerSoft = true;
        }
    }

    // --- Basic Strategy Logic (using strategyData.js would be more robust) ---
    // This is a placeholder for a more detailed strategy lookup.
    // The getStrategyKeysForHighlight function generates keys for such a lookup.
    // For now, using the simplified direct logic:

    // Surrender (Late Surrender, if allowed)
    if (canSurrenderCurrent && playerHandCards.length === 2 && !isPlayerPair) { // Surrender only on first two cards, not after split
        if (playerValue === 16 && (dealerCardRank === '9' || ['10', 'J', 'Q', 'K'].includes(dealerCardRank) || dealerCardRank === 'A')) return 'R';
        if (playerValue === 15 && (['10', 'J', 'Q', 'K'].includes(dealerCardRank) || dealerCardRank === 'A')) return 'R';
        // Add more surrender rules if applicable (e.g., 15 vs A if H17)
    }

    // Pair Splitting
    if (isPlayerPair && canSplitCurrent) {
        const pRank = playerHandCards[0].rank;
        if (pRank === 'A' || pRank === '8') return 'P';
        if (['10', 'J', 'Q', 'K'].includes(pRank)) return 'S'; // Never split 10s
        if (pRank === '9') {
            if (['7', '10', 'J', 'Q', 'K', 'A'].includes(dealerCardRank)) return 'S';
            return 'P';
        }
        if (pRank === '7') return (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 7) ? 'P' : 'H';
        if (pRank === '6') return (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 6) ? 'P' : 'H';
        if (pRank === '5') { // Never split 5s, treat as hard 10
             if (canDoubleCurrent && VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 9) return 'D';
             return 'H';
        }
        if (pRank === '4') { // Split 4s vs 5,6 if Double After Split (DAS) is allowed
            if (GAME_RULES.DOUBLE_AFTER_SPLIT_ALLOWED && (VALUES[dealerCardRank] === 5 || VALUES[dealerCardRank] === 6)) return 'P';
            return 'H';
        }
        if (pRank === '3' || pRank === '2') {
            if (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 7) return 'P';
            return 'H';
        }
    }

    // Soft Totals
    if (isPlayerSoft) {
        if (playerValue >= 20) return 'S'; // A,9 (20) or A,8 (19) - A,8 logic below
        if (playerValue === 19) { // A,8
             return (canDoubleCurrent && VALUES[dealerCardRank] === 6 && GAME_RULES.DEALER_STANDS_ON_SOFT_17) ? 'D' : 'S';
        }
        if (playerValue === 18) { // A,7
            if (canDoubleCurrent && VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 6) return 'D';
            if (VALUES[dealerCardRank] <= 8) return 'S'; // Stand vs 2-8
            return 'H'; // Hit vs 9, T, A
        }
        if (playerValue === 17) { // A,6
            if (canDoubleCurrent && VALUES[dealerCardRank] >= 3 && VALUES[dealerCardRank] <= 6) return 'D';
            return 'H';
        }
        // A,5 (16) ; A,4 (15)
        if (playerValue === 16 || playerValue === 15) {
            if (canDoubleCurrent && VALUES[dealerCardRank] >= 4 && VALUES[dealerCardRank] <= 6) return 'D';
            return 'H';
        }
        // A,3 (14) ; A,2 (13)
        if (playerValue === 14 || playerValue === 13) {
            if (canDoubleCurrent && VALUES[dealerCardRank] >= 5 && VALUES[dealerCardRank] <= 6) return 'D';
            return 'H';
        }
    }

    // Hard Totals (and non-splittable 5,5)
    if (playerValue >= 17) return 'S';
    if (playerValue === 16 || playerValue === 15 || playerValue === 14 || playerValue === 13) {
        return (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 6) ? 'S' : 'H';
    }
    if (playerValue === 12) return (VALUES[dealerCardRank] >= 4 && VALUES[dealerCardRank] <= 6) ? 'S' : 'H';
    if (playerValue === 11) return canDoubleCurrent ? 'D' : 'H';
    if (playerValue === 10) return (canDoubleCurrent && VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 9) ? 'D' : 'H';
    if (playerValue === 9) return (canDoubleCurrent && VALUES[dealerCardRank] >= 3 && VALUES[dealerCardRank] <= 6) ? 'D' : 'H';
    return 'H'; // 8 or less // GAME_RULES removed as it's a constant
  }, [calculateHandValue]);

  getOptimalPlayRef.current = getOptimalPlay;

  // Define these before logPlayerAction and action handlers
  const currentPlayerHand: PlayerHand | null = playerHands.length > 0 && currentHandIndex < playerHands.length ? playerHands[currentHandIndex] : null;
  const playerCanHit: boolean = !!(gameActive && currentPlayerHand && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered && calculateHandValue(currentPlayerHand.cards) < 21);
  const playerCanStand: boolean = !!(gameActive && currentPlayerHand && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered);
  const playerCanDouble: boolean = !!(gameActive && currentPlayerHand && currentPlayerHand.cards.length === 2 && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered &&
                          (!currentPlayerHand.splitFromPair || GAME_RULES.DOUBLE_AFTER_SPLIT_ALLOWED));
  const playerCanSplit: boolean = !!(gameActive && currentPlayerHand && currentPlayerHand.cards.length === 2 && currentPlayerHand.cards[0]?.rank === currentPlayerHand.cards[1]?.rank && playerHands.length < GAME_RULES.MAX_SPLIT_HANDS && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered);
  const playerCanSurrender: boolean = !!(gameActive && currentPlayerHand && canSurrenderGlobal && currentPlayerHand.cards.length === 2 && !currentPlayerHand.splitFromPair && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered);


  const logPlayerAction = useCallback((playerActionCode: string, cardDealt: Card | null = null): void => {
    setPlayerHands(prevPlayerHands => {
        const handFromStateBeforeThisLogUpdate = prevPlayerHands[currentHandIndex];
        if (!handFromStateBeforeThisLogUpdate || !dealerHand || dealerHand.length === 0) {
            console.error("logPlayerAction: Missing current hand or dealer hand in state.");
            return prevPlayerHands;
        }

        let handCardsForDecisionMaking: Card[];
        let valueBeforeAction: number;
        let valueAfterAction;

        if ((playerActionCode === 'H' || playerActionCode === 'D') && cardDealt) {
            // For H/D, logPlayerAction is called *after* the card is added to the hand object in the calling handler,
            // but *before* this setPlayerHands updater runs with that new hand object.
            // So, handFromStateBeforeThisLogUpdate.cards *already includes* cardDealt.
            if (handFromStateBeforeThisLogUpdate.cards.length === 0) {
                console.error("logPlayerAction: handFromStateBeforeThisLogUpdate.cards is empty for H/D. This should not happen.");
                handCardsForDecisionMaking = []; // Fallback
            } else {
                // The decision was made *before* cardDealt was known or added.
                handCardsForDecisionMaking = handFromStateBeforeThisLogUpdate.cards.filter(c => c.id !== cardDealt.id);
                // If cardDealt might not be unique by id, or if multiple identical cards exist:
                // A more robust way if cardDealt is guaranteed to be the last one conceptually:
                // handCardsForDecisionMaking = handFromStateBeforeThisLogUpdate.cards.slice(0, -1);
                // This assumes the cardDealt was indeed the one that would be removed by slice.
                // The filter approach is safer if cardDealt is a specific object.
            }
            valueBeforeAction = calculateHandValue(handCardsForDecisionMaking);
            valueAfterAction = calculateHandValue(handFromStateBeforeThisLogUpdate.cards);
        } else { // For S, R, P, logPlayerAction is called *before* the primary state change related to the action.
                 // The handFromStateBeforeThisLogUpdate.cards represents the hand at decision time.
            handCardsForDecisionMaking = [...handFromStateBeforeThisLogUpdate.cards];
            valueBeforeAction = calculateHandValue(handCardsForDecisionMaking);
            valueAfterAction = valueBeforeAction; // No card dealt by these actions to change value *within this log step*.
        }

        // Safety check
        if (handCardsForDecisionMaking.length === 0 && handFromStateBeforeThisLogUpdate.cards.length > 0 && (playerActionCode === 'H' || playerActionCode === 'D')) {
            console.warn(`logPlayerAction: handCardsForDecisionMaking became empty for ${playerActionCode}. Original cards: ${handFromStateBeforeThisLogUpdate.cards.map(c=>c.rank)}. Card dealt: ${cardDealt?.rank}. Using current hand state for decision.`);
            handCardsForDecisionMaking = [...handFromStateBeforeThisLogUpdate.cards];
            valueBeforeAction = calculateHandValue(handCardsForDecisionMaking); // Recalculate
        }

        const dealerUpCardToUse: Card | undefined = hideDealerFirstCard ? dealerHand[1] : dealerHand[0];
        if (!dealerUpCardToUse) {
            console.error("logPlayerAction (updater): Dealer up-card not available for optimal play.");
            return prevPlayerHands;
        }

        // Determine capabilities based on the hand state *at the point of decision*
        const canSplitForDecision = gameActive &&
            handCardsForDecisionMaking.length === 2 &&
            handCardsForDecisionMaking[0]?.rank === handCardsForDecisionMaking[1]?.rank &&
            prevPlayerHands.length < GAME_RULES.MAX_SPLIT_HANDS;

        const isDoubleEligibleForDecision = gameActive &&
            handCardsForDecisionMaking.length === 2 &&
            (!handFromStateBeforeThisLogUpdate.splitFromPair || GAME_RULES.DOUBLE_AFTER_SPLIT_ALLOWED);

        const canSurrenderForDecision = gameActive && canSurrenderGlobal &&
            handCardsForDecisionMaking.length === 2 &&
            !handFromStateBeforeThisLogUpdate.splitFromPair; // Original canSurrenderGlobal is for the current hand state

        let optimalAction = 'Error'; // Default in case ref is null
        if (getOptimalPlayRef.current) {
            optimalAction = getOptimalPlayRef.current(
                handCardsForDecisionMaking,
                dealerUpCardToUse, // Already checked for undefined
                canSplitForDecision,
                isDoubleEligibleForDecision,
                canSurrenderForDecision
            );
        }
        const wasCorrect = playerActionCode === optimalAction;

        // Update message and session stats from within this updater
        if (wasCorrect) {
            setMessage(`Correct: ${playerActionCode}`);
        } else {
            setMessage(`Mistake! You: ${playerActionCode}, Optimal: ${optimalAction}`);
        }

        setSessionStats(s => ({
            ...s,
            totalDecisions: s.totalDecisions + 1,
            correctMoves: wasCorrect ? s.correctMoves + 1 : s.correctMoves,
            incorrectMoves: !wasCorrect ? s.incorrectMoves + 1 : s.incorrectMoves,
        }));

        const updatedHand: PlayerHand = {
            ...handFromStateBeforeThisLogUpdate,
            actionsTakenLog: [
                ...(handFromStateBeforeThisLogUpdate.actionsTakenLog || []),
                { playerAction: playerActionCode, optimalAction, wasCorrect, handValueBefore: valueBeforeAction, handValueAfter: valueAfterAction, cardDealt }
            ]
        };
        const newPlayerHands = [...prevPlayerHands];
        newPlayerHands[currentHandIndex] = updatedHand as PlayerHand; // Ensure type
        return newPlayerHands;
    });
    setCanSurrenderGlobal(false); // Surrender is only for the first action on a hand
  }, [currentHandIndex, dealerHand, hideDealerFirstCard, calculateHandValue, getOptimalPlayRef, gameActive, canSurrenderGlobal, setMessage, setSessionStats, setPlayerHands]);


  // Moved up: dealerPlayLogic (used by advanceToNextHandOrDealerTurn)
  const dealerPlayLogic = useCallback(() => {
    setHideDealerFirstCard(false);
    setMessage("Dealer's turn...");
    let localDealerHand: Card[] = [...dealerHand]; // Use state at the moment of call
    let localDeck: Card[] = [...deck]; // Use state at the moment of call
    let localDealerActionsLog: DealerActionLogEntry[] = [...currentRoundDealerActionsLog]; // Start with any initial logs (e.g. reveal)

    // Log initial reveal if not Blackjack and not already logged
    const dealerInitialValue = calculateHandValue(localDealerHand);
    if ((dealerInitialValue !== 21 || localDealerHand.length > 2) && !localDealerActionsLog.some(a => a.action === 'Reveal')) {
         localDealerActionsLog.push({ action: 'Reveal', handValueBefore: dealerInitialValue, handValueAfter: dealerInitialValue });
    } else if (dealerInitialValue === 21 && localDealerHand.length === 2 && !localDealerActionsLog.some(a => a.action === 'Blackjack!')) {
        localDealerActionsLog.push({ action: 'Blackjack!', handValueBefore: dealerInitialValue, handValueAfter: dealerInitialValue });
    }


    function performDealerHit(): void {
        let currentDealerValue = calculateHandValue(localDealerHand);
        // Dealer hits on 16 or less.
        // Dealer hits on soft 17 if GAME_RULES.DEALER_STANDS_ON_SOFT_17 is false.
        let isSoft17 = false;
        if (currentDealerValue === 17) {
            let aceAsElevenMakes17 = false;
            let numAces = 0;
            let valueWithoutAces = 0;
            localDealerHand.forEach(c => {
                if (c.rank === 'A') numAces++;
                else valueWithoutAces += c.value;
            });
            if (numAces > 0 && (valueWithoutAces + 11 + (numAces - 1) === 17)) {
                aceAsElevenMakes17 = true;
            }
            isSoft17 = aceAsElevenMakes17;
        }

        if (currentDealerValue < 17 || (currentDealerValue === 17 && isSoft17 && !GAME_RULES.DEALER_STANDS_ON_SOFT_17)) {
            const { card, updatedDeck } = dealOneCard(localDeck); // dealOneCard uses its own deck state if localDeck is stale
            localDeck = updatedDeck; // Keep localDeck in sync
            const valueBeforeHit = calculateHandValue(localDealerHand);
            localDealerHand.push(card);
            const valueAfterHit = calculateHandValue(localDealerHand);
            localDealerActionsLog.push({ action: 'H', handValueBefore: valueBeforeHit, handValueAfter: valueAfterHit, cardDealt: card });

            setDealerHand([...localDealerHand]); // Update UI for dealer card
            setDeck(localDeck); // Update main deck state

            if (valueAfterHit > 21) {
                localDealerActionsLog.push({ action: 'Bust', handValueBefore: valueAfterHit, handValueAfter: valueAfterHit });
                finalizeDealerTurn();
            } else {
                setTimeout(performDealerHit, 1000); // Next hit
            }
        } else {
            localDealerActionsLog.push({ action: 'S', handValueBefore: currentDealerValue, handValueAfter: currentDealerValue });
            finalizeDealerTurn();
        }
    }

    function finalizeDealerTurn(): void {
        setCurrentRoundDealerActionsLog(localDealerActionsLog); // Set final log for this round
        // setDealerHand(localDealerHand); // Already updated progressively
        // determineGameOutcome will use the latest dealerHand from state.
        determineGameOutcome(false, false); // Not initial blackjacks for this path
    }

    // If dealer has Blackjack (already revealed), skip hitting logic.
    if (dealerInitialValue === 21 && localDealerHand.length === 2) {
        finalizeDealerTurn();
    } else {
        setTimeout(performDealerHit, 500); // Start dealer's play
    }
  }, [dealerHand, deck, dealOneCard, calculateHandValue, determineGameOutcome, currentRoundDealerActionsLog, setMessage, setHideDealerFirstCard, setDealerHand, setDeck, setCurrentRoundDealerActionsLog]);


  const advanceToNextHandOrDealerTurn = useCallback(() => {
    // Check current hand first, if it auto-stood (e.g. split Aces, or 21)
    const currentHandProcessed = playerHands[currentHandIndex];
    if (currentHandProcessed && (currentHandProcessed.stood || currentHandProcessed.busted || currentHandProcessed.surrendered)) {
        // Current hand is done, try to find the next playable hand
        let nextIndex = -1;
        for (let i = currentHandIndex + 1; i < playerHands.length; i++) {
            if (!playerHands[i].stood && !playerHands[i].busted && !playerHands[i].surrendered) {
                nextIndex = i;
                break;
            }
        }

        if (nextIndex !== -1) {
            setCurrentHandIndex(nextIndex);
            setMessage(`Playing Hand ${nextIndex + 1}. Your move.`);
            // Surrender is only allowed on the first two cards of a non-split hand.
            // After a split, new hands get two cards. Surrender might be allowed if not split Aces.
            const nextHand = playerHands[nextIndex];
            setCanSurrenderGlobal(
                nextHand.cards.length === 2 &&
                !nextHand.splitFromPair // Or specific rule: GAME_RULES.SURRENDER_AFTER_SPLIT_ALLOWED
            );
        } else {
            // All player hands are processed, dealer's turn
            dealerPlayLogic();
        }
    } else {
        // Current hand is still active (e.g. after a hit that wasn't a bust/21, or after a split where new hand is playable)
        // This case might occur if advanceToNextHandOrDealerTurn is called prematurely
        // or if the logic for auto-standing the current hand isn't complete before this call.
        // For now, assume if this is reached, the current hand is still the one to play.
        setMessage(`Playing Hand ${currentHandIndex + 1}. Your move.`);
        const handToPlay = playerHands[currentHandIndex];
         setCanSurrenderGlobal(
            handToPlay.cards.length === 2 &&
            !handToPlay.splitFromPair
        );
    }
  }, [currentHandIndex, playerHands, dealerPlayLogic, setMessage, setCurrentHandIndex, setCanSurrenderGlobal]);

  const hitHandler = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!gameActive || !playerCanHit) return { success: false, message: "Cannot hit." };

    const { card, updatedDeck } = dealOneCard(deck);
    setDeck(updatedDeck);

    // Create the new hand state locally first for logging and checks
    const handBeforeHit = playerHands[currentHandIndex];
    const newCards = [...handBeforeHit.cards, card];
    const newHandValue = calculateHandValue(newCards);

    // Log the action. Pass the card that was dealt.
    // logPlayerAction's setPlayerHands updater will use handBeforeHit.cards and card to determine pre/post values.
    // For H/D, the `cardDealt` is used to reconstruct the "before" state for optimal play.
    // The `playerHands[currentHandIndex]` inside `logPlayerAction`'s updater will be `handBeforeHit`.
    // We need to ensure `logPlayerAction` is called in a way that it can correctly identify the state *before* this hit.
    // The current `logPlayerAction` expects `cardDealt` and that the hand in `prevPlayerHands` *includes* the `cardDealt`.
    // So, we update `playerHands` first, then log.

    setPlayerHands(prev => {
        const newHands = [...prev];
        const currentHand: PlayerHand = { ...newHands[currentHandIndex] };
        currentHand.cards = newCards; // newCards already includes the hit card
        // Bust/21 status will be set after logging and re-evaluation
        newHands[currentHandIndex] = currentHand;
        return newHands;
    });

    // Call logPlayerAction *after* setPlayerHands has been called.
    // React might batch these, so logPlayerAction's setPlayerHands updater
    // will see the playerHands state *including* the new card.
    logPlayerAction('H', card);

    // Now, check for bust or 21 based on the newHandValue
    if (newHandValue > 21) {
        setPlayerHands(prev => prev.map((h, i) => i === currentHandIndex ? { ...h, busted: true, stood: true } as PlayerHand : h));
        setMessage(`Hand ${currentHandIndex + 1} Busted!`);
    } else if (newHandValue === 21) {
        setPlayerHands(prev => prev.map((h, i) => i === currentHandIndex ? { ...h, stood: true } as PlayerHand : h));
    } else {
        // Message is handled by logPlayerAction
    }
    return { success: true, message: `Hit with ${card.rank}${card.suit}.` };
  }, [gameActive, playerCanHit, deck, dealOneCard, currentHandIndex, playerHands, logPlayerAction, calculateHandValue, setMessage, setDeck, setPlayerHands]);

  const standHandler = useCallback(() => {
    if (!gameActive || !playerCanStand) return;
    logPlayerAction('S'); // Log before state update that changes `stood`
    setPlayerHands(prev => prev.map((h, i) => (i === currentHandIndex ? { ...h, stood: true } as PlayerHand : h)));
    // advanceToNextHandOrDealerTurn will be called, and it will see the `stood: true`
    // advanceToNextHandOrDealerTurn(); // Removed, useEffect will handle // advanceToNextHandOrDealerTurn removed from deps
  }, [gameActive, playerCanStand, currentHandIndex, logPlayerAction, setPlayerHands]);

  const doubleHandler = useCallback(() => {
    if (!gameActive || !playerCanDouble) return;
    const { card, updatedDeck } = dealOneCard(deck);
    setDeck(updatedDeck);

    const handBeforeDouble = playerHands[currentHandIndex];
    const newCards = [...handBeforeDouble.cards, card];
    const newHandValue = calculateHandValue(newCards);

    setPlayerHands(prev => {
        const newHands = [...prev];
        const currentHandUpdate: PlayerHand = {
            ...newHands[currentHandIndex],
            cards: newCards,
            doubled: true,
            stood: true, // Player stands after double
            busted: newHandValue > 21,
        };
        newHands[currentHandIndex] = currentHandUpdate;
        return newHands;
    });

    logPlayerAction('D', card); // Log after playerHands update

    if (newHandValue > 21) {
        setMessage(`Hand ${currentHandIndex + 1} Doubled and Busted!`);
    }
    // advanceToNextHandOrDealerTurn will be called, and it will see the `stood: true`
    // advanceToNextHandOrDealerTurn(); // Removed, useEffect will handle
  }, [gameActive, playerCanDouble, deck, dealOneCard, currentHandIndex, playerHands, logPlayerAction, calculateHandValue, setMessage, setDeck, setPlayerHands]);

  const surrenderHandler = useCallback(() => {
    if (!gameActive || !playerCanSurrender) return;
    logPlayerAction('R'); // Log before state update
    setPlayerHands(prev => prev.map((h, i) => (i === currentHandIndex ? { ...h, surrendered: true, stood: true, outcome: "Loss" } as PlayerHand : h)));
    // advanceToNextHandOrDealerTurn will be called, and it will see the `stood: true` and `surrendered: true`
    // advanceToNextHandOrDealerTurn(); // Removed, useEffect will handle // advanceToNextHandOrDealerTurn removed from deps
  }, [gameActive, playerCanSurrender, currentHandIndex, logPlayerAction, setPlayerHands]);

  const splitHandler = useCallback(() => {
    if (!gameActive || !playerCanSplit) return;

    const handToSplitOriginal = playerHands[currentHandIndex];
    logPlayerAction('P'); // Log split decision for the original hand configuration

    // Deck state needs to be managed carefully here.
    // dealOneCard updates the main deck state via setDeck if it reshuffles.
    // We need to ensure the deck used for the second card is the one returned after the first deal.
    let tempDeck = [...deck];
    const { card: newCardForHand1, updatedDeck: deckAfterCard1 } = dealOneCard(tempDeck);
    tempDeck = deckAfterCard1;
    const { card: newCardForHand2, updatedDeck: deckAfterCard2 } = dealOneCard(tempDeck);
    setDeck(deckAfterCard2); // Final deck state after both cards are dealt for splits

    setPlayerHands(prevPlayerHands => {
        const hands = [...prevPlayerHands];
        const handToSplit = hands[currentHandIndex]; // Get the latest version from prevPlayerHands
        const card1Original = handToSplit.cards[0];
        const card2Original = handToSplit.cards[1];

        const firstSplitHand: PlayerHand = {
            ...handToSplit, // carry over initial bet etc. if implemented
            cards: [card1Original, newCardForHand1],
            splitFromPair: true,
            doubled: false, stood: false, busted: false, surrendered: false, isBlackjack: false, outcome: null,
            initialCardsForThisHand: [card1Original, newCardForHand1],
            actionsTakenLog: [] // Reset actions log for this new hand
        };

        const secondSplitHand: PlayerHand = {
            ...handToSplit,
            cards: [card2Original, newCardForHand2],
            splitFromPair: true,
            doubled: false, stood: false, busted: false, surrendered: false, isBlackjack: false, outcome: null,
            initialCardsForThisHand: [card2Original, newCardForHand2],
            actionsTakenLog: []
        };

        // Handle Aces - usually only one card and stand
        // TODO: Implement Ace split logic or remove this if not needed.
        // (The original code was incomplete and caused a syntax error.)
        return [...hands, firstSplitHand, secondSplitHand];
    });

    setCurrentHandIndex(prevIndex => prevIndex + 1); // Move to the next hand (the first new hand from the split)
    setMessage("New hands dealt from split. Your move.");
  }, [gameActive, playerCanSplit, deck, dealOneCard, currentHandIndex, playerHands, logPlayerAction, setMessage, setDeck, setPlayerHands, setCurrentHandIndex]);

  // --- Debugging and Logging ---
  // useEffect(() => {
  //   console.log("Player Hands:", JSON.stringify(playerHands, null, 2));
  //   console.log("Dealer Hand:", JSON.stringify(dealerHand, null, 2));
  //   console.log("Game Active:", gameActive);
  //   console.log("Message:", message);
  //   console.log("Session Stats:", JSON.stringify(sessionStats, null, 2));
  //   console.log("Game History:", JSON.stringify(gameHistory, null, 2));
  // }, [playerHands, dealerHand, gameActive, message, sessionStats, gameHistory]);

  return {
    playerHands,
    currentHandIndex,
    dealerHand,
    gameActive,
    message,
    hideDealerFirstCard,
    highlightParams,
    gameHistory,
    showHistoryModal,
    sessionStats,
    newGameHandler,
    hitHandler,
    standHandler,
    doubleHandler,
    splitHandler,
    surrenderHandler,
    showHistoryHandler: () => setShowHistoryModal(true),
    closeHistoryModalHandler: () => setShowHistoryModal(false),
    resetSessionStats,
    getHandScoreText,
    playerCanHit,
    playerCanStand,
    playerCanDouble,
    playerCanSplit,
    playerCanSurrender,
  };
};
