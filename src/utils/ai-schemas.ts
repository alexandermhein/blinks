/**
 * Schema definitions for AI responses
 */

export interface AIQuoteResponse {
	cleanedQuote: string;
	author: string | null;
	context: string | null;
}

export interface AIThoughtResponse {
	title: string;
	description: string;
}

export interface AIReminderResponse {
	title: string;
	description: string;
}

export interface ProcessedQuote {
	formattedQuote: string;
	author?: string;
	description?: string;
}

export interface ProcessedThought {
	title: string;
	description: string;
}

export interface ProcessedReminder {
	title: string;
	description: string;
}

export interface ProcessedBookmark {
	title: string;
	description: string;
}
