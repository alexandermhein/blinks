import { Icon, Color } from "@raycast/api";

// Type definitions
export type BlinkType = "thought" | "reminder" | "bookmark" | "quote";

// Design tokens
export const blinkTypes = {
  thought: {
    icon: Icon.ShortParagraph,
    title: "Thoughts",
    iconColor: Color.Blue,
    color: Color.Blue,
  },
  reminder: {
    icon: Icon.Clock,
    title: "Reminders",
    iconColor: Color.Yellow,
    color: Color.Yellow,
  },
  bookmark: {
    icon: Icon.Link,
    title: "Bookmarks",
    iconColor: Color.SecondaryText,
    color: Color.SecondaryText,
  },
  quote: {
    icon: Icon.QuotationMarks,
    title: "Quotes",
    iconColor: Color.SecondaryText,
    color: Color.SecondaryText,
  },
} as const;

// Utility functions
export function getBlinkTypeInfo(type: BlinkType) {
  return blinkTypes[type];
}

export function getBlinkIcon(type: BlinkType) {
  return blinkTypes[type].icon;
}

export function getBlinkTitle(type: BlinkType) {
  return blinkTypes[type].title;
}

export function getBlinkIconColor(type: BlinkType) {
  return blinkTypes[type].iconColor;
}

export function getBlinkColor(type: BlinkType) {
  return blinkTypes[type].color;
}

// Type guard
export function isValidBlinkType(type: string): type is BlinkType {
  return type in blinkTypes;
}
