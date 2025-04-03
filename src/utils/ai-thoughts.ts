import { AI } from "@raycast/api";

interface ProcessedThought {
  title: string;
  description: string;
}

function cleanInput(thought: string): string {
  return thought.trim();
}

function validateInput(thought: string): void {
  if (!thought) {
    throw new Error("Blink empty");
  }
  if (thought.length > 1000) {
    throw new Error("Thought too long");
  }
}

export async function processThought(thought: string): Promise<ProcessedThought> {
  try {
    const cleanedThought = cleanInput(thought);
    validateInput(cleanedThought);

    // First, analyze the thought to create a concise title
    const titlePrompt = `You are a thought analysis assistant. Create a concise title (max 60 characters) that captures the main action or topic.

Rules:
1. Max 60 characters
2. No trailing punctuation
3. Focus on main action/topic
4. No first-person perspective
5. No articles (a, an, the) unless grammatically required
6. For tasks, start with a verb
7. For ideas/concepts, use noun phrases

Examples:
Input: "I need to buy groceries after work today"
Title: "Buy groceries after work"

Input: "Create a mobile app for water intake tracking"
Title: "Build water intake tracking mobile app"

Thought: "${cleanedThought}"

Respond with ONLY the JSON object, no markdown or additional text:
{"title": "Concise title here"}`;

    const titleResponse = await AI.ask(titlePrompt, {
      model: AI.Model["Google_Gemini_2.0_Flash"],
      creativity: "low"
    });
    
    let titleJson;
    try {
      titleJson = JSON.parse(titleResponse.replace(/```json\n?|\n?```/g, '').trim());
      if (!titleJson.title) {
        throw new Error("Invalid title response format");
      }
    } catch (parseError) {
      throw new Error("Failed to generate title");
    }

    // Then, create a summary
    const summaryPrompt = `You are a thought summarization assistant. Create a valuable description that adds context or details not captured in the title.

Rules:
1. Max 200 characters
2. Must end with a period
3. For simple thoughts or self-explanatory titles, ALWAYS return an empty string ("")
4. No first-person perspective
5. For tasks: focus on context, timing, or dependencies
6. For ideas: focus on key details or implications
7. No redundant phrases like "This is about..." or "The task is to..."

Examples of simple tasks that need empty descriptions:
Input: "Call mom tomorrow"
Title: "Call mom tomorrow"
Description: ""

Examples of thoughts that need descriptions:
Input: "Create a mobile app for water intake tracking that includes daily reminders, progress charts, and goal setting features."
Title: "Build water intake tracking mobile app"
Description: "Include daily reminders, progress charts, and goal setting features."

Input: "Team meeting tomorrow at 2pm to discuss project updates with everyone"
Title: "Team meeting tomorrow"
Description: "Meeting scheduled for 2pm to discuss project updates."

Thought: "${cleanedThought}"
Title: "${titleJson.title}"

IMPORTANT: Respond with ONLY a valid JSON object containing a "summary" field. The summary must be a string.
Example valid responses:
{"summary": ""}
{"summary": "Include daily reminders and progress charts."}`;

    const summaryResponse = await AI.ask(summaryPrompt, {
      model: AI.Model["Google_Gemini_2.0_Flash"],
      creativity: "low"
    });
    
    let summaryJson;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = summaryResponse
        .replace(/```json\n?|\n?```/g, '') // Remove markdown code blocks
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces
      
      summaryJson = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (typeof summaryJson !== 'object' || summaryJson === null) {
        throw new Error("Invalid JSON structure");
      }
      if (!('summary' in summaryJson)) {
        throw new Error("Missing summary field");
      }
      if (typeof summaryJson.summary !== 'string') {
        throw new Error("Summary must be a string");
      }
    } catch (parseError) {
      console.error('Summary parsing error:', parseError);
      throw new Error("Failed to generate description");
    }

    return {
      title: titleJson.title,
      description: summaryJson.summary
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Add text to capture: ${error.message}`);
    }
    throw new Error("Add text to capture: Unknown error");
  }
} 