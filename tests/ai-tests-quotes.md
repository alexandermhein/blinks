# Quote Processing Test Cases

This document outlines test cases for the quote processing logic in `src/utils/ai-quotes.ts`. Each test case includes the input quote, expected output, and a description of what's being tested.

## Manual Testing Guide

### How to Test
1. Copy the quote from the "Input" section
2. Paste it into the command
3. Compare the response with the expected output
4. Add commentary about the results
5. Update the status field: s (success) or f (failed)

### Test Results Template
```markdown
### Test Case X: [Name]
- **Input**: [Quote]
- **Expected Output**: [Expected behavior]
- **Commentary**: [Your observations about the results]
- **Status**: [s/f]
```

## Test Cases for Manual Testing

### Test Case 1: Simple Famous Quote
- **Input**: Be the change you wish to see in the world
- **Expected Output**: Should identify as Mahatma Gandhi with description
- **Commentary**: 
- **Status**: [s]

### Test Case 2: Quote with Extra Spaces
- **Input**: Be    the    change    you    wish    to    see    in    the    world
- **Expected Output**: Should normalize spaces and identify as Mahatma Gandhi
- **Commentary**: 
- **Status**: [s]

### Test Case 3: Quote with Attribution
- **Input**: Be the change you wish to see in the world - Gandhi
- **Expected Output**: Should use full name "Mahatma Gandhi" with description
- **Commentary**: Author's name shown as "Gandhi" instead of full name 
- **Status**: [s]

### Test Case 4: Different Attribution
- **Input**: Be the change you wish to see in the world - John Smith
- **Expected Output**: Should use "John Smith" without description
- **Commentary**: 
- **Status**: [s]

### Test Case 5: Various Attribution Formats
- **Input**: Be the change you wish to see in the world by Gandhi
- **Expected Output**: Should identify as Mahatma Gandhi with description
- **Commentary**: 
- **Status**: [s]

### Test Case 6: Common Abbreviation
- **Input**: I have a dream - MLK
- **Expected Output**: Should expand to "Martin Luther King Jr." with description
- **Commentary**: Shows "MLK" as author and no description
- **Status**: [f]

### Test Case 7: Modern Figure
- **Input**: The only way to do great work is to love what you do - Steve Jobs
- **Expected Output**: Should identify as Steve Jobs with description
- **Commentary**: 
- **Status**: [s]

### Test Case 8: Unknown Quote
- **Input**: This is a completely original quote that no one has ever said before
- **Expected Output**: Should return only formatted quote without author or description
- **Commentary**: 
- **Status**: [s]

### Test Case 9: Multiple Authors
- **Input**: The quick brown fox jumps over the lazy dog - John and Jane Doe
- **Expected Output**: Should preserve multiple authors without description
- **Commentary**: 
- **Status**: [s]

## Implementation Notes

1. All quotes should be properly formatted:
   - Trimmed of whitespace
   - Multiple spaces normalized to single space
   - First letter capitalized
   - Surrounding quotes removed

2. Author names should be:
   - Preserved in their original case
   - Used in their most complete form when AI identifies them
   - Used as provided by user when AI identification differs

3. Descriptions should only be included when:
   - AI can confidently identify the author
   - User attribution matches AI identification
   - The quote is a known quote with historical context 