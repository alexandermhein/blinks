import { AI } from "@raycast/api";
import { askWithRetry } from "./ai-helper";
import type { ProcessedBookmark } from "./ai-schemas";

export async function processBookmark(title: string, url: string): Promise<ProcessedBookmark> {
  const prompt = `Generate a concise 1-2 sentence summary of this webpage based on its title and URL.
- Start directly with the main action or purpose (omit phrases like "This page", "The site", "This webpage")
- Focus on the key information and purpose
- Be direct and brief

Title: "${title}"
URL: ${url}

Respond with ONLY the summary text (no JSON, no extra formatting, no quotation marks):`;

  try {
    let summary = "";
    try {
      summary = await askWithRetry(
        prompt,
        {
          model: "Google_Gemini_2.5_Flash" as unknown as AI.Model,
          creativity: "low",
        },
        2,
      );
    } catch {
      // Fallback to 2.0 Flash if 2.5 isn't available
      summary = await askWithRetry(
        prompt,
        {
          model: AI.Model["Google_Gemini_2.0_Flash"],
          creativity: "low",
        },
        2,
      );
    }

    return {
      title,
      description: summary.trim(),
    };
  } catch (error) {
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
