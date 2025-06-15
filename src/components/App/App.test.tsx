import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Blackjack Trainer title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Blackjack Trainer/i);
  expect(titleElement).toBeInTheDocument();
});
