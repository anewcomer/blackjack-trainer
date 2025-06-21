// Theme toggle component for switching between light and dark modes
import React from 'react';
import {
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDarkMode } from '../../store/uiSlice';

const ThemeToggle: React.FC = () => {
    const dispatch = useAppDispatch();
    const isDarkMode = useAppSelector((state) => state.ui.darkMode);

    const handleToggle = () => {
        dispatch(setDarkMode(!isDarkMode));
    };

    return (
        <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
            <IconButton
                onClick={handleToggle}
                color="inherit"
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                sx={{
                    color: 'inherit',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                }}
            >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
        </Tooltip>
    );
};

export default ThemeToggle;
