import { ActionPanel, Action, Icon, Detail } from "@raycast/api";
import { memo } from "react";
import { BlinkDetailProps } from "../types/blinks";
import { getBlinkTitle } from "../utils/design";

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const BlinkDetail = memo(({ blink, onDelete }: BlinkDetailProps) => {
  const markdown = `## ${blink.title}`;

  return (
    <Detail
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text={getBlinkTitle(blink.type)} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label title="Created" text={formatDate(blink.createdOn)} />
          {blink.source && (
            <Detail.Metadata.Link title="Source" text={blink.source} target={blink.source} />
          )}
          {blink.description && (
            <Detail.Metadata.Label title="Description" text={blink.description} />
          )}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content={blink.title} />
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

BlinkDetail.displayName = "BlinkDetail";

export default BlinkDetail; 