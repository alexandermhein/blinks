import { ActionPanel, Action, Icon, List, showToast, Toast } from "@raycast/api";
import { memo } from "react";
import { BlinkItemProps } from "../types/blinks";
import { getBlinkIcon, getBlinkIconColor, getBlinkColor } from "../utils/design";
import BlinkDetail from "./BlinkDetail";

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const BlinkItem = memo(({ blink, onDelete, onToggle }: BlinkItemProps) => {
  const handleToggle = async () => {
    try {
      await onToggle(blink.id);
      showToast({
        style: Toast.Style.Success,
        title: !blink.isCompleted ? "Reminder removed" : "Reminder reset",
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error updating reminder",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  if (blink.type === "reminder") {
    return (
      <List.Item
        key={blink.id}
        icon={{ 
          source: blink.isCompleted ? Icon.Checkmark : Icon.Circle,
          tintColor: getBlinkColor(blink.type)
        }}
        title={blink.title}
        subtitle={blink.description}
        accessories={[
          ...(blink.source ? [{ icon: Icon.Link, tooltip: blink.source }] : []),
          ...(blink.reminderDate ? [{ tag: { value: formatDate(blink.reminderDate), color: getBlinkColor(blink.type) } }] : []),
          { text: formatDate(blink.createdOn) },
        ]}
        actions={
          <ActionPanel>
            <Action.Push
              title="View details"
              icon={Icon.Info}
              target={<BlinkDetail blink={blink} onDelete={onDelete} />}
            />
            <Action
              icon={blink.isCompleted ? Icon.Undo : Icon.Checkmark}
              title={blink.isCompleted ? "Reset reminder" : "Remove reminder"}
              onAction={handleToggle}
            />
            <Action
              title="Delete Blink"
              icon={Icon.Trash}
              style={Action.Style.Destructive}
              shortcut={{ modifiers: ["cmd"], key: "backspace" }}
              onAction={() => onDelete(blink.id)}
            />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <List.Item
      key={blink.id}
      icon={{ source: getBlinkIcon(blink.type), tintColor: getBlinkIconColor(blink.type) }}
      title={blink.title}
      subtitle={blink.description}
      accessories={[
        ...(blink.source ? [{ icon: Icon.Link, tooltip: blink.source }] : []),
        { text: formatDate(blink.createdOn) },
      ]}
      actions={
        <ActionPanel>
          <Action.Push
            title="Show details"
            icon={Icon.Info}
            target={<BlinkDetail blink={blink} onDelete={onDelete} />}
          />
          {blink.source && <Action.OpenInBrowser url={blink.source} />}
          <Action
            title="Delete Blink"
            icon={Icon.Trash}
            style={Action.Style.Destructive}
            shortcut={{ modifiers: ["cmd"], key: "backspace" }}
            onAction={() => onDelete(blink.id)}
          />
        </ActionPanel>
      }
    />
  );
});

BlinkItem.displayName = "BlinkItem";

export default BlinkItem; 