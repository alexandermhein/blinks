import { Form, ActionPanel, Action, environment, popToRoot, showHUD } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useEffect, useState, useMemo } from "react";
import { BrowserExtension } from "@raycast/api";
import { saveBlink } from "./utils/storage";
import { BlinkType, isValidBlinkType } from "./utils/design";
import { processQuote } from "./utils/ai-quotes";
import { processThought } from "./utils/ai-thoughts";
import { processReminder } from "./utils/ai-reminders";
import { processBookmark } from "./utils/ai-bookmarks";
import { createBlink, showLoadingToast, showErrorToast, showSuccessToast, formatBlinkType, isValidUrl, getUrlDomain } from "./utils/blink-utils";

interface BlinkValues {
  type: BlinkType;
  title: string;
  source: string;
  useBrowserTab: boolean;
  reminderDate?: Date;
}

export default function Command() {
  const canAccessBrowser = useMemo(() => environment.canAccess(BrowserExtension), []);
  const [hasActiveTab, setHasActiveTab] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function checkActiveTab() {
      if (!canAccessBrowser) return;
      
      try {
        const tabs = await BrowserExtension.getTabs();
        const activeTab = tabs.find(tab => tab.active);
        setHasActiveTab(!!activeTab?.url);
      } catch (error) {
        setHasActiveTab(false);
      }
    }
    
    checkActiveTab();
  }, [canAccessBrowser]);

  const { handleSubmit, itemProps, setValue } = useForm<BlinkValues>({
    initialValues: {
      type: "thought",
      source: "",
      useBrowserTab: false,
    },
    onSubmit: async (values) => {
      if (!isValidBlinkType(values.type)) {
        showErrorToast("Invalid Blink", "Please select a valid Blink type");
        return;
      }

      let processedTitle = values.title;
      let author: string | undefined;
      let description: string | undefined;

      if (values.type === "quote" || values.type === "thought" || values.type === "reminder" || values.type === "bookmark") {
        setIsProcessing(true);
        const loadingToast = await showLoadingToast("Processing Blink...");

        try {
          if (values.type === "quote") {
            const processed = await processQuote(values.title);
            processedTitle = processed.formattedQuote;
            author = processed.author;
            description = processed.description;
          } else if (values.type === "thought") {
            const processed = await processThought(values.title);
            processedTitle = processed.title;
            description = processed.description;
          } else if (values.type === "reminder") {
            const processed = await processReminder(values.title);
            processedTitle = processed.title;
            description = processed.description;
          } else if (values.type === "bookmark" && itemProps.source.value) {
            const processed = await processBookmark(values.title, itemProps.source.value);
            processedTitle = processed.title;
            description = processed.description;
          }
          await loadingToast.hide();
        } catch (error) {
          await loadingToast.hide();
          showErrorToast(`Error processing ${values.type}`, error instanceof Error ? error.message : "Could not analyze with AI");
          setIsProcessing(false);
          return;
        } finally {
          setIsProcessing(false);
        }
      }

      try {
        const blink = createBlink(values.type, processedTitle, {
          description,
          author,
          source: itemProps.source.value,
          reminderDate: values.reminderDate,
        });
        
        await saveBlink(blink);
        popToRoot();
        await showHUD(`${formatBlinkType(values.type)} captured  ✅`);
      } catch (error) {
        showErrorToast("Error saving Blink", error instanceof Error ? error.message : "Unknown error occurred");
      }
    },
    validation: {
      title: FormValidation.Required,
    },
  });

  const handleTypeChange = async (value: string) => {
    if (isValidBlinkType(value)) {
      setValue("type", value);
      if (value !== "reminder") {
        setValue("reminderDate", undefined);
      }

      // Handle bookmark type selection
      if (value === "bookmark" && canAccessBrowser) {
        try {
          const tabs = await BrowserExtension.getTabs();
          const activeTab = tabs.find(tab => tab.active);
          
          if (activeTab?.title && activeTab?.url) {
            setValue("title", activeTab.title);
            setValue("source", activeTab.url);
            setValue("useBrowserTab", true);
            
            const domain = getUrlDomain(activeTab.url);
            showSuccessToast("Bookmark captured", domain);
          } else {
            showErrorToast("No active tab", "Could not find an active browser tab");
          }
        } catch (error) {
          showErrorToast("Error", "Could not fetch bookmark info from browser tab");
        }
      } else if (value !== "bookmark") {
        // Clear bookmark-related fields when switching to other types
        setValue("useBrowserTab", false);
        if (value !== "quote" && value !== "thought") {
          setValue("source", "");
        }
      }
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm 
            title="Capture Blink" 
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="type"
        title="Type"
        value={itemProps.type.value}
        onChange={handleTypeChange}
      >
        <Form.Dropdown.Item value="thought" title="Thought" />
        <Form.Dropdown.Item value="reminder" title="Reminder" />
        <Form.Dropdown.Item value="bookmark" title="Bookmark" />
        <Form.Dropdown.Item value="quote" title="Quote" />
      </Form.Dropdown>
      {itemProps.type.value === "reminder" && (
        <Form.DatePicker
          id="reminderDate"
          title="Date (Optional)"
          type={Form.DatePicker.Type.DateTime}
          value={itemProps.reminderDate?.value}
          onChange={(date) => setValue("reminderDate", date || undefined)}
        />
      )}
      <Form.TextArea
        title="Blink"
        placeholder="Capture ..."
        {...itemProps.title}
      />
      {canAccessBrowser && hasActiveTab && (
        <Form.Checkbox
          id="useBrowserTab"
          title="Context"
          label="Add URL from active browser tab"
          value={itemProps.useBrowserTab.value}
          onChange={async (checked) => {
            if (checked) {
              try {
                const tabs = await BrowserExtension.getTabs();
                const activeTab = tabs.find(tab => tab.active);
                
                if (activeTab?.url) {
                  setValue("source", activeTab.url);
                  const domain = getUrlDomain(activeTab.url);
                  showSuccessToast("URL captured", domain);
                } else {
                  showErrorToast("No active tab", "Could not find an active browser tab");
                }
              } catch (error) {
                showErrorToast("Error", "Could not fetch URL from browser tab");
              }
            } else {
              setValue("source", "");
            }
            setValue("useBrowserTab", checked);
          }}
        />
      )}
    </Form>
  );
}
