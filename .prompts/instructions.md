# GitHub Copilot Prompting Guide

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

## Recommended Practices from Current Session

### 1. Use Check Tools Before Building

```
Before checking code changes via the build process, use #get_errors to check files for issues.
```

Use the `get_errors` tool to identify compilation errors, type issues, and other problems before running a build. This saves time by quickly identifying issues that would cause build failures.

### 2. Comprehensive Error Checking

```
Please check all modified files using #get_errors to ensure there are no compilation issues.
```

After making multiple file changes, run error checks on all modified files to ensure everything works together correctly.

### 3. Testing with Query Parameters

For web applications that support URL parameters, test features by constructing specific URLs:

```
Let's test the query parameter support using a URL like: http://localhost:3000/?dealer=AS,KH&player=9D,10C
```

### 4. Create Pull Request Documentation

When implementing complex features, request pull request documentation:

```
Create a pull_request.md file that documents all the changes for this feature, including code snippets, implementation details, and testing instructions.
```

### 5. Using Browser Tools for Testing

```
Use #browser_* tools to test the web application functionality directly within the chat interface.
```

For web applications, utilize browser interaction tools to navigate, click, and verify behavior in real-time.

### 6. Creating Utility Files for New Features

```
Let's create a new utility file for handling the query parameters functionality, which will keep the code organized and maintainable.
```

For new functionality, especially those that may be reused, create dedicated utility files rather than adding code to existing files.

### 7. Reading Files Before Modifying

```
Before modifying [file], let's examine its current structure and implementation to ensure our changes fit properly.
```

Always review existing files before making changes to understand the current implementation and integration points.

### 8. Documentation-First Approach

```
Let's start by documenting this feature in the README.md, then implement the code based on our documentation plan.
```

Define the feature in documentation first to clarify requirements and usage before implementation.

## Finding Help

If you need assistance with specific GitHub Copilot features or encounter issues:

1. Visit the [GitHub Copilot documentation](https://docs.github.com/en/copilot)
2. Check the [GitHub Community Forum](https://github.community/)
3. Explore AI assistance communities like [Stack Overflow](https://stackoverflow.com/) with the "github-copilot" tag
