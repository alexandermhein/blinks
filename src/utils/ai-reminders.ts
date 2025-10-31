import { AI } from "@raycast/api";
import { askWithRetry, safeJSONParse } from "./ai-helper";
import type { AIReminderResponse, ProcessedReminder } from "./ai-schemas";

export async function processReminder(
	reminder: string,
): Promise<ProcessedReminder> {
	if (!reminder || !reminder.trim()) {
		throw new Error("Empty reminder provided");
	}

	// Handle single-word inputs
	const trimmedReminder = reminder.trim();
	if (!trimmedReminder.includes(" ")) {
		return {
			title: trimmedReminder.charAt(0).toUpperCase() + trimmedReminder.slice(1),
			description: "",
		};
	}

	try {
		const prompt = `You are a reminder processing assistant. Extract the action and context from this reminder.

RULES:
- Title: Action-oriented, max 40 chars, start with verb, use sentence case
- Description: Context only (timing, location, conditions), NOT the action itself

EXAMPLES:

Input: "Remind me to pick up dry cleaning when I get to downtown"
Output: {"title": "Pick up dry cleaning", "description": "When arriving downtown"}

Input: "Need to call mom tomorrow at 2pm to discuss the family reunion"
Output: {"title": "Call mom", "description": "Discuss family reunion tomorrow at 2pm"}

Input: "Remember to buy groceries"
Output: {"title": "Buy groceries", "description": ""}

Input: "Send the report to the client by Friday"
Output: {"title": "Send report to client", "description": "By Friday"}

Reminder: "${reminder}"

Respond with ONLY valid JSON (no markdown formatting, no extra text):
{"title": "...", "description": "..."}`;

		// Use proper enum value - Raycast automatically handles fallbacks
		const response = await askWithRetry(prompt, {
			model: AI.Model["Google_Gemini_2.5_Flash"],
			creativity: "low",
		});

		const parseResult = safeJSONParse<AIReminderResponse>(
			response,
			["title", "description"],
			{
				title: trimmedReminder,
				description: "",
			},
		);

		// Validate the result
		if (!parseResult.success || !parseResult.data) {
			throw new Error("Failed to parse AI response");
		}

		if (
			!Object.prototype.hasOwnProperty.call(parseResult.data, "description")
		) {
			throw new Error("Invalid description field");
		}

		return {
			title: parseResult.data.title,
			description: parseResult.data.description,
		};
	} catch (error) {
		throw new Error(
			`Failed to process reminder: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
