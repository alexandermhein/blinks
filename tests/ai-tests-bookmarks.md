# Bookmark Processing Test Cases

This document outlines test cases for the bookmark processing logic in `src/utils/ai-bookmarks.ts`. Each test case includes the input bookmark, expected output, and a description of what's being tested.

## Manual Testing Guide

### How to Test
1. Copy the bookmark from the "Input" section
2. Paste it into the command
3. Compare the response with the expected output
4. Add commentary about the results
5. Update the status field: s (success) or f (failed)

## Test Cases for Manual Testing

### Test Case 1: Article URL
- **Input**: https://www.example.com/article/understanding-ai-and-machine-learning
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 2: Video URL
- **Input**: https://www.youtube.com/watch?v=dQw4w9WgXcQ
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 3: PDF Document
- **Input**: https://example.com/papers/2024-research-paper.pdf
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 4: GitHub Repository
- **Input**: https://github.com/username/project-name
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 5: Social Media Post
- **Input**: https://twitter.com/username/status/1234567890
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 6: Product Page
- **Input**: https://www.amazon.com/product-name/dp/1234567890
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 7: Invalid URL
- **Input**: not-a-valid-url
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 8: Empty or Whitespace
- **Input**: "   "
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 9: URL with Query Parameters
- **Input**: https://www.example.com/search?q=test&lang=en&sort=date
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

## Implementation Notes

1. Title formatting rules:
   - Maximum 60 characters
   - Sentence case (first letter capitalized)
   - No trailing punctuation
   - Focus on the main content type or purpose

2. Description requirements:
   - Single sentence
   - Maximum 200 characters
   - Clear, direct language
   - Must end with a period
   - Include content type and key information

3. Error handling:
   - Empty inputs should be rejected
   - Invalid URLs should be clearly identified
   - Failed metadata fetching should be handled gracefully
   - Timeout handling for slow responses 