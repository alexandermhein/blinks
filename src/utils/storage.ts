/**
 * Thin storage layer delegating to Notion. Includes hourly cleanup helpers
 * for completed reminders.
 */
import { LocalStorage } from "@raycast/api";
import type { Blink } from "../types/blinks";
import {
	deleteNotionBlink,
	getNotionBlinks,
	saveNotionBlink,
	toggleNotionBlinkCompletion,
	updateNotionBlink,
} from "./notion-storage";

const LAST_CLEANUP_KEY = "last_cleanup_timestamp";

/** Fetch all Blinks from Notion. */
export async function getBlinks(): Promise<Blink[]> {
	return await getNotionBlinks();
}

/** Persist a new Blink to Notion. */
export async function saveBlink(blink: Blink): Promise<void> {
	await saveNotionBlink(blink);
}

/** Delete a Blink by id. */
export async function deleteBlink(id: string): Promise<void> {
	await deleteNotionBlink(id);
}

/** Toggle completion for a reminder Blink. */
export async function toggleBlinkCompletion(id: string): Promise<void> {
	await toggleNotionBlinkCompletion(id);
}

/** Update an existing Blink. */
export async function updateBlink(blink: Blink): Promise<void> {
	await updateNotionBlink(blink);
}

/**
 * Remove completed reminders the next day at 4am local time.
 * Intentionally cheap: iterates in-memory after fetching.
 */
export async function cleanupCompletedReminders(): Promise<void> {
	const blinks = await getBlinks();
	const now = new Date();

	for (const blink of blinks) {
		if (blink.type !== "reminder" || !blink.isCompleted || !blink.completedAt)
			continue;
		const nextDay4am = new Date(blink.completedAt);
		nextDay4am.setDate(nextDay4am.getDate() + 1);
		nextDay4am.setHours(4, 0, 0, 0);
		if (now >= nextDay4am) {
			await deleteNotionBlink(blink.id);
		}
	}
}

// Run cleanup at most once per hour; consumers can use this helper
/** Whether hourly cleanup should run (at most once per hour). */
export async function shouldRunCleanup(): Promise<boolean> {
	const lastCleanup = await LocalStorage.getItem<string>(LAST_CLEANUP_KEY);
	if (!lastCleanup) return true;
	const lastCleanupDate = new Date(lastCleanup);
	const hoursSinceCleanup =
		(Date.now() - lastCleanupDate.getTime()) / (1000 * 60 * 60);
	return hoursSinceCleanup >= 1;
}
/** Mark the current time as the last cleanup run. */
export async function markCleanupRun(): Promise<void> {
	await LocalStorage.setItem(LAST_CLEANUP_KEY, new Date().toISOString());
}
