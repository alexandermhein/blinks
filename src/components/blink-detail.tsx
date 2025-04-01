import { ActionPanel, Action, Icon, Detail, useNavigation } from "@raycast/api";
import { memo } from "react";
import { BlinkDetailProps } from "../types/blinks";
import { getBlinkTitle } from "../utils/design";
import { formatDate } from "../utils/date";

const BlinkDetail = memo(({ blink, onDelete }: BlinkDetailProps) => {
  const { pop } = useNavigation();
  const markdown = `## ${blink.title}

${blink.description ? blink.description : ""}`;

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <Detail
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text={getBlinkTitle(blink.type)} />
          </Detail.Metadata.TagList>
          {blink.source && (
            <Detail.Metadata.Link 
              title="Source" 
              text={getHostname(blink.source)} 
              target={blink.source} 
            />
          )}
          {blink.author && (
            <Detail.Metadata.Label title="Author" text={blink.author} />
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
            onAction={() => {
              onDelete(blink.id);
              pop();
            }}
          />
        </ActionPanel>
      }
    />
  );
});

BlinkDetail.displayName = "BlinkDetail";

export default BlinkDetail; 