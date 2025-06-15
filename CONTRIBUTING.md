# Contributing to Blackjack Trainer

Thank you for your interest in contributing to the Blackjack Trainer project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```
   git clone https://github.com/YOUR-USERNAME/blackjack-trainer.git
   cd blackjack-trainer
   ```
3. **Install dependencies**
   ```
   npm install
   ```
4. **Create a feature branch**
   ```
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Start the development server**
   ```
   npm start
   ```
2. **Make your changes**
3. **Run tests**
   ```
   npm test
   ```
4. **Run linting**
   ```
   npm run lint
   ```
5. **Fix any linting issues**
   ```
   npm run lint fix
   ```

## Pull Request Process

1. **Update the README.md** with details of changes if applicable
2. **Update the ARCHITECTURE.md** if you're making architectural changes
3. **Ensure all tests pass** and the code has no linting errors
4. **Create a pull request** with a clear description of the changes

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for component props
- Avoid using `any` type
- Use type guards where appropriate

### React

- Use functional components with hooks
- Keep components focused and small
- Use the Context API for state that needs to be shared across components
- Follow React naming conventions (PascalCase for components, camelCase for functions)

### CSS/Styling

- Use Material-UI for components where possible
- Follow Material Design guidelines for styling
- Use theme variables instead of hardcoded values

## Architecture Guidelines

1. **Component Organization**
   - Each component should be in its own directory with its related files
   - Export components as the default export from their directory

2. **Hook Organization**
   - Custom hooks should be focused on a single concern
   - Follow the naming convention `use[Name]` for all hooks

3. **Game Logic**
   - Keep game logic separate from UI components
   - Use pure functions where possible for game calculations

## Testing

- Write tests for all new features
- Test components using React Testing Library
- Test game logic with Jest

## Documentation

- Add JSDoc comments to functions and components
- Keep the README.md updated with new features
- Document complex logic with inline comments

## Project Structure

Follow the established project structure:

```
src/
├── components/     # React UI components
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── logic/          # Game logic and utilities
│   ├── game/       # Core game mechanics
│   ├── strategy/   # Strategy algorithms
│   └── utils/      # Helper functions
├── themes/         # UI theming
└── index.tsx       # Application entry point
```

Thank you for contributing to the Blackjack Trainer project!
