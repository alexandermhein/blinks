import { AI, environment } from "@raycast/api";

export interface SafeJSONParseResult<T> {
	success: boolean;
	data?: T;
	error?: string;
}

/**
 * Safely parse JSON from AI responses with validation
 */
export function safeJSONParse<T>(
	rawResponse: string,
	expectedFields: string[],
	fallback: T,
): SafeJSONParseResult<T> {
	try {
		// Remove markdown code blocks if present
		const cleaned = rawResponse.replace(/```json\n?|\n?```/g, "").trim();
		const parsed = JSON.parse(cleaned);

		// Validate required fields
		const missingFields = expectedFields.filter((field) => !(field in parsed));
		if (missingFields.length > 0) {
			return {
				success: false,
				error: `Missing fields: ${missingFields.join(", ")}`,
			};
		}

		return { success: true, data: parsed };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown parsing error",
			data: fallback,
		};
	}
}

/**
 * Check if AI access is available
 */
export function checkAIAccess(): void {
	if (!environment.canAccess(AI)) {
		throw new Error(
			"AI features require Raycast Pro. Please upgrade your subscription to access AI features.",
		);
	}
}

/**
 * Ask AI with retry logic for resilience
 * Includes automatic access check before making requests
 */
export async function askWithRetry(
	prompt: string,
	options: { model: AI.Model; creativity: AI.Creativity },
	maxRetries = 2,
): Promise<string> {
	// Check AI access before attempting to use it
	checkAIAccess();

	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await AI.ask(prompt, options);
		} catch (error) {
			lastError = error instanceof Error ? error : new Error("Unknown error");

			// Don't retry on the last attempt
			if (attempt === maxRetries) {
				throw lastError;
			}

			// Wait before retrying (exponential backoff)
			const delayMs = 1000 * 2 ** attempt;
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}

	throw lastError || new Error("Max retries exceeded");
}
