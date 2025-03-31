import { Form, ActionPanel, Action, showToast, Toast, environment, popToRoot } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useEffect, useState, useMemo } from "react";
import { BrowserExtension } from "@raycast/api";
import { saveBlink } from "./utils/storage";
import { BlinkType, isValidBlinkType } from "./utils/design";

interface BlinkValues {
  type: BlinkType;
  title: string;
  source: string;
  useBrowserTab: boolean;
}

export default function Command() {
  const canAccessBrowser = useMemo(() => environment.canAccess(BrowserExtension), []);
  const [hasActiveTab, setHasActiveTab] = useState(false);

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
    onSubmit(values) {
      if (!isValidBlinkType(values.type)) {
        showToast({
          style: Toast.Style.Failure,
          title: "Invalid blink type",
          message: "Please select a valid blink type",
        });
        return;
      }

      const blink = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        type: values.type,
        title: values.title,
        ...(itemProps.source.value ? { source: itemProps.source.value } : {}),
        createdOn: new Date(),
      };

      saveBlink(blink).then(() => {
        showToast({
          style: Toast.Style.Success,
          title: "Blinked!",
          message: `"${values.title}" saved`,
        });
        popToRoot();
      }).catch((error) => {
        showToast({
          style: Toast.Style.Failure,
          title: "Error saving blink",
          message: error instanceof Error ? error.message : "Unknown error occurred",
        });
      });
    },
    validation: {
      title: FormValidation.Required,
    },
  });

  const handleTypeChange = (value: string) => {
    if (isValidBlinkType(value)) {
      setValue("type", value);
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Capture Blink" onSubmit={handleSubmit} />
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
      <Form.TextArea
        title="Blink"
        placeholder="Capture a Blink ..."
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
