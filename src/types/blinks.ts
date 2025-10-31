/**
 * Core Blink domain types used across commands and components.
 * - Represents captured items like thoughts, reminders, bookmarks, and quotes.
 */
import type { BlinkType } from "../utils/design";

/** Props for the Blink list item component. */
export interface BlinkItemProps {
	blink: Blink;
	onDelete: (id: string) => Promise<void>;
	onToggle: (id: string) => Promise<void>;
	onRefresh: () => Promise<void>;
}

/** Props for the Blink detail component. */
export interface BlinkDetailProps {
	blink: Blink;
	onDelete: (id: string) => Promise<void>;
}

/** Sorting options for the Blink list view. */
export type SortOption = "newest" | "title";

/**
 * A captured Blink item.
 * - `type` determines specialized fields like `author` or `reminderDate`.
 */
export interface Blink {
	id: string;
	title: string;
	description?: string;
	type: BlinkType;
	createdOn: Date;
	source?: string;
	author?: string;
	reminderDate?: Date;
	isCompleted?: boolean;
	completedAt?: Date;
}
