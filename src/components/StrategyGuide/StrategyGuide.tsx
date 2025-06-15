import React, { useState, useEffect } from 'react';
import { hardTotalsData, softTotalsData, pairSplittingData } from '../../data/strategyData';
import { useBlackjack } from '../../context/BlackjackContext';
import { Box, Tabs, Tab, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// Helper function to render a strategy table
type PlayerHandType = 'pairs' | 'soft' | 'hard';

const actionColors: Record<string, string> = {
  S: 'success.light', // Stand
  H: 'info.light',    // Hit
  D: 'warning.light', // Double
  P: 'secondary.light', // Split
  R: 'error.light',   // Surrender
};
const highlightColor = '#ffe600'; // Bright yellow

const renderStrategyTable = (title: string, data: { [key: string]: string }, playerHandType: PlayerHandType, highlightPlayerKey?: string | null, highlightDealerKey?: string | null) => {
    // Player hand values (rows) - customize as needed
    const playerValues: string[] = playerHandType === 'pairs'
        ? ['A,A', 'T,T', '9,9', '8,8', '7,7', '6,6', '5,5', '4,4', '3,3', '2,2']
        : playerHandType === 'soft'
            ? ['A,9', 'A,8', 'A,7', 'A,6', 'A,5', 'A,4', 'A,3', 'A,2']
            : ['17+', '16', '15', '14', '13', '12', '11', '10', '9', '8', '5-7']; // Hard totals

    // Dealer card values (columns)
    const dealerValues: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'A'];
    const strategyData = data;

    const isHighlighted = (playerVal: string, dealerVal: string): boolean => {
        // Both keys need to be present for highlighting to work
        if (!highlightPlayerKey || !highlightDealerKey) return false;
        return playerVal === highlightPlayerKey && dealerVal === highlightDealerKey;
    };

    return (
        <Box sx={{ my: 1, overflowX: 'auto', width: '100%' }}>
            <TableContainer component={Paper} sx={{ minWidth: 0, width: '100%', overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 0, width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ p: 0.1, fontSize: '0.72em', width: 20, minWidth: 20, maxWidth: 28, fontFamily: 'monospace' }}>P</TableCell>
                            {dealerValues.map(dealerVal => (
                                <TableCell key={dealerVal} align="center" sx={{ p: 0.1, fontSize: '0.72em', width: 20, minWidth: 20, maxWidth: 28, fontFamily: 'monospace' }}>{dealerVal}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {playerValues.map(playerVal => (
                            <TableRow key={playerVal}>
                                <TableCell align="center" sx={{ p: 0.1, fontSize: '0.72em', width: 20, minWidth: 20, maxWidth: 28, fontFamily: 'monospace' }}>{playerVal}</TableCell>
                                {dealerValues.map(dealerVal => {
                                    const action = strategyData[`${playerVal}-${dealerVal}`] || '-';
                                    const highlighted = isHighlighted(playerVal, dealerVal);
                                    const baseColor = actionColors[action] || 'background.paper';
                                    return (
                                        <TableCell
                                            key={`${playerVal}-${dealerVal}`}
                                            align="center"
                                            sx={{
                                                p: 0.1,
                                                fontSize: '0.72em',
                                                width: 20,
                                                minWidth: 20,
                                                maxWidth: 28,
                                                fontFamily: 'monospace',
                                                bgcolor: highlighted ? highlightColor : baseColor,
                                                color: highlighted ? 'grey.900' : 'text.primary',
                                                fontWeight: highlighted ? 'bold' : undefined,
                                                border: highlighted ? 2 : 1,
                                                borderColor: highlighted ? 'warning.dark' : 'divider',
                                                transition: 'background 0.2s',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {action}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

const condensedLegend =
  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Typography variant="caption" sx={{ fontWeight: 500, letterSpacing: 1, color: 'text.secondary' }}>
      Legend: <b>S</b> = Stand,&nbsp; <b>H</b> = Hit,&nbsp; <b>D</b> = Double,&nbsp; <b>P</b> = Split,&nbsp; <b>R</b> = Surrender (if allowed, otherwise Hit)
    </Typography>
    <Typography variant="subtitle2" sx={{ mt: 1, color: 'text.disabled', fontStyle: 'italic', fontWeight: 400 }}>
      Basic Strategy Reference (H17, DAS)
    </Typography>
  </Box>;

const StrategyGuide: React.FC = () => {
    const [activeTab, setActiveTab] = useState<PlayerHandType>('hard');
    const { highlightParams } = useBlackjack();
    const { type: highlightType, playerKey: highlightPlayerKey, dealerKey: highlightDealerKey } = highlightParams;
    
    // For debugging
    useEffect(() => {
        console.log(`StrategyGuide received: type=${highlightType}, player=${highlightPlayerKey}, dealer=${highlightDealerKey}`);
        if (highlightType && highlightPlayerKey && highlightDealerKey) {
            console.log("Should highlight a cell now");
        }
    }, [highlightType, highlightPlayerKey, highlightDealerKey]);

    // Automatically switch to the correct tab when highlightType changes
    useEffect(() => {
        if (highlightType === 'hard' || highlightType === 'soft' || highlightType === 'pairs') {
            console.log(`Switching strategy guide tab to: ${highlightType}`);
            setActiveTab(highlightType);
        }
    }, [highlightType]);

    // Only pass the highlight keys to the relevant table type
    const getTableHighlightKeys = (tableType: PlayerHandType) => {
        if (highlightType === tableType) {
            return { playerKey: highlightPlayerKey, dealerKey: highlightDealerKey };
        } 
        return { playerKey: null, dealerKey: null };
    };

    return (
        <Box id="strategy-guide-container" sx={{ mt: 4, mb: 2 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} aria-label="strategy tabs" sx={{ mb: 2 }}>
                <Tab label="Hard Totals" value="hard" />
                <Tab label="Soft Totals" value="soft" />
                <Tab label="Pairs" value="pairs" />
            </Tabs>
            <Box hidden={activeTab !== 'hard'}>
                {renderStrategyTable("Hard Totals", hardTotalsData, "hard", getTableHighlightKeys('hard').playerKey, getTableHighlightKeys('hard').dealerKey)}
            </Box>
            <Box hidden={activeTab !== 'soft'}>
                {renderStrategyTable("Soft Totals", softTotalsData, "soft", getTableHighlightKeys('soft').playerKey, getTableHighlightKeys('soft').dealerKey)}
            </Box>
            <Box hidden={activeTab !== 'pairs'}>
                {renderStrategyTable("Pairs", pairSplittingData, "pairs", getTableHighlightKeys('pairs').playerKey, getTableHighlightKeys('pairs').dealerKey)}
            </Box>
            {condensedLegend}
        </Box>
    );
};

export default StrategyGuide;
