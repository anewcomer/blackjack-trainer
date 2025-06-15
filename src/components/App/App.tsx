import React from 'react';
import GameArea from '../GameArea/GameArea';
import Actions from '../Actions/Actions';
import StrategyGuide from '../StrategyGuide/StrategyGuide';
import HistoryModal from '../HistoryModal/HistoryModal';
import { useBlackjackGame } from '../../hooks/useBlackjackGame';
import { Box, Container, Typography } from '@mui/material';

const App: React.FC = () => {
  const {
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 500, gap: 3 }}>
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Typography variant="h3" component="h1" gutterBottom align="center">
              Blackjack Trainer
            </Typography>
            <GameArea
              dealerHand={dealerHand}
              playerHands={playerHands}
              currentHandIndex={currentHandIndex}
              hideDealerFirstCard={hideDealerFirstCard}
              getHandScoreText={getHandScoreText}
              gameActive={gameActive}
              message={message}
              recentAction={playerHands[currentHandIndex]?.actionsTakenLog?.slice(-1)[0]}
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
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <StrategyGuide
              highlightType={highlightParams.type}
              highlightPlayerKey={highlightParams.playerKey}
              highlightDealerKey={highlightParams.dealerKey}
            />
          </Box>
        </Box>
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={closeHistoryModalHandler}
          history={gameHistory}
          stats={sessionStats}
          onNewSession={() => { resetSessionStats(); newGameHandler(); }}
        />
      </Container>
    </Box>
  );
}
export default App;
