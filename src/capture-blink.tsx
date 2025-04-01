import { Form, ActionPanel, Action, showToast, Toast, environment, popToRoot, showHUD } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useEffect, useState, useMemo } from "react";
import { BrowserExtension } from "@raycast/api";
import { saveBlink } from "./utils/storage";
import { BlinkType, isValidBlinkType } from "./utils/design";
import { processQuote } from "./utils/ai-quotes";

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
        showToast({
          style: Toast.Style.Failure,
          title: "Invalid Blink",
          message: "Please select a valid Blink type",
        });
        return;
      }

      if (values.type === "reminder" && !values.reminderDate) {
        showToast({
          style: Toast.Style.Failure,
          title: "Missing reminder date",
          message: "Please select a date",
        });
        return;
      }

      let processedTitle = values.title;
      let author: string | undefined;
      let description: string | undefined;

      if (values.type === "quote") {
        setIsProcessing(true);
        const loadingToast = await showToast({
          style: Toast.Style.Animated,
          title: "Capturing Blink...",
        });

        try {
          const processed = await processQuote(values.title);
          processedTitle = processed.formattedQuote;
          author = processed.author;
          description = processed.description;
          await loadingToast.hide();
        } catch (error) {
          await loadingToast.hide();
          showToast({
            style: Toast.Style.Failure,
            title: "Error processing quote",
            message: "Could not analyze quote with AI",
          });
          return;
        } finally {
          setIsProcessing(false);
        }
      }

      const savingToast = await showToast({
        style: Toast.Style.Animated,
        title: "Saving Blink",
        message: "Please wait...",
      });

      const blink = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        type: values.type,
        title: processedTitle,
        ...(itemProps.source.value ? { source: itemProps.source.value } : {}),
        ...(values.type === "reminder" && values.reminderDate ? { reminderDate: values.reminderDate } : {}),
        ...(author ? { author } : {}),
        ...(description ? { description } : {}),
        createdOn: new Date(),
      };

      try {
        await saveBlink(blink);
        await savingToast.hide();
        await showHUD(`✅ ${values.type} captured`);
        popToRoot();
      } catch (error) {
        await savingToast.hide();
        showToast({
          style: Toast.Style.Failure,
          title: "Error saving Blink",
          message: error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    },
    validation: {
      title: FormValidation.Required,
    },
  });

  const handleTypeChange = (value: string) => {
    if (isValidBlinkType(value)) {
      setValue("type", value);
      if (value !== "reminder") {
        setValue("reminderDate", undefined);
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
          title="Date"
          type={Form.DatePicker.Type.DateTime}
          value={itemProps.reminderDate?.value}
          onChange={(date) => setValue("reminderDate", date || undefined)}
        />
      )}
      <Form.TextArea
        title="Blink"
        placeholder={itemProps.type.value === "quote" ? "Paste a quote to analyze..." : "Capture a Blink ..."}
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
                  const url = new URL(activeTab.url);
                  showToast({
                    style: Toast.Style.Success,
                    title: "URL captured",
                    message: url.hostname,
                  });
                } else {
                  showToast({
                    style: Toast.Style.Failure,
                    title: "No active tab",
                    message: "Could not find an active browser tab",
                  });
                }
              } catch (error) {
                showToast({
                  style: Toast.Style.Failure,
                  title: "Error",
                  message: "Could not fetch URL from browser tab",
                });
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
