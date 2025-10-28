import { LocalStorage } from "@raycast/api";
import type { Blink } from "../types/blinks";
import {
  getNotionBlinks,
  saveNotionBlink,
  updateNotionBlink,
  deleteNotionBlink,
  toggleNotionBlinkCompletion,
} from "./notion-storage";

const LAST_CLEANUP_KEY = "last_cleanup_timestamp";

export async function getBlinks(): Promise<Blink[]> {
  return await getNotionBlinks();
}

export async function saveBlink(blink: Blink): Promise<void> {
  await saveNotionBlink(blink);
}

export async function deleteBlink(id: string): Promise<void> {
  await deleteNotionBlink(id);
}

export async function toggleBlinkCompletion(id: string): Promise<void> {
  await toggleNotionBlinkCompletion(id);
}

export async function updateBlink(blink: Blink): Promise<void> {
  await updateNotionBlink(blink);
}

export async function cleanupCompletedReminders(): Promise<void> {
  const blinks = await getBlinks();
  const now = new Date();

  for (const blink of blinks) {
    if (blink.type !== "reminder" || !blink.isCompleted || !blink.completedAt) continue;
    const nextDay4am = new Date(blink.completedAt);
    nextDay4am.setDate(nextDay4am.getDate() + 1);
    nextDay4am.setHours(4, 0, 0, 0);
    if (now >= nextDay4am) {
      await deleteNotionBlink(blink.id);
    }
  }
}

// Run cleanup at most once per hour; consumers can use this helper
export async function shouldRunCleanup(): Promise<boolean> {
  const lastCleanup = await LocalStorage.getItem<string>(LAST_CLEANUP_KEY);
  if (!lastCleanup) return true;
  const lastCleanupDate = new Date(lastCleanup);
  const hoursSinceCleanup = (Date.now() - lastCleanupDate.getTime()) / (1000 * 60 * 60);
  return hoursSinceCleanup >= 1;
}
export async function markCleanupRun(): Promise<void> {
  await LocalStorage.setItem(LAST_CLEANUP_KEY, new Date().toISOString());
}
