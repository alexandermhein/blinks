import { AI } from "@raycast/api";

interface ProcessedBookmark {
  title: string;
  description: string;
}

export async function processBookmark(title: string, url: string): Promise<ProcessedBookmark> {
  console.log("Processing bookmark with title:", title, "and URL:", url);
  
  const prompt = `Generate a concise 1-2 sentence summary of this webpage based on its title and URL. 
- Start directly with the main action or purpose (omit phrases like "This webpage", "The page", "This site")
- Focus on the key information and purpose
- Keep it brief and avoid redundancy

Title: ${title}
URL: ${url}

Summary:`;

  try {
    console.log("Sending prompt to AI:", prompt);
    const summary = await AI.ask(prompt, {
      model: AI.Model["Google_Gemini_2.0_Flash"],
      creativity: "low",
    });
    console.log("AI response for summary:", summary);

    const result = {
      title,
      description: summary.trim(),
    };
    console.log("Final processed bookmark:", result);
    return result;
  } catch (error) {
    console.error("Error in processBookmark:", error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
} 