# AI Reminder Processing Tests

This document contains test cases for the reminder processing functionality. Each test case includes input, expected output, and status.

## Test Cases

### Test Case 1: Simple Action Reminder
- **Input**: Call mom tomorrow at 2pm
- **Expected Output**: 
  - Title: "Call mom"
  - Description: "Tomorrow at 2pm"
- **Commentary**: Tests basic action extraction and time context
- **Status**: [s]

### Test Case 2: Location-Based Reminder
- **Input**: Pick up dry cleaning when I get to downtown
- **Expected Output**: 
  - Title: "Pick up dry cleaning"
  - Description: "When arriving in downtown"
- **Commentary**: Tests location-based context extraction
- **Status**: [s]

### Test Case 3: Complex Action with Multiple Contexts
- **Input**: Review the quarterly report before the team meeting tomorrow morning at 10am
- **Expected Output**: 
  - Title: "Review quarterly report"
  - Description: "Before team meeting tomorrow at 10am"
- **Commentary**: Tests complex action with multiple contextual elements
- **Status**: [s]

### Test Case 4: Empty or Whitespace
- **Input**: "   "
- **Expected Output**: Should throw "Empty reminder provided" error
- **Commentary**: Tests input validation
- **Status**: [s]

### Test Case 5: Single Action Word
- **Input**: Call
- **Expected Output**: 
  - Title: "Call"
  - Description: ""
- **Commentary**: Tests handling of minimal input
- **Status**: [s]

### Test Case 6: Reminder with Source
- **Input**: Submit the project proposal from the email by Friday 5pm
- **Expected Output**: 
  - Title: "Submit project proposal"
  - Description: "From email by Friday 5pm"
- **Commentary**: Tests source and deadline context extraction
- **Status**: [s]

### Test Case 7: Recurring Reminder
- **Input**: Water the plants every Monday morning
- **Expected Output**: 
  - Title: "Water plants"
  - Description: "Every Monday morning"
- **Commentary**: Tests recurring schedule context
- **Status**: [s]

### Test Case 8: Conditional Reminder
- **Input**: Buy groceries if we're running low on milk
- **Expected Output**: 
  - Title: "Buy groceries"
  - Description: "If running low on milk"
- **Commentary**: Tests conditional context extraction
- **Status**: [s]

## Implementation Notes

1. Title formatting rules:
   - Maximum 40 characters
   - Must start with a verb
   - Use sentence casing (except for proper nouns, abbreviations, etc.)
   - Focus ONLY on the core action
   - Remove timing, location, and other contextual details

2. Description requirements:
   - Focus ONLY on contextual details (timing, location, conditions)
   - Do NOT repeat the core action from the title
   - Use clear, direct language
   - Use sentence casing (except for proper nouns, abbreviations, etc.)
   - Keep it concise but informative

3. Error handling:
   - Empty or whitespace-only input should throw "Empty reminder provided" error
   - Invalid AI responses should throw appropriate error messages
   - JSON parsing errors should be caught and reported 