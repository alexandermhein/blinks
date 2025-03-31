import { Form, ActionPanel, Action, showToast, Toast, environment } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useEffect, useState, useMemo } from "react";
import { BrowserExtension } from "@raycast/api";

interface BlinkValues {
  type: string;
  title: string;
  source: string;
  useBrowserTab: boolean;
}

export default function Command() {
  const canAccessBrowser = useMemo(() => environment.canAccess(BrowserExtension), []);

  const { handleSubmit, itemProps, setValue } = useForm<BlinkValues>({
    initialValues: {
      type: "thought",
      source: "",
      useBrowserTab: false,
    },
    onSubmit(values) {
      const blink = {
        ...values,
        createdOn: new Date(),
      };

      showToast({
        style: Toast.Style.Success,
        title: "Blink captured!",
        message: `"${values.title}" has been saved`,
      });
    },
    validation: {
      title: FormValidation.Required,
    },
  });

  const handleBrowserTabChange = async (checked: boolean) => {
    if (!checked || !canAccessBrowser) return;

    try {
      const tabs = await BrowserExtension.getTabs();
      const activeTab = tabs.find(tab => tab.active);
      if (activeTab?.url) {
        setValue("source", activeTab.url);
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Could not fetch URL from browser tab",
      });
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Blink" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        title="Type"
        {...itemProps.type}
      >
        <Form.Dropdown.Item value="thought" title="Thought" />
        <Form.Dropdown.Item value="reminder" title="Reminder" />
        <Form.Dropdown.Item value="bookmark" title="Bookmark" />
        <Form.Dropdown.Item value="quote" title="Quote" />
      </Form.Dropdown>
      <Form.TextArea
        title="Blink"
        placeholder="Write a Blink..."
        {...itemProps.title}
      />
      {canAccessBrowser && (
        <Form.Checkbox
          title="Context"
          label="Add URL from active browser tab"
          {...itemProps.useBrowserTab}
          onChange={handleBrowserTabChange}
        />
      )}
    </Form>
  );
}
