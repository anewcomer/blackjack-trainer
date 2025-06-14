import './App.css';
import React from 'react';
import GameArea from './components/GameArea';
import Actions from './components/Actions';
import StrategyGuide from './components/StrategyGuide';
import HistoryModal from './components/HistoryModal';
import { useBlackjackGame, BlackjackGameHook } from './hooks/useBlackjackGame';

const App: React.FC = () => {
  const {
    playerHands,
    currentHandIndex,
    dealerHand,
    // gameActive, // Not directly used by App's JSX, but hook manages it
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
    showHistoryHandler,
    closeHistoryModalHandler,
    resetSessionStats,
    getHandScoreText,
    playerCanHit,
    playerCanStand,
    playerCanDouble,
    playerCanSplit,
    playerCanSurrender,
  } = useBlackjackGame();
  
  return (
    <div className="main-game-area">
      <div className="game-container">
        <h1>Blackjack Trainer</h1>
        <GameArea
          dealerHand={dealerHand}
          playerHands={playerHands}
          currentHandIndex={currentHandIndex}
          hideDealerFirstCard={hideDealerFirstCard}
          getHandScoreText={getHandScoreText}
        />
        <Actions
          onNewGame={newGameHandler}
          onHit={hitHandler}
          onStand={standHandler}
          onDouble={doubleHandler}
          onSplit={splitHandler}
          onSurrender={surrenderHandler}
          onShowHistory={showHistoryHandler}
          playerCanHit={playerCanHit} playerCanStand={playerCanStand} playerCanDouble={playerCanDouble}
          playerCanSplit={playerCanSplit} playerCanSurrender={playerCanSurrender}
        />
        <div id="message" className="message">{message}</div>
      </div>
      <StrategyGuide
        highlightType={highlightParams.type}
        highlightPlayerKey={highlightParams.playerKey}
        highlightDealerKey={highlightParams.dealerKey}
      />
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={closeHistoryModalHandler}
        history={gameHistory}
        stats={sessionStats}
        onNewSession={() => { resetSessionStats(); newGameHandler(); }}
      />
    </div>
  );
}
export default App;
