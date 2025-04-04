import { AI } from "@raycast/api";

interface ProcessedReminder {
  title: string;
  description: string;
}

export async function processReminder(reminder: string): Promise<ProcessedReminder> {
  if (!reminder || !reminder.trim()) {
    throw new Error("Empty reminder provided");
  }

  // Handle single-word inputs
  const trimmedReminder = reminder.trim();
  if (!trimmedReminder.includes(" ")) {
    return {
      title: trimmedReminder.charAt(0).toUpperCase() + trimmedReminder.slice(1),
      description: ""
    };
  }

  try {
    // First, analyze the reminder to create a concise action-oriented title
    const titlePrompt = `You are a reminder analysis assistant. Your task is to create a concise, action-oriented title that captures the core action of the reminder.

Rules for the title:
1. Must be 40 characters or less
2. Start with a verb (e.g. "Call", "Submit", "Buy", "Review")
3. Use sentence casing (except for proper nouns, abbreviations, etc.)
4. Remove unnecessary words, focus ONLY on the core action
5. Mention timing, location, and other contextual details in description, if available
6. Keep it simple and direct. NEVER mention the user and avoid any third-person reference

Reminder: "${reminder}"

Respond with ONLY the JSON object, no markdown formatting or additional text. Example format:
{"title": "Action-oriented title here"}`;

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

    // Then, create a detailed description
    const descriptionPrompt = `You are a reminder summarization assistant. Your task is to create a clear description that focuses on the contextual details of the reminder.

Rules for the description:
1. Focus ONLY on contextual details like timing, location, conditions, or requirements
2. Do NOT repeat the core action from the title. Descriptions are optional, if you can't add any details, return an empty string
3. Use clear, direct language, keep it concise but informative
4. If there are no contextual details or your description would repeat the core action, return an empty string
5. Keep it simple and direct. NEVER mention the user and avoid any third-person reference
6. Write details directly (e.g. "At 2pm tomorrow" not "The user should do this at 2pm tomorrow")

Reminder: "${reminder}"

Respond with ONLY the JSON object, no markdown formatting or additional text. Example format:
{"description": "Contextual details here"}`;

    const descriptionResponse = await AI.ask(descriptionPrompt, {
      model: AI.Model["Google_Gemini_2.0_Flash"],
      creativity: "low" // Lower creativity for factual summary
    });
    
    let descriptionJson;
    try {
      descriptionJson = JSON.parse(descriptionResponse.replace(/```json\n?|\n?```/g, '').trim());
      if (!descriptionJson.description) {
        throw new Error("Invalid description response format");
      }
    } catch (parseError) {
      throw new Error("Failed to parse AI description response");
    }

    return {
      title: titleJson.title,
      description: descriptionJson.description
    };
  } catch (error) {
    throw new Error(`Failed to process reminder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 