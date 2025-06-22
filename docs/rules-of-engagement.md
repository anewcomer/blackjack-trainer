# Rules of Engagement for GitHub Copilot Collaboration

This document outlines our established best practices, preferences, and effective patterns for working with GitHub Copilot in our development workflow. These guidelines have evolved throughout our journey building the Blackjack Trainer application and represent the most successful approaches for AI-assisted development.

## Core Principles

### 1. Context Management is Critical

- **Maintain Comprehensive Documentation**: Keep detailed progress files updated between sessions
- **Structured Context Format**: Organize progress documents with clear sections:
  - Current phase/status
  - Completed work
  - In-progress tasks
  - Next steps
  - Blockers/decisions
  - Key files with descriptions
- **Refresh Context Regularly**: Begin new sessions by reviewing documentation
- **Document Architecture First**: Maintain detailed implementation plans before coding

### 2. Small, Focused Development Units

- **Single Responsibility Principle**: Each file should have one clear purpose
- **Modular Architecture**: Decompose complex systems into focused modules
- **Progressive Implementation**: Build and test incrementally rather than all at once
- **Clear Component Boundaries**: Define interfaces before implementation

### 3. Verification-Driven Development

- **Use AI Tools for Quick Feedback**: Leverage `get_errors` for immediate validation
- **Target Specific Files**: Check individual files rather than full compilation
- **Traditional Verification as Backup**: Use terminal commands for final validation
- **Fix Issues Incrementally**: Address one error type at a time

## Effective GitHub Copilot Patterns

### For Project Planning

1. **Start with Architecture Design**
   - Have Copilot generate detailed implementation plans
   - Review and refine architectural decisions
   - Define clear modules and responsibilities
   - Establish type definitions and interfaces first

2. **Progressive Documentation**
   - Create structured documentation for each phase
   - Update progress documents after completing components
   - Document key decisions and trade-offs
   - Maintain a lessons learned document for universal insights

### For Code Generation

1. **Template-Based Generation**
   - Provide clear examples of your preferred coding style
   - Reference existing patterns when requesting new code
   - Define function signatures and return types before implementation
   - Be explicit about architectural requirements

2. **Incremental Code Building**
   - Generate skeleton structures first, then add details
   - Implement one feature at a time with specific guidance
   - Build utilities before UI components
   - Test core logic before integration

3. **Focused Component Development**
   - Describe component purpose and responsibilities clearly
   - Specify exact props and state requirements
   - Reference existing component patterns
   - Indicate performance considerations (memoization, etc.)

### For Testing

1. **Integration-First Approach**
   - Start with integration tests to verify architecture
   - Move to unit tests for specific functions
   - Provide clear test examples for Copilot to follow
   - Specify test conventions and patterns

2. **Progressive Test Building**
   - Build test infrastructure before implementation
   - Create test helpers and utilities early
   - Define mock strategies and fixtures
   - Implement comprehensive test suites incrementally

### For Debugging

1. **Clear Error Context**
   - Provide full error messages with stack traces
   - Describe the expected vs. actual behavior
   - Reference relevant code sections
   - Specify the steps to reproduce

2. **Systematic Resolution**
   - Address one error type at a time
   - Fix fundamental issues before symptoms
   - Document solutions for recurring problems
   - Use the "get_errors" tool repeatedly after changes

## Communication Preferences

### Effective Prompts

- **Be Specific and Detailed**: Provide comprehensive context in requests
- **Reference Existing Code**: Point to successful patterns
- **Explain Your Reasoning**: Share the "why" behind requirements
- **Set Clear Expectations**: Specify performance, style, or other requirements

### Request Formats

1. **For New Components**:
   ```
   Create a new [ComponentName] component that:
   - Handles [specific functionality]
   - Accepts props: [prop list with types]
   - Uses [specific patterns/hooks]
   - Follows the same style as [reference component]
   ```

2. **For Code Modifications**:
   ```
   Modify the [specific code section] in [file path] to:
   - Fix [specific issue]
   - Improve [specific aspect]
   - Follow [specific pattern]
   - Address [specific feedback]
   ```

3. **For Architecture Decisions**:
   ```
   Help me design an architecture for [feature] that:
   - Follows [specific principles]
   - Integrates with [existing systems]
   - Addresses [specific constraints]
   - Improves [specific aspects]
   ```

### Response Preferences

- **Concise Explanations**: Brief reasoning behind decisions
- **Code-First Responses**: Prioritize working code over lengthy explanations
- **Progressive Enhancement**: Start with working basics, then refine
- **Clear Markers**: Use comments to highlight key decisions or areas needing attention

## Tool Usage Best Practices

### Preferred GitHub Copilot Tools

1. **`get_errors`**: For rapid development feedback
   - Check files after every significant change
   - Target specific files rather than full project
   - Fix errors incrementally by type

2. **`read_file`**: For understanding context
   - Read enough context to understand surrounding code
   - Focus on relevant sections
   - Read interfaces/types before implementation

3. **`insert_edit_into_file`**: For precise code changes
   - Provide clear context markers (// ...existing code...)
   - Make minimal, focused changes
   - Follow existing code style

4. **`replace_string_in_file`**: For targeted changes
   - Include 3-5 lines before/after for context
   - Make precise replacements
   - Preserve whitespace and indentation

5. **`run_in_terminal`**: For verification and builds
   - Use for final verification
   - Run test suites
   - Execute build processes
   - Install dependencies

### Tool Usage Patterns

- **Development Flow**: get_errors → insert_edit_into_file → get_errors
- **Investigation Flow**: read_file → semantic_search → grep_search
- **Verification Flow**: run_in_terminal → get_errors → insert_edit_into_file

**Note**: Always prefer terminal commands over IDE-specific tasks for better compatibility with GitHub Copilot. Terminal commands provide more direct control, visibility, and work consistently across all environments.

## Workspace Organization Preferences

- **Component Structure**: Group by feature, then by function
- **File Naming**: Clear, descriptive names with proper casing
- **Directory Organization**: Logical grouping of related files
- **Code Style**: Consistent formatting across the project
- **Import Order**: External libraries first, then internal modules

## Advanced Collaboration Techniques

### Context Continuity

1. **Session Handoffs**:
   - Update progress documents before ending sessions
   - Document current state and next steps
   - List any pending decisions or issues
   - Summarize recent changes

2. **Progressive Development**:
   - Complete one logical unit before moving to the next
   - Document completion of each phase
   - Create checklists for ongoing work
   - Track dependencies between components

### Challenging Scenarios

1. **Complex Refactoring**:
   - Break changes into smaller, incremental steps
   - Document the overall refactoring plan
   - Verify each step before proceeding
   - Maintain comprehensive test coverage

2. **Architecture Evolution**:
   - Document design decisions and rationale
   - Create migration plans for significant changes
   - Implement changes gradually with verification
   - Update architecture documentation

## Measuring Success

- **Error Reduction**: Fewer compilation and runtime errors
- **Development Velocity**: Faster feature implementation
- **Code Quality**: Improved readability and maintainability
- **Learning Curve**: Reduced time to understand complex systems
- **Documentation Quality**: Comprehensive, up-to-date documentation
- **Test Coverage**: Comprehensive test coverage

## Continuous Improvement

- **Document New Patterns**: Add successful approaches to this guide
- **Learn from Failures**: Document ineffective approaches and alternatives
- **Refine Communication**: Continuously improve prompt specificity and clarity
- **Update Preferences**: Evolve these guidelines as the project and tools grow

By following these rules of engagement, we can maximize the effectiveness of GitHub Copilot in our development workflow while maintaining high standards for code quality, architecture, and documentation.
