# Thought Processing Test Cases

This document outlines test cases for the thought processing logic in `src/utils/ai-thoughts.ts`. Each test case includes the input thought, expected output, and a description of what's being tested.

## Manual Testing Guide

### How to Test
1. Copy the thought from the "Input" section
2. Paste it into the command
3. Compare the response with the expected output
4. Add commentary about the results
5. Update the status field: s (success) or f (failed)

### Test Results Template
```markdown
### Test Case X: [Name]
- **Input**: [Thought]
- **Expected Output**: [Expected behavior]
- **Commentary**: [Your observations about the results]
- **Status**: [s/f]
```

## Test Cases for Manual Testing

### Test Case 1: Simple Task
- **Input**: I need to buy groceries after work today: milk, eggs, bread, and vegetables for dinner
- **Expected Output**: 
  - Title: "Buy groceries after work"
  - Description: A clear summary of the shopping task and items needed
- **Commentary**: 
- **Status**: [s]

### Test Case 2: Complex Project Idea
- **Input**: Create a mobile app that helps people track their daily water intake, send reminders, and visualize progress over time with charts
- **Expected Output**: 
  - Title: "Water tracking mobile app idea"
  - Description: A concise summary of the app's purpose and key features
- **Commentary**: 
- **Status**: [s]

### Test Case 3: Meeting Notes
- **Input**: Team meeting takeaways: John will handle the frontend, Sarah is working on API documentation, and we need to finish the database migration by Friday
- **Expected Output**: 
  - Title: "Team meeting task assignments"
  - Description: A clear summary of the meeting outcomes and responsibilities
- **Commentary**: 
- **Status**: [s]

### Test Case 4: Long Rambling Thought
- **Input**: I've been thinking about how to improve our workflow and there are several issues we need to address like the slow CI pipeline and the fact that our tests take too long to run and also the deployment process could be more automated but we need to be careful about security
- **Expected Output**: 
  - Title: "Workflow improvement ideas"
  - Description: A focused summary of the workflow concerns and potential improvements
- **Commentary**: 
- **Status**: [s]

### Test Case 5: Short Reminder
- **Input**: Call mom tomorrow
- **Expected Output**: 
  - Title: "Call mom tomorrow"
  - Description: A simple summary of the reminder task
- **Commentary**: 
- **Status**: [s]

### Test Case 6: Multiple Topics
- **Input**: Need to finish the presentation for Monday's client meeting, schedule dentist appointment, and remember to water the plants before leaving for vacation
- **Expected Output**: 
  - Title: "Monday client meeting preparation"
  - Description: A summary of the multiple tasks and their context
- **Commentary**: 
- **Status**: [s]

### Test Case 7: Technical Note
- **Input**: The API rate limiting issue can be fixed by implementing a token bucket algorithm and adding Redis for distributed rate limiting across multiple servers
- **Expected Output**: 
  - Title: "API rate limiting solution"
  - Description: A technical summary of the problem and proposed solution
- **Commentary**: 
- **Status**: [s]

### Test Case 8: Empty or Whitespace
- **Input**: "   "
- **Expected Output**: Should throw "Empty thought provided" error
- **Commentary**: 
- **Status**: [s]

### Test Case 9: Single Word
- **Input**: Important
- **Expected Output**: 
  - Title: "Important"
  - Description: A simple acknowledgment of the single-word input
- **Commentary**: 
- **Status**: [s]

## Implementation Notes

1. Title formatting rules:
   - Maximum 60 characters
   - Sentence case (first letter capitalized)
   - No trailing punctuation
   - Focus on main topic/action

2. Description requirements:
   - Single sentence
   - Maximum 200 characters
   - Clear, direct language
   - Must end with a period
   - Capture main idea and context

3. Error handling:
   - Empty inputs should be rejected
   - Invalid AI responses should throw specific errors
   - Parsing errors should be clearly identified
   - Fallback behavior should be documented 