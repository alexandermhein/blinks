import { BlinkType } from "../utils/design";

export interface BlinkItemProps {
  blink: Blink;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export interface BlinkDetailProps {
  blink: Blink;
  onDelete: (id: string) => Promise<void>;
}

export type SortOption = "newest" | "title";

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
} 