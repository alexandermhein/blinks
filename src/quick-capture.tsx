import { AI, showToast, Toast, environment, BrowserExtension, showHUD } from "@raycast/api";
import { saveBlink } from "./utils/storage";
import { processThought } from "./utils/ai-thoughts";
import { processReminder } from "./utils/ai-reminders";
import { processQuote } from "./utils/ai-quotes";
import { processBookmark } from "./utils/ai-bookmarks";
import { detectBlinkType, removePrefix, PROMPTS } from "./utils/quick-capture-utils";
import { BlinkType } from "./utils/design";

interface CommandProps {
  arguments: {
    text: string;
  };
}

interface ProcessedBlink {
  title: string;
  description?: string;
  author?: string;
  source?: string;
}

interface ProcessedBookmarkResult {
  title: string;
  description: string;
  source: string;
}

export default async function Command(props: CommandProps) {
  if (!props.arguments.text) {
    showToast({
      style: Toast.Style.Failure,
      title: "No text provided",
      message: "Please enter some text to capture",
    });
    return;
  }

  const loadingToast = await showToast({
    style: Toast.Style.Animated,
    title: "Capturing...",
  });

  try {
    const input = props.arguments.text.trim();
    const { type, content } = detectBlinkType(input);
    let source: string | undefined;
    let processed: ProcessedBlink;

    if (type === "bookmark") {
      // Step 1: Get URL from input or browser tab
      const extractedUrl = await extractUrlFromText(content);
      if (extractedUrl) {
        source = extractedUrl;
      } else if (environment.canAccess(BrowserExtension)) {
        try {
          const tabs = await BrowserExtension.getTabs();
          const activeTab = tabs.find(tab => tab.active);
          if (activeTab?.url) {
            source = activeTab.url;
          }
        } catch (error) {
          // Silently handle browser extension errors
        }
      }

      if (!source) {
        throw new Error("No URL found in text and could not get active browser tab");
      }

      // Step 2: Get page title and process with AI
      let pageTitle: string;
      try {
        const title = await AI.ask(PROMPTS.pageTitle(source), {
          model: AI.Model["Google_Gemini_2.0_Flash"],
          creativity: "low",
        });
        pageTitle = title.trim();
      } catch (error) {
        pageTitle = source;
      }

      // Step 3: Generate description using AI
      const bookmarkResult = await processBookmark(pageTitle, source);
      
      processed = {
        title: bookmarkResult.title,
        description: bookmarkResult.description,
      };
    } else {
      switch (type) {
        case "reminder":
          processed = await processReminder(content);
          break;
        case "quote":
          const quoteResult = await processQuote(content);
          processed = {
            title: quoteResult.formattedQuote,
            description: quoteResult.description,
            author: quoteResult.author
          };
          break;
        default:
          processed = await processThought(content);
      }
    }
    
    // Create and save the blink
    const blink = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      type,
      title: processed.title,
      ...(processed.description && { description: processed.description }),
      ...(processed.author && { author: processed.author }),
      ...(source && { source }),
      createdOn: new Date(),
    };
    
    await saveBlink(blink);
    await loadingToast.hide();
    await showHUD(`${type.charAt(0).toUpperCase() + type.slice(1)} captured  ✅`);
  } catch (error) {
    await loadingToast.hide();
    showToast({
      style: Toast.Style.Failure,
      title: "Failed to save blink",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

async function extractUrlFromText(text: string): Promise<string | undefined> {
  try {
    const response = await AI.ask(PROMPTS.urlExtraction(text), {
      model: AI.Model["Google_Gemini_2.0_Flash"],
      creativity: "low",
    });
    return response.trim() === "NO_URL" ? undefined : response.trim();
  } catch (error) {
    return undefined;
  }
} 