import { AI } from "@raycast/api";

interface ProcessedThought {
  title: string;
  description: string;
}

export async function processThought(thought: string): Promise<ProcessedThought> {
  if (!thought || !thought.trim()) {
    throw new Error("Empty thought provided");
  }

  try {
    // First, analyze the thought to create a concise title
    const titlePrompt = `You are a thought analysis assistant. Your task is to create a concise, descriptive title (max 60 characters) that captures the essence of the thought.

Rules for the title:
1. Must be 60 characters or less
2. Use sentence casing (except for proper nouns, abbreviations, etc.)
3. Remove unnecessary words
4. Focus on the main point

Thought: "${thought}"

Respond with ONLY the JSON object, no markdown formatting or additional text. Example format:
{"title": "Concise title here"}`;

    const titleResponse = await AI.ask(titlePrompt, {
      model: AI.Model["Google_Gemini_2.0_Flash"],
      creativity: "low" // Lower creativity for factual analysis
    });
    
    let titleJson;
    try {
      titleJson = JSON.parse(titleResponse.replace(/```json\n?|\n?```/g, '').trim());
      if (!titleJson.title) {
        throw new Error("Invalid title response format");
      }
    } catch (parseError) {
      throw new Error("Failed to parse AI title response");
    }

    // Then, create a summary
    const summaryPrompt = `You are a thought summarization assistant. Your task is to create a clear summary of the thought.

Rules for the summary:
1. Should capture the main idea and context
2. Use clear, direct language. Don't mention the user in third person (e.g. "The user needs to ...").
3. Use sentence casing (except for proper nouns, abbreviations, etc.)

Thought: "${thought}"

Respond with ONLY the JSON object, no markdown formatting or additional text. Example format:
{"summary": "This is a summary of the main idea."}`;

    const summaryResponse = await AI.ask(summaryPrompt, {
      model: AI.Model["Google_Gemini_2.0_Flash"],
      creativity: "low" // Lower creativity for factual summary
    });
    
    let summaryJson;
    try {
      summaryJson = JSON.parse(summaryResponse.replace(/```json\n?|\n?```/g, '').trim());
      if (!summaryJson.summary) {
        throw new Error("Invalid summary response format");
      }
    } catch (parseError) {
      throw new Error("Failed to parse AI summary response");
    }

    return {
      title: titleJson.title,
      description: summaryJson.summary
    };
  } catch (error) {
    throw new Error(`Failed to process thought: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 