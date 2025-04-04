import { AI, environment, BrowserExtension, showHUD, popToRoot } from "@raycast/api";
import { saveBlink } from "./utils/storage";
import { processThought } from "./utils/ai-thoughts";
import { processReminder } from "./utils/ai-reminders";
import { processQuote } from "./utils/ai-quotes";
import { processBookmark } from "./utils/ai-bookmarks";
import { detectBlinkType, removePrefix, PROMPTS } from "./utils/quick-capture-utils";
import { BlinkType } from "./utils/design";
import { createBlink, showLoadingToast, showErrorToast, formatBlinkType } from "./utils/blink-utils";

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
  reminderDate?: Date;
}

interface ProcessedBookmarkResult {
  title: string;
  description: string;
  source: string;
}

export default async function Command(props: CommandProps) {
  const loadingToast = await showLoadingToast("Capturing ...");

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
          await loadingToast.hide();
          await showErrorToast(
            "Browser extension error",
            "Could not access browser tabs. Please check browser extension permissions."
          );
          return;
        }
      }

      if (!source) {
        await loadingToast.hide();
        await showErrorToast(
          "No URL found",
          "Could not find a URL in the text or active browser tab."
        );
        return;
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
      try {
        const bookmarkResult = await processBookmark(pageTitle, source);
        processed = {
          title: bookmarkResult.title,
          description: bookmarkResult.description,
        };
      } catch (error) {
        await loadingToast.hide();
        await showErrorToast(
          "Processing error",
          "Failed to process bookmark. Please try again."
        );
        return;
      }
    } else {
      try {
        switch (type) {
          case "reminder":
            // Extract date first
            let reminderDate: Date | undefined;
            try {
              const dateResponse = await AI.ask(PROMPTS.dateExtraction(content), {
                model: AI.Model["Google_Gemini_2.0_Flash"],
                creativity: "low",
              });
              const extractedDate = dateResponse.trim();
              if (extractedDate !== "NO_DATE") {
                reminderDate = new Date(extractedDate);
              }
            } catch (error) {
              // Silently handle date extraction errors
            }
            
            processed = await processReminder(content);
            if (reminderDate) {
              processed = {
                ...processed,
                reminderDate
              };
            }
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
      } catch (error) {
        await loadingToast.hide();
        await showErrorToast(
          "Processing error",
          `${type}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        return;
      }
    }
    
    // Create and save the blink
    try {
      const blink = createBlink(type, processed.title, {
        description: processed.description,
        author: processed.author,
        source,
        reminderDate: processed.reminderDate,
      });
      
      await saveBlink(blink);
      await loadingToast.hide();
      await showHUD(`${formatBlinkType(type)} captured  ✅`);
      await popToRoot({ clearSearchBar: true });
    } catch (error) {
      await loadingToast.hide();
      await showErrorToast(
        "Save error",
        `${type}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  } catch (error) {
    await loadingToast.hide();
    await showErrorToast(
      "Unexpected error",
      `${error instanceof Error ? error.message : "Unknown error"}`
    );
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