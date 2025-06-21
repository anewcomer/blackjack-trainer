import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Blackjack Trainer app', () => {
  render(<App />);

  // Check for main app title
  const titleElement = screen.getByText(/blackjack trainer/i);
  expect(titleElement).toBeInTheDocument();

  // Check for theme toggle button
  const themeToggle = screen.getByLabelText(/switch to dark mode/i);
  expect(themeToggle).toBeInTheDocument();

  // Check for strategy guide button
  const strategyGuide = screen.getByLabelText(/strategy guide/i);
  expect(strategyGuide).toBeInTheDocument();
});
