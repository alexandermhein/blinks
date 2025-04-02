import { AI } from "@raycast/api";

interface ProcessedBookmark {
  title: string;
  description: string;
}

export async function processBookmark(url: string, sourceUrl: string): Promise<ProcessedBookmark> {
  const prompt = `Generate a concise 1-2 sentence summary of this webpage based on its URL. 
- Start directly with the main action or purpose (omit phrases like "This webpage", "The page", "This site")
- Focus on the key information and purpose
- Keep it brief and avoid redundancy

URL: ${url}

Summary:`;

  try {
    const summary = await AI.ask(prompt, {
      model: AI.Model["Google_Gemini_2.0_Flash"],
      creativity: "low",
    });

    // Extract a clean title from the URL
    let title = url;
    try {
      const urlObj = new URL(url);
      title = urlObj.hostname;
    } catch {
      // If URL parsing fails, use the original URL
    }

    return {
      title,
      description: summary.trim(),
    };
  } catch (error) {
    throw new Error(`Failed to create summary: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
} 