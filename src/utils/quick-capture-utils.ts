import { BlinkType } from "./design";

export function detectBlinkType(input: string): { type: BlinkType; content: string } {
  const hasReminder = input.includes("/r ") || input.includes("r/ ");
  const hasBookmark = input.includes("/b") || input.includes("b/");
  const hasQuote = input.includes("/q ") || input.includes("q/ ");
  
  if (hasReminder) {
    return {
      type: "reminder",
      content: removePrefix(input, "/r")
    };
  } else if (hasBookmark) {
    return {
      type: "bookmark",
      content: removePrefix(input, "/b")
    };
  } else if (hasQuote) {
    return {
      type: "quote",
      content: removePrefix(input, "/q")
    };
  }
  
  return { type: "thought", content: input };
}

export function removePrefix(input: string, prefix: string): string {
  return input.includes(prefix) 
    ? input.replace(prefix, "").trim()
    : input.replace(prefix.replace("/", ""), "").trim();
}

// Compile regex patterns once at the top level
export const TYPE_PATTERNS = {
  reminder: /\/r |r\/ /,
  bookmark: /\/b|b\//,
  quote: /\/q |q\/ /
} as const;

// AI prompts as constants
export const PROMPTS = {
  pageTitle: (url: string) => `Get the page title of this webpage. Only respond with the title, nothing else.

URL: ${url}

Title:`,
  urlExtraction: (text: string) => `Extract the URL from this text. If there is no URL, respond with "NO_URL". Only respond with the URL or "NO_URL", nothing else.

Text: ${text}

URL:`
} as const; 