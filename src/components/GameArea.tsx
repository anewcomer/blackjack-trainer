import React from 'react';
import CardComponent from './Card'; // Assuming Card.tsx exports CardComponent
import { Card as CardType, PlayerHand as PlayerHandType } from '../hooks/useBlackjackGame'; // Import core types

interface GameAreaProps {
  dealerHand: CardType[];
  playerHands: PlayerHandType[];
  currentHandIndex: number;
  hideDealerFirstCard: boolean;
  getHandScoreText: (handCards: CardType[]) => string;
}

const GameArea: React.FC<GameAreaProps> = ({ dealerHand, playerHands, currentHandIndex, hideDealerFirstCard, getHandScoreText }) => {
  const renderCards = (hand: CardType[], hidden: boolean = false) => (
    <div className="cards" aria-live="polite">
      {hand.map((card, idx) => (
        <CardComponent key={card.id || idx} card={card} hidden={hidden && idx === 0} />
      ))}
    </div>
  );
  const renderHandArea = (title: string, hand: CardType[], score: string | null, hidden: boolean = false, isPlayer: boolean = false, handIndex: number | null = null, totalHands: number | null = null) => (
    <div className={isPlayer ? "player-area" : "dealer-area"}>
      <h2>{title}</h2>
      {renderCards(hand, hidden)}
      <div className="score">
        {score !== null ? `Score: ${score}` : ''}
        {isPlayer && totalHands > 1 && ` (Hand ${handIndex + 1}/${totalHands})`}
      </div>
    </div>
  );

  const currentPlayerHand: PlayerHandType | null = (playerHands && playerHands.length > 0 && currentHandIndex < playerHands.length)
    ? playerHands[currentHandIndex]
    : null;

  const dealerScore = (hideDealerFirstCard && dealerHand.length > 0) ? '?' : (dealerHand.length > 0 ? getHandScoreText(dealerHand) : null);

  return (
    <div className="game-area">
      {renderHandArea("Dealer's Hand", dealerHand, dealerScore, hideDealerFirstCard)}

      {currentPlayerHand
        ? renderHandArea(
          "Your Hand",
          currentPlayerHand.cards,
          getHandScoreText(currentPlayerHand.cards),
          false,
          true,
          currentHandIndex,
          playerHands.length
        )
        : renderHandArea("Your Hand", [], null, false, true)}
    </div>
  );
};

export default GameArea;