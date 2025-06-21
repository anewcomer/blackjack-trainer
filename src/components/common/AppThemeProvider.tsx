import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useAppSelector } from '../../store/hooks';
import { selectDarkMode } from '../../store/uiSlice';
import { createBlackjackTheme } from '../../theme';

interface AppThemeProviderProps {
    children: React.ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
    const darkMode = useAppSelector(selectDarkMode);

    // Get the appropriate theme based on dark mode setting
    const theme = createBlackjackTheme(darkMode);

    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    );
};
