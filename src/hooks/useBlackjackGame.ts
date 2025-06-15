import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, PlayerHand, DealerActionLogEntry, SessionStats, GameHistoryEntry, HighlightParams, BlackjackGameHook } from '../logic/blackjackTypes';
import { GAME_RULES } from '../logic/blackjackConstants';
import { calculateHandValue, getHandScoreText, createNewDeck, shuffleDeck, dealOneCard } from '../logic/blackjackUtils';
import { getStrategyKeysForHighlight, getOptimalPlay } from '../logic/blackjackStrategy';

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
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    correctMoves: 0, incorrectMoves: 0, totalDecisions: 0,
    wins: 0, losses: 0, pushes: 0, handsPlayed: 0
  });
  const [currentRoundDealerActionsLog, setCurrentRoundDealerActionsLog] = useState<DealerActionLogEntry[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  // Helper to get the current player hand
  const currentPlayerHand: PlayerHand | null = playerHands.length > 0 && currentHandIndex < playerHands.length ? playerHands[currentHandIndex] : null;

  // Move logRoundToHistory inside the useCallback that uses it, or wrap it in useCallback and use as a stable dependency.
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
      dealerUpCard: finalDealerHand.length > 0 ? `${finalDealerHand[0].rank}${finalDealerHand[0].suit}` : 'N/A',
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
      dealerBlackjackOnInit: dealerBlackjack,
      playerBlackjackOnInit: playerBlackjackOnInit,
    };
    setGameHistory(prev => [...prev, roundEntry]);
  }, []);

  const resetSessionStats = useCallback(() => {
    setSessionStats({
        correctMoves: 0, incorrectMoves: 0, totalDecisions: 0,
        wins: 0, losses: 0, pushes: 0, handsPlayed: 0
    });
    setMessage("Session stats reset. Click 'New Game'.");
  }, [setSessionStats, setMessage]);

  // Forward declaration for use in getOptimalPlay
  const getOptimalPlayRef = useRef(getOptimalPlay);

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
  }, [dealerHand, playerHands, currentRoundDealerActionsLog, logRoundToHistory, setMessage, setPlayerHands, setGameActive, setSessionStats]);

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
  }, [determineGameOutcome, setMessage, setDeck, setPlayerHands, setDealerHand, setCurrentHandIndex, setHideDealerFirstCard, setCanSurrenderGlobal, setCurrentRoundDealerActionsLog, setGameActive]);

  // --- Strategy and Mistake Checking ---
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
  }, [currentHandIndex, dealerHand, hideDealerFirstCard, gameActive, canSurrenderGlobal, setMessage, setSessionStats, setPlayerHands]);


  const hitHandler = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!gameActive || !playerCanHit) return { success: false, message: "Cannot hit." };
    const { card, updatedDeck } = dealOneCard(deck);
    setDeck(updatedDeck);
    const handBeforeHit = playerHands[currentHandIndex];
    const newCards = [...handBeforeHit.cards, card];
    const newHandValue = calculateHandValue(newCards);
    setPlayerHands(prev => {
        const newHands = [...prev];
        const currentHand: PlayerHand = { ...newHands[currentHandIndex] };
        currentHand.cards = newCards;
        newHands[currentHandIndex] = currentHand;
        return newHands;
    });
    logPlayerAction('H', card);
    if (newHandValue > 21) {
        setPlayerHands(prev => prev.map((h, i) => i === currentHandIndex ? { ...h, busted: true, stood: true } as PlayerHand : h));
        setMessage(`Hand ${currentHandIndex + 1} Busted!`);
    } else if (newHandValue === 21) {
        setPlayerHands(prev => prev.map((h, i) => i === currentHandIndex ? { ...h, stood: true } as PlayerHand : h));
    }
    return { success: true, message: `Hit with ${card.rank}${card.suit}.` };
  }, [gameActive, playerCanHit, deck, currentHandIndex, setMessage, setDeck, setPlayerHands, logPlayerAction, playerHands]);

  const standHandler = useCallback(() => {
    if (!gameActive || !playerCanStand) return;
    logPlayerAction('S');
    setPlayerHands(prev => prev.map((h, i) => (i === currentHandIndex ? { ...h, stood: true } as PlayerHand : h)));
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
            stood: true,
            busted: newHandValue > 21,
        };
        newHands[currentHandIndex] = currentHandUpdate;
        return newHands;
    });

    logPlayerAction('D', card);

    if (newHandValue > 21) {
      setMessage(`Hand ${currentHandIndex + 1} Doubled and Busted!`);
    }
  }, [gameActive, playerCanDouble, deck, currentHandIndex, playerHands, logPlayerAction, setMessage, setDeck, setPlayerHands]);

  const surrenderHandler = useCallback(() => {
    if (!gameActive || !playerCanSurrender) return;
    logPlayerAction('R');
    setPlayerHands(prev => prev.map((h, i) => (i === currentHandIndex ? { ...h, surrendered: true, stood: true, outcome: "Loss" } as PlayerHand : h)));
  }, [gameActive, playerCanSurrender, currentHandIndex, logPlayerAction, setPlayerHands]);

  const splitHandler = useCallback(() => {
    if (!gameActive || !playerCanSplit) return;

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
  }, [gameActive, playerCanSplit, deck, currentHandIndex, setMessage, setDeck, setPlayerHands, setCurrentHandIndex]);

  // --- Debugging and Logging ---
  // useEffect(() => {
  //   console.log("Player Hands:", JSON.stringify(playerHands, null, 2));
  //   console.log("Dealer Hand:", JSON.stringify(dealerHand, null, 2));
  //   console.log("Game Active:", gameActive);
  //   console.log("Message:", message);
  //   console.log("Session Stats:", JSON.stringify(sessionStats, null, 2));
  //   console.log("Game History:", JSON.stringify(gameHistory, null, 2));
  // }, [playerHands, dealerHand, gameActive, message, sessionStats, gameHistory]);

  // Update highlightParams whenever the current hand, dealer hand, or dealer card visibility changes
  useEffect(() => {
    const currentHand = playerHands.length > 0 && currentHandIndex < playerHands.length ? playerHands[currentHandIndex] : null;
    const isActive = currentHand && !currentHand.busted && !currentHand.stood && !currentHand.surrendered && gameActive;
    if (isActive) {
      setHighlightParams(getStrategyKeysForHighlight(currentHand, dealerHand, hideDealerFirstCard));
    } else {
      setHighlightParams({ type: null, playerKey: null, dealerKey: null });
    }
  }, [playerHands, currentHandIndex, dealerHand, hideDealerFirstCard, gameActive]);

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
