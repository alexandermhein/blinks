import { AI } from "@raycast/api";
import { askWithRetry, safeJSONParse } from "./ai-helper";
import type { AIThoughtResponse, ProcessedThought } from "./ai-schemas";

export async function processThought(
	thought: string,
): Promise<ProcessedThought> {
	if (!thought || !thought.trim()) {
		throw new Error("No thought provided");
	}

	try {
		const prompt = `You are a thought processing assistant. Analyze this thought and create both a concise title and detailed description.

RULES:
- Title: Max 60 characters, focus on main point, use sentence case (capitalize first word only)
- Description: Expand on the main idea and provide context, use direct language, avoid third-person references

EXAMPLES:

Input: "I need to remember to follow up with the team about the project deadline"
Output: {"title": "Follow up with team about project deadline", "description": "Need to discuss project deadlines and coordinate with the team to ensure we meet our goals."}

Input: "Should consider using a different approach for the UI"
Output: {"title": "Reconsider UI approach", "description": "Evaluating alternative UI implementations that may improve user experience or development efficiency."}

Input: "The new feature request has some interesting implications"
Output: {"title": "New feature request implications", "description": "Analyzing the potential impact and interesting aspects of the new feature request."}

Thought: "${thought}"

Respond with ONLY valid JSON (no markdown formatting, no extra text):
{"title": "...", "description": "..."}`;

		// Use proper enum value - Raycast automatically handles fallbacks
		const response = await askWithRetry(prompt, {
			model: AI.Model["Google_Gemini_2.5_Flash"],
			creativity: "low",
		});

		// Parse with validation
		const parseResult = safeJSONParse<{ title: string; description: string }>(
			response,
			["title", "description"],
			{
				title: thought.trim().substring(0, 60),
				description: thought.trim(),
			},
		);

		if (!parseResult.success || !parseResult.data) {
			throw new Error("Failed to parse AI response");
		}

		const result = parseResult.data;

		return {
			title: result.title.substring(0, 60), // Hard cap at 60 characters
			description: result.description,
		};
	} catch (error) {
		throw new Error(
			`Failed to process thought: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
