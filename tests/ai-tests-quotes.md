# Quote Processing Test Cases

This document outlines test cases for the quote processing logic in `src/utils/ai-quotes.ts`. Each test case includes the input quote, expected output, and a description of what's being tested.

## Manual Testing Guide

### How to Test
1. Copy the quote from the "Input" section
2. Paste it into the command
3. Compare the response with the expected output
4. Add commentary about the results
5. Update the status field: s (success) or f (failed)

## Test Cases for Manual Testing

### Test Case 1: Famous Quote
- **Input**: "The only way to do great work is to love what you do." - Steve Jobs
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 2: Book Quote
- **Input**: "It is our choices, Harry, that show what we truly are, far more than our abilities." - Albus Dumbledore, Harry Potter and the Chamber of Secrets
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 3: Movie Quote
- **Input**: "Life is like a box of chocolates. You never know what you're gonna get." - Forrest Gump
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 4: Long Quote
- **Input**: "The best way to predict the future is to create it. We are not here to merely survive, but to thrive. And to do so with some passion, some compassion, some humor, and some style." - Maya Angelou
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 5: Quote with Context
- **Input**: "I have a dream that one day this nation will rise up and live out the true meaning of its creed: 'We hold these truths to be self-evident, that all men are created equal.'" - Martin Luther King Jr., I Have a Dream speech
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 6: Technical Quote
- **Input**: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

### Test Case 7: Quote with Multiple Authors
- **Input**: "The only thing we have to fear is fear itself." - Franklin D. Roosevelt, First Inaugural Address
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

### Test Case 9: Quote without Attribution
- **Input**: "Be the change you wish to see in the world."
- **Actual Title**: 
- **Actual Description**: 
- **Commentary**: 
- **Status**: 

## Implementation Notes

1. Title formatting rules:
   - Maximum 60 characters
   - Sentence case (first letter capitalized)
   - No trailing punctuation
   - Focus on the main theme or key phrase

2. Description requirements:
   - Single sentence
   - Maximum 200 characters
   - Clear, direct language
   - Must end with a period
   - Include attribution if available

3. Error handling:
   - Empty inputs should be rejected
   - Missing attribution should be handled gracefully
   - Long quotes should be properly truncated
   - Special characters should be preserved 