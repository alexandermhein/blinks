# Bookmark Processing Test Cases

This document outlines test cases for the bookmark processing logic in `src/utils/ai-bookmarks.ts`. Each test case includes the input URL, expected output, and a description of what's being tested.

## Manual Testing Guide

### How to Test
1. Copy the URL from the "Input" section
2. Paste it into the command
3. Compare the response with the expected output
4. Add commentary about the results
5. Update the status field: s (success) or f (failed)

### Test Results Template
```markdown
### Test Case X: [Name]
- **Input**: [URL]
- **Expected Output**: [Expected behavior]
- **Commentary**: [Your observations about the results]
- **Status**: [s/f]
```

## Test Cases for Manual Testing

### Test Case 1: Simple Article URL
- **Input**: https://www.example.com/article/understanding-typescript
- **Expected Output**: 
  - Title: "Understanding TypeScript"
  - Description: "Article about TypeScript fundamentals and best practices"
  - URL: "https://www.example.com/article/understanding-typescript"
- **Commentary**: Tests basic URL parsing and title extraction
- **Status**: [s]

### Test Case 2: GitHub Repository
- **Input**: https://github.com/alexandermhein/blinks
- **Expected Output**: 
  - Title: "alexandermhein/blinks"
  - Description: "GitHub repository"
  - URL: "https://github.com/alexandermhein/blinks"
- **Commentary**: Capture title inaccurate: "alexandermhein/blinks: A fast, robust, and accurate binning algorithm for single-molecule localization microscopy"
- **Status**: [f]

### Test Case 3: URL with Query Parameters
- **Input**: https://www.example.com/search?q=typescript&lang=en&sort=date
- **Expected Output**: 
  - Title: "TypeScript Search Results"
  - Description: "Search results for TypeScript in English, sorted by date"
  - URL: "https://www.example.com/search?q=typescript&lang=en&sort=date"
- **Commentary**: Tests URL with query parameters
- **Status**: [s]

### Test Case 4: Empty or Invalid URL
- **Input**: "   "
- **Expected Output**: Should throw "Empty or invalid URL provided" error
- **Commentary**: Tests input validation
- **Status**: [shttps://github.com/alexandermhein/blinks b/]

### Test Case 5: URL with Hash Fragment
- **Input**: https://www.example.com/docs#installation
- **Expected Output**: 
  - Title: "Documentation - Installation"
  - Description: "Installation guide from documentation"
  - URL: "https://www.example.com/docs#installation"
- **Commentary**: Tests URL with hash fragment
- **Status**: [s]

### Test Case 6: URL with Special Characters
- **Input**: https://www.example.com/path/with/special/chars/!@#$%^&*
- **Expected Output**: 
  - Title: "Special Characters Page"
  - Description: "Page with special characters in URL"
  - URL: "https://www.example.com/path/with/special/chars/!@#$%^&*"
- **Commentary**: Tests URL with special characters
- **Status**: [s]

### Test Case 7: URL with Subdomain
- **Input**: https://docs.example.com/api/v1/reference
- **Expected Output**: 
  - Title: "API Reference Documentation"
  - Description: "API reference documentation for version 1"
  - URL: "https://docs.example.com/api/v1/reference"
- **Commentary**: Tests URL with subdomain
- **Status**: [s]

### Test Case 8: URL with Port Number
- **Input**: https://www.example.com:8080/api/status
- **Expected Output**: 
  - Title: "API Status"
  - Description: "API status endpoint"
  - URL: "https://www.example.com:8080/api/status"
- **Commentary**: Tests URL with port number
- **Status**: [s]

### Test Case 9: URL with Authentication
- **Input**: https://username:password@www.example.com/secure
- **Expected Output**: 
  - Title: "Secure Page"
  - Description: "Secure page requiring authentication"
  - URL: "https://www.example.com/secure"
- **Commentary**: Tests URL with authentication (should strip credentials)
- **Status**: [s]

### Test Case 10: URL with International Characters
- **Input**: https://www.example.com/über/größer/besser
- **Expected Output**: 
  - Title: "Über Größer Besser"
  - Description: "Page with international characters"
  - URL: "https://www.example.com/über/größer/besser"
- **Commentary**: Tests URL with international characters
- **Status**: [s]

## Implementation Notes

1. URL formatting rules:
   - Must be a valid URL format
   - Remove authentication credentials if present
   - Preserve query parameters and hash fragments
   - Handle special and international characters

2. Title requirements:
   - Maximum 60 characters
   - Sentence case (first letter capitalized)
   - No trailing punctuation
   - Focus on main topic/action
   - Use page title if available, otherwise generate from URL

3. Description requirements:
   - Single sentence
   - Maximum 200 characters
   - Clear, direct language
   - Must end with a period
   - Capture main idea and context

4. Error handling:
   - Empty or invalid URLs should be rejected
   - Invalid AI responses should throw specific errors
   - Parsing errors should be clearly identified
   - Fallback behavior should be documented 