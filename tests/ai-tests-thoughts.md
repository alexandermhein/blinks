This document outlines test cases for the thought processing logic in `src/utils/ai-thoughts.ts`. Each test case includes the input thought, expected output, and a description of what’s being tested.

### How to Test

1. Copy the thought from the “Input” section
2. Paste it into the command
3. Compare the response with the expected output
4. Add commentary about the results
5. Update the status field: s (success), r (success but needs refinement) or f (failed)

---

### Test Case 1: Simple Task

- **Input**: I need to buy groceries after work today: milk, eggs, bread, and vegetables for dinner
- **Actual Title**: Grocery shopping list for dinner tonight
- **Actual Description**: The grocery list for after work includes milk, eggs, bread, and vegetables for dinner.
- **Commentary**: Don’t need to repeat “The grocery list for after work“ in the description. Better would have been “Buy milk, eggs, bread, and vegetables”
- **Status**: r

### Test Case 2: Complex Project Idea

- **Input**: Create a mobile app that helps people track their daily water intake, send reminders, and visualize progress over time with charts
- **Actual Title**: Mobile app for tracking daily water intake
- **Actual Description**: Develop a mobile app to monitor daily water consumption, offering reminders and progress visualization through charts.
- **Commentary**:
- **Status**: s

### Test Case 3: Meeting Notes

- **Input**: Team meeting takeaways: John will handle the frontend, Sarah is working on API documentation, and we need to finish the database migration by Friday
- **Actual Title**: Meeting takeaways: Frontend, API docs, database migration
- **Actual Description**: The team meeting assigned John to the frontend, Sarah to API documentation, and set a Friday deadline for database migration completion.
- **Commentary**:
- **Status**: s

### Test Case 4: Long Rambling Thought

- **Input**: I’ve been thinking about how to improve our workflow and there are several issues we need to address like the slow CI pipeline and the fact that our tests take too long to run and also the deployment process could be more automated but we need to be careful about security
- **Actual Title**: Improve workflow: slow CI, long tests, deployment automation
- **Actual Description**: Several workflow improvements are needed, including a faster CI pipeline, quicker test execution, and a more automated deployment process with careful attention to security.
- **Commentary**:
- **Status**: s

### Test Case 5: Short Reminder

- **Input**: Call mom tomorrow
- **Actual Title**: Call mom tomorrow
- **Actual Description**: Remember to call mom tomorrow.
- **Commentary**: Description is redundant. AI needs to get better at understanding that descriptions are optional and are only to be added if it adding valuable information that can’t be derived from the the title alone.
- **Status**: r

### Test Case 6: Multiple Topics

- **Input**: Need to finish the presentation for Monday’s client meeting, schedule dentist appointment, and remember to water the plants before leaving for vacation
- **Actual Title**: Presentation, dentist, and plants before vacation
- **Actual Description**: I need to complete the client presentation for Monday, schedule a dentist appointment, and water the plants prior to vacation
- **Commentary**:
- **Status**: s

### Test Case 7: Technical Note

- **Input**: The API rate limiting issue can be fixed by implementing a token bucket algorithm and adding Redis for distributed rate limiting across multiple servers
- **Actual Title**: Fix API rate limiting with token bucket and Redis
- **Actual Description**: The API rate limiting issue can be resolved by implementing a token bucket algorithm, using Redis for distributed rate limiting across multiple servers.
- **Commentary**:
- **Status**: s

### Test Case 8: Empty or Whitespace

- **Input**: ” ”
- **Actual Title**:
- **Actual Description**:
- **Commentary**: Returned “Processing error thought: Empty thought provided” but this should be phrased: “Blink empty” “Add text to capture”
- **Status**: r

### Test Case 9: Single Word

- **Input**: Important
- **Actual Title**: Important
- **Actual Description**: Indicates the importance or significance of something.
- **Commentary**:
- **Status**: s

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