import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import { store } from './store';
import { blackjackTheme } from './theme';
import { GameLayout } from './components/layout';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={blackjackTheme}>
        <CssBaseline />
        <Container maxWidth="xl" sx={{ minHeight: '100vh', py: 2 }}>
          <GameLayout />
        </Container>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
