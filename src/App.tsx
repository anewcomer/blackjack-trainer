import React from 'react';
import { Provider } from 'react-redux';
import { CssBaseline, Container } from '@mui/material';
import { store } from './store';
import { AppThemeProvider } from './components/common';
import { GameLayout } from './components/layout';

function App() {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <CssBaseline />
        <Container maxWidth="xl" sx={{ minHeight: '100vh', py: 2 }}>
          <GameLayout />
        </Container>
      </AppThemeProvider>
    </Provider>
  );
}

export default App;
