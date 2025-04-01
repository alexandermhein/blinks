import { LocalStorage } from "@raycast/api";
import { BlinkType } from "./design";

export interface Blink {
  id: string;
  type: BlinkType;
  title: string;
  source?: string;
  description?: string;
  createdOn: Date;
  reminderDate?: Date;
  isCompleted?: boolean;
  completedAt?: Date;
}

const BLINKS_STORAGE_KEY = "blinks";

export async function getBlinks(): Promise<Blink[]> {
  const storedBlinksJson = await LocalStorage.getItem<string>(BLINKS_STORAGE_KEY);
  if (!storedBlinksJson) return [];
  
  const storedBlinks = JSON.parse(storedBlinksJson);
  // Convert stored dates back to Date objects
  return storedBlinks.map((blink: any) => ({
    ...blink,
    createdOn: new Date(blink.createdOn),
    reminderDate: blink.reminderDate ? new Date(blink.reminderDate) : undefined,
    isCompleted: blink.isCompleted || false
  }));
}

export async function saveBlink(blink: Blink): Promise<void> {
  const blinks = await getBlinks();
  blinks.push(blink);
  await LocalStorage.setItem(BLINKS_STORAGE_KEY, JSON.stringify(blinks));
}

export async function deleteBlink(id: string): Promise<void> {
  const blinks = await getBlinks();
  const filteredBlinks = blinks.filter(blink => blink.id !== id);
  await LocalStorage.setItem(BLINKS_STORAGE_KEY, JSON.stringify(filteredBlinks));
}

export async function toggleBlinkCompletion(id: string): Promise<void> {
  const blinks = await getBlinks();
  const updatedBlinks = blinks.map(blink => {
    if (blink.id !== id) return blink;
    
    const isNowCompleted = !blink.isCompleted;
    return {
      ...blink,
      isCompleted: isNowCompleted,
      completedAt: isNowCompleted ? new Date() : undefined
    };
  });
  await LocalStorage.setItem(BLINKS_STORAGE_KEY, JSON.stringify(updatedBlinks));
}

export async function updateBlink(blink: Blink): Promise<void> {
  try {
    const blinks = await getBlinks();
    const index = blinks.findIndex(b => b.id === blink.id);
    
    if (index === -1) {
      throw new Error("Blink not found");
    }
    
    blinks[index] = blink;
    await LocalStorage.setItem(BLINKS_STORAGE_KEY, JSON.stringify(blinks));
  } catch (error) {
    throw new Error("Failed to update Blink");
  }
}

export async function cleanupCompletedReminders(): Promise<void> {
  const blinks = await getBlinks();
  const now = new Date();
  
  // Get the next 4am
  const next4am = new Date(now);
  next4am.setHours(4, 0, 0, 0);
  if (next4am <= now) {
    next4am.setDate(next4am.getDate() + 1);
  }

  // Filter out completed reminders that are due for cleanup
  const updatedBlinks = blinks.filter(blink => {
    if (blink.type !== "reminder" || !blink.isCompleted || !blink.completedAt) {
      return true;
    }
    
    // Keep reminders that haven't reached 4am the next day after completion
    const nextDay4am = new Date(blink.completedAt);
    nextDay4am.setDate(nextDay4am.getDate() + 1);
    nextDay4am.setHours(4, 0, 0, 0);
    
    return now < nextDay4am;
  });

  // Only update storage if there are changes
  if (updatedBlinks.length !== blinks.length) {
    await LocalStorage.setItem(BLINKS_STORAGE_KEY, JSON.stringify(updatedBlinks));
  }
} 