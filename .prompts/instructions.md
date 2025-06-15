# GitHub Copilot Prompting Guide

## Overview

This guide provides best practices for working with GitHub Copilot in the Blackjack Trainer project.

## General Purpose Prompting Instructions

### 1. Be Specific and Clear

- Provide detailed context about what you're trying to accomplish
- Specify the programming language or framework you're working with
- Mention any constraints or preferences (e.g., performance requirements, coding style)
- Use explicit, unambiguous language

### 2. Break Down Complex Problems

- Split complex requests into smaller, manageable parts
- Start with high-level design before implementation details
- Ask for explanations of concepts before asking for code

### 3. Provide Relevant Context

- Share code snippets related to your question
- Mention the file structure or project architecture when applicable
- Reference specific files or functions that are involved
- Describe any error messages you're encountering

### 4. Use Iterative Refinement

- Start with a basic request and then refine it based on the response
- Use "Continue" to ask for additional details or modifications
- Ask for improvements or optimizations after getting a working solution

### 5. Request Explanations

- Ask Copilot to explain its reasoning or approach
- Request comments in the generated code to understand key parts
- Ask for alternatives if you're not satisfied with the initial solution

### 6. Be Mindful of the Format

- Use code blocks for code examples using triple backticks (```)
- Format your prompt with section headers, bullet points, or numbered lists
- Use proper technical terminology to avoid ambiguity

### 7. Reference Documentation

- Ask for relevant documentation or resources when learning new concepts
- Request examples from documentation to understand standard patterns

## Project-Specific Best Practices

### Code Quality and Testing

#### Error Checking
```
Before checking code changes via the build process, use #get_errors to check files for issues.
```
- Use the `get_errors` tool to identify compilation errors, type issues, and other problems before running a build
- After making multiple file changes, run error checks on all modified files

#### Testing Approaches
```
Let's test the query parameter support using a URL like: http://localhost:3000/?dealer=AS,KH&player=9D,10C
```
- For web applications, test features by constructing specific URLs with query parameters
- Utilize browser interaction tools to navigate, click, and verify behavior in real-time

### Code Organization

#### Creating Utility Files
```
Let's create a new utility file for handling the query parameters functionality.
```
- For new functionality, create dedicated utility files rather than adding code to existing files
- Always review existing files before making changes to understand the current implementation

#### Documentation
```
Let's start by documenting this feature in the README.md, then implement the code.
```
- Define features in documentation first to clarify requirements and usage
- When implementing complex features, create pull request documentation with code snippets and testing instructions

### Project Management

#### Tracking Progress
```
Update the notes.md document with relevant status so future Copilot sessions may pick up the context.
```
- When a new feature is requested, add it to the project plan in notes.md
- After significant progress on any feature, update notes.md with current status
- Create comprehensive pull request documentation for each completed feature

## Project Commands and Shortcuts

### VS Code Tasks
- `Run build` - Builds the application using npm run build
- `Run lint` - Runs ESLint on the project
- `Run tests once` - Executes tests without watch mode

### Common Testing Commands
```bash
# Run tests in watch mode
npm test

# Run tests without watch mode (one-time execution)
npm test -- --watchAll=false

# Run tests with coverage report
npm test -- --coverage

# Run specific test file or pattern
npm test -- ComponentName
```

## Finding Help

If you need assistance with GitHub Copilot or project-specific issues:

| Resource | Description |
|----------|-------------|
| [GitHub Copilot Documentation](https://docs.github.com/en/copilot) | Official documentation and guides |
| [GitHub Community Forum](https://github.community/) | Community support for GitHub products |
| [Stack Overflow](https://stackoverflow.com/questions/tagged/github-copilot) | Questions tagged with "github-copilot" |
| Project README.md | Application-specific documentation |
| Project ARCHITECTURE.md | Details about the project structure |

## Conclusion

Following these prompting guidelines will help maximize the effectiveness of GitHub Copilot for the Blackjack Trainer project. Remember to keep notes updated with progress and maintain consistent code quality through regular testing and documentation.
