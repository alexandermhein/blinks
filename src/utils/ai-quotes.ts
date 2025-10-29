import { AI } from "@raycast/api";
import { askWithRetry, safeJSONParse } from "./ai-helper";
import type { AIQuoteResponse, ProcessedQuote } from "./ai-schemas";

export async function processQuote(quote: string): Promise<ProcessedQuote> {
  if (!quote || !quote.trim()) {
    return { formattedQuote: quote.trim() };
  }

  try {
    // Combined prompt - does identification, cleaning, and formatting in one pass
    const prompt = `You are a quote processing assistant. Analyze this quote and extract:
1. The cleaned quote text (remove attribution markers like "—", "by", "-")
2. The author name (if explicitly mentioned or if you can identify it with high confidence)
3. A brief 1-2 sentence context (only if author is identified and known)

Quote: "${quote}"

Rules:
- cleanedQuote: Remove all attribution markers and extra quotes, properly formatted
- author: Return the author name if explicitly mentioned in the quote or if you can confidently identify it, otherwise null
- context: Brief 1-2 sentence historical context or significance ONLY if author is confidently identified, otherwise null

Example:
Input: "Be yourself; everyone else is already taken." — Oscar Wilde
Output: {"cleanedQuote": "Be yourself; everyone else is already taken.", "author": "Oscar Wilde", "context": "A witty observation about authenticity and individuality."}

Respond with ONLY valid JSON (no markdown formatting, no extra text):`;

    // Use proper enum value - Raycast automatically handles fallbacks
    const response = await askWithRetry(prompt, {
      model: AI.Model["Google_Gemini_2.5_Flash"],
      creativity: "low",
    });

    // Safe JSON parsing with fallback
    const parseResult = safeJSONParse<AIQuoteResponse>(response, ["cleanedQuote", "author", "context"], {
      cleanedQuote: quote.trim(),
      author: null,
      context: null,
    });

    if (!parseResult.success || !parseResult.data) {
      return { formattedQuote: quote.trim() };
    }

    const result = parseResult.data;

    // Post-process: format the quote properly
    const formattedQuote = result.cleanedQuote
      .trim()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/^\s*["']|["']\s*$/g, "") // Remove surrounding quotes
      .replace(/^[a-z]/, (letter: string) => letter.toUpperCase()); // Capitalize first letter

    return {
      formattedQuote,
      author: result.author || undefined,
      description: result.context || undefined,
    };
  } catch (error) {
    console.error("Error processing quote:", error);
    return { formattedQuote: quote.trim() };
  }
}
