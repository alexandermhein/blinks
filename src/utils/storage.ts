import { LocalStorage } from "@raycast/api";
import { BlinkType } from "./design";

export interface Blink {
  id: string;
  type: BlinkType;
  title: string;
  source?: string;
  description?: string;
  createdOn: Date;
}

const BLINKS_STORAGE_KEY = "blinks";

export async function getBlinks(): Promise<Blink[]> {
  const storedBlinksJson = await LocalStorage.getItem<string>(BLINKS_STORAGE_KEY);
  if (!storedBlinksJson) return [];
  
  const storedBlinks = JSON.parse(storedBlinksJson);
  // Convert stored dates back to Date objects
  return storedBlinks.map((blink: any) => ({
    ...blink,
    createdOn: new Date(blink.createdOn)
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