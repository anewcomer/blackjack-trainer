import React from 'react';

const Card = ({ card, hidden }) => {
  if (!card) {
    // Render a placeholder or nothing if card data is missing
    return <div className="card empty"></div>;
  }

  if (hidden) {
    return <div className="card hidden" aria-label="Hidden card"></div>;
  }

  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div className={`card ${isRed ? 'red' : ''}`} aria-label={`${card.rank} of ${card.suit}`}>
      <div className="rank">{card.rank}</div>
      <div className="suit">{card.suit}</div>
    </div>
  );
};

export default Card;