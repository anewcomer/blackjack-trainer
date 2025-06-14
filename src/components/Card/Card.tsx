import React from 'react';
import './Card.css';

// We can use the Card type from useBlackjackGame if it's exported and suitable,
// or define a local one specific to this component's needs.
// For now, a local definition:
interface CardData {
  rank: string;
  suit: string;
}
interface CardProps {
  card?: CardData; // Card can be undefined for an empty slot
  hidden?: boolean;
}
const CardComponent: React.FC<CardProps> = ({ card, hidden }) => {
  if (!card) {
    // Render a placeholder or nothing if card data is missing
    return <div className="card empty"></div>;
  }

  if (hidden) {
    return <div className="card hidden" aria-label="Hidden card"></div>;
  }

  const isRed = card.suit === '\u2665' || card.suit === '\u2666';
  return (
    <div className={`card ${isRed ? 'red' : ''}`} aria-label={`${card.rank} of ${card.suit}`}>
      <div className="rank">{card.rank}</div>
      <div className="suit">{card.suit}</div>
    </div>
  );
};

export default CardComponent;
