import { ActionPanel, Action, Icon, Detail } from "@raycast/api";
import { memo } from "react";
import { BlinkDetailProps } from "../types/blinks";
import { getBlinkTitle } from "../utils/design";
import { formatDate } from "../utils/date";

const BlinkDetail = memo(({ blink, onDelete }: BlinkDetailProps) => {
  const markdown = `## ${blink.title}
${blink.type === "quote" && blink.description ? `\n${blink.description}` : ""}`;

  return (
    <Detail
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text={getBlinkTitle(blink.type)} />
          </Detail.Metadata.TagList>
          {blink.source && (
            <Detail.Metadata.Link title="Source" text={blink.source} target={blink.source} />
          )}
          {blink.author && (
            <Detail.Metadata.Label title="Author" text={blink.author} />
          )}
          {blink.description && blink.type !== "quote" && (
            <Detail.Metadata.Label title="Context" text={blink.description} />
          )}
          <Detail.Metadata.Label title="Created" text={formatDate(blink.createdOn)} />
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