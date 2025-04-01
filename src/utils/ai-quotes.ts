import { AI } from "@raycast/api";

interface ProcessedQuote {
  formattedQuote: string;
  author?: string;
  description?: string;
}

export async function processQuote(quote: string): Promise<ProcessedQuote> {
  try {
    // First, try to identify the author of the quote
    const identifyPrompt = `You are a quote analysis assistant. Analyze this quote and provide a JSON response with exactly these fields:
- identifiedAuthor: The author of this quote (if you are confident about the attribution), or null if you cannot confidently identify the author
- description: A brief historical context or significance (2-3 sentences) ONLY if you can confidently identify the author

Quote: "${quote}"

Respond with ONLY the JSON object, no markdown formatting or additional text. Example format:
{"identifiedAuthor": "Author Name", "description": "Historical context here"}`;

    const identifyResponse = await AI.ask(identifyPrompt, {
      model: AI.Model["Google_Gemini_2.0_Flash"],
      creativity: "low" // Lower creativity for factual identification
    });
    const identifyJson = JSON.parse(identifyResponse.replace(/```json\n?|\n?```/g, '').trim());

    // Then, check for user attribution in the quote
    const cleanPrompt = `You are a quote cleaning assistant. Analyze this quote and provide a JSON response with exactly these fields:
- cleanedQuote: The quote with any attribution removed (e.g. "by Author", "— Author", "- Author")
- attributedAuthor: The author's name if found in the attribution, or null if no attribution found

Quote: "${quote}"

Respond with ONLY the JSON object, no markdown formatting or additional text. Example format:
{"cleanedQuote": "The cleaned quote without attribution", "attributedAuthor": "Author Name"}`;

    const cleanResponse = await AI.ask(cleanPrompt, {
      model: AI.Model["Google_Gemini_2.0_Flash"],
      creativity: "none" // No creativity needed for cleaning
    });
    const cleanJson = JSON.parse(cleanResponse.replace(/```json\n?|\n?```/g, '').trim());
    
    // Format the cleaned quote
    const formattedQuote = cleanJson.cleanedQuote
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/^\s*["']|["']\s*$/g, '') // Remove surrounding quotes
      .replace(/^[a-z]/, (letter: string) => letter.toUpperCase()); // Capitalize first letter

    // Handle the different cases based on user attribution and AI identification
    if (cleanJson.attributedAuthor) {
      // User has attributed an author - check if it matches the identified author
      const comparePrompt = `You are an author name comparison assistant. Compare these two names and determine if they refer to the same person.
Provide a JSON response with exactly this field:
- isSamePerson: true if the names refer to the same person (e.g. "Mahatma Gandhi" and "Gandhi" are the same person), false otherwise

Name 1: "${cleanJson.attributedAuthor}"
Name 2: "${identifyJson.identifiedAuthor || ''}"

Respond with ONLY the JSON object, no markdown formatting or additional text. Example format:
{"isSamePerson": true}`;

      const compareResponse = await AI.ask(comparePrompt, {
        model: AI.Model["Google_Gemini_2.0_Flash"],
        creativity: "none" // No creativity needed for name comparison
      });
      const compareJson = JSON.parse(compareResponse.replace(/```json\n?|\n?```/g, '').trim());

      if (compareJson.isSamePerson) {
        // Names refer to the same person - use AI-identified name and include context
        return {
          formattedQuote,
          author: identifyJson.identifiedAuthor,
          description: identifyJson.description || undefined,
        };
      } else {
        // Names don't match - use user's attribution without context
        return {
          formattedQuote,
          author: cleanJson.attributedAuthor,
        };
      }
    } else {
      // No user attribution - use AI identification if available
      return {
        formattedQuote,
        author: identifyJson.identifiedAuthor || undefined,
        description: identifyJson.identifiedAuthor ? (identifyJson.description || undefined) : undefined,
      };
    }
  } catch (error) {
    return {
      formattedQuote: quote.trim(),
    };
  }
} 