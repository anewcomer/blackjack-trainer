// Strategy feedback component for real-time decision evaluation

import React from 'react';
import {
    Box,
    Alert,
    Typography,
    Chip,
    Stack,
} from '@mui/material';
import { CheckCircle, Cancel, Info } from '@mui/icons-material';
import { StrategyDecision } from '../../types/strategy';
import { getActionName } from '../../utils/strategy';

interface StrategyFeedbackProps {
    decision: StrategyDecision | null;
    isVisible: boolean;
}

const StrategyFeedback: React.FC<StrategyFeedbackProps> = ({ decision, isVisible }) => {
    if (!isVisible || !decision) {
        return null;
    }

    const severity = decision.isCorrect ? 'success' : 'error';
    const icon = decision.isCorrect ? <CheckCircle /> : <Cancel />;

    return (
        <Box sx={{ mb: 2 }}>
            <Alert
                severity={severity}
                icon={icon}
                sx={{
                    '& .MuiAlert-message': { width: '100%' },
                    mb: 1
                }}
            >
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {decision.isCorrect ? 'Correct Decision!' : 'Strategy Deviation'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    {decision.explanation}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Hand Type:
                    </Typography>
                    <Chip
                        label={decision.handType}
                        size="small"
                        variant="outlined"
                    />

                    <Typography variant="body2" color="text.secondary">
                        Your Action:
                    </Typography>
                    <Chip
                        label={getActionName(decision.action === 'H' ? 'HIT' :
                            decision.action === 'S' ? 'STAND' :
                                decision.action === 'D' ? 'DOUBLE' :
                                    decision.action === 'P' ? 'SPLIT' : 'SURRENDER')}
                        size="small"
                        color={decision.isCorrect ? 'success' : 'error'}
                    />

                    {!decision.isCorrect && (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                Optimal:
                            </Typography>
                            <Chip
                                label={getActionName(decision.optimalAction === 'H' ? 'HIT' :
                                    decision.optimalAction === 'S' ? 'STAND' :
                                        decision.optimalAction === 'D' ? 'DOUBLE' :
                                            decision.optimalAction === 'P' ? 'SPLIT' : 'SURRENDER')}
                                size="small"
                                color="primary"
                            />
                        </>
                    )}
                </Stack>
            </Alert>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info color="action" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                    Hand: {decision.handType} {decision.playerValue} vs Dealer {decision.dealerUpcard}
                </Typography>
            </Box>
        </Box>
    );
};

export default StrategyFeedback;
