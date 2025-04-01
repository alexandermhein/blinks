import { showToast, Toast } from "@raycast/api";
import { Blink } from "./storage";
import { BlinkType } from "./design";

/**
 * Creates a new blink with a unique ID
 */
export function createBlink(
  type: BlinkType,
  title: string,
  options: {
    description?: string;
    author?: string;
    source?: string;
    reminderDate?: Date;
  } = {}
): Blink {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    type,
    title,
    ...options,
    createdOn: new Date(),
  };
}

/**
 * Shows a success toast notification
 */
export async function showSuccessToast(title: string, message?: string) {
  await showToast({
    style: Toast.Style.Success,
    title,
    message,
  });
}

/**
 * Shows an error toast notification
 */
export async function showErrorToast(title: string, message?: string) {
  await showToast({
    style: Toast.Style.Failure,
    title,
    message,
  });
}

/**
 * Shows a loading toast notification
 */
export async function showLoadingToast(title: string, message?: string) {
  return await showToast({
    style: Toast.Style.Animated,
    title,
    message,
  });
}

/**
 * Standardizes error handling across the application
 */
export function handleError(error: unknown, context: string): string {
  if (error instanceof Error) {
    return `${context}: ${error.message}`;
  }
  return `${context}: Unknown error occurred`;
}

/**
 * Formats a blink type for display (capitalizes first letter)
 */
export function formatBlinkType(type: BlinkType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Validates a URL string
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts domain from URL
 */
export function getUrlDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
} 