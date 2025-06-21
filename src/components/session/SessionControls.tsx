import React from 'react';
import {
    Box,
    Button,
    Typography,
    Stack,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    PlayArrow,
    Stop,
    Refresh,
    History,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { startNewSession, endCurrentSession, resetAllData } from '../../store/sessionSlice';

export const SessionControls: React.FC = () => {
    const dispatch = useAppDispatch();
    const { currentSession } = useAppSelector((state) => state.session);

    const handleStartNewSession = () => {
        dispatch(startNewSession());
    };

    const handleEndSession = () => {
        dispatch(endCurrentSession());
    };

    const handleResetAllData = () => {
        if (window.confirm('Are you sure you want to reset all session data? This cannot be undone.')) {
            dispatch(resetAllData());
        }
    };

    const getSessionDuration = () => {
        const durationMs = Date.now() - currentSession.sessionStart;
        const minutes = Math.floor(durationMs / 60000);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    };

    const isActiveSession = currentSession.sessionEnd === null;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: 'background.paper',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        Session Status
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={isActiveSession ? 'Active' : 'Ended'}
                            color={isActiveSession ? 'success' : 'default'}
                            size="small"
                            variant={isActiveSession ? 'filled' : 'outlined'}
                        />
                        {isActiveSession && (
                            <Typography variant="caption" color="text.secondary">
                                {getSessionDuration()}
                            </Typography>
                        )}
                    </Stack>
                </Box>

                {currentSession.handsPlayed > 0 && (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Progress
                        </Typography>
                        <Typography variant="caption">
                            {currentSession.handsPlayed} hands • {currentSession.decisionsTotal} decisions
                        </Typography>
                    </Box>
                )}
            </Stack>

            <Stack direction="row" spacing={1}>
                {isActiveSession ? (
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={handleEndSession}
                        startIcon={<Stop />}
                    >
                        End Session
                    </Button>
                ) : (
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleStartNewSession}
                        startIcon={<PlayArrow />}
                    >
                        New Session
                    </Button>
                )}

                <Tooltip title="Reset all data">
                    <IconButton
                        size="small"
                        color="error"
                        onClick={handleResetAllData}
                    >
                        <Refresh />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Session history (coming soon)">
                    <IconButton
                        size="small"
                        disabled
                    >
                        <History />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Box>
    );
};
