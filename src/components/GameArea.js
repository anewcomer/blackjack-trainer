import React from 'react';
import Card from './Card';

const GameArea = ({ dealerHand, playerHands, currentHandIndex, hideDealerFirstCard, getHandScoreText }) => {
  const renderCards = (hand, hidden = false) => (
    <div className="cards" aria-live="polite">
      {hand.map((card, idx) => (
        <Card key={card.id || idx} card={card} hidden={hidden && idx === 0} />
      ))}
    </div>
  );

  const renderHandArea = (title, hand, score, hidden = false, isPlayer = false, handIndex = null, totalHands = null) => (
    <div className={isPlayer ? "player-area" : "dealer-area"}>
      <h2>{title}</h2>
      {renderCards(hand, hidden)}
      <div className="score">
        {score !== null ? `Score: ${score}` : ''}
        {isPlayer && totalHands > 1 && ` (Hand ${handIndex + 1}/${totalHands})`}
      </div>
    </div>
  );

  const currentPlayerHand = (playerHands && playerHands.length > 0 && currentHandIndex < playerHands.length)
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