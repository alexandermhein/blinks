import { ActionPanel, Action, Icon, List, showToast, Toast, Detail } from "@raycast/api";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Blink, getBlinks, deleteBlink, toggleBlinkCompletion } from "./utils/storage";
import { getBlinkIcon, getBlinkTitle, getBlinkIconColor, getBlinkColor, BlinkType } from "./utils/design";
import { SortOption } from "./types/blinks";
import BlinkItem from "./components/BlinkItem";

// Format date to "MMM DD, YYYY" format
const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Define fixed category order
const CATEGORY_ORDER: BlinkType[] = ["reminder", "thought", "bookmark", "quote"];

interface BlinkItemProps {
  blink: Blink;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
}

interface BlinkDetailProps {
  blink: Blink;
  onDelete: (id: string) => Promise<void>;
}

const BlinkDetail = ({ blink, onDelete }: BlinkDetailProps) => {
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
};

export default function Command() {
  const [blinks, setBlinks] = useState<Blink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSections, setShowSections] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    loadBlinks();
  }, []);

  const loadBlinks = useCallback(async () => {
    try {
      const storedBlinks = await getBlinks();
      setBlinks(storedBlinks);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error loading Blinks",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteBlink(id);
      setBlinks(prevBlinks => prevBlinks.filter(blink => blink.id !== id));
      showToast({
        style: Toast.Style.Success,
        title: "Blink deleted",
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error deleting Blink",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }, []);

  const handleToggle = useCallback(async (id: string) => {
    try {
      await toggleBlinkCompletion(id);
      setBlinks(prevBlinks => prevBlinks.map(blink => 
        blink.id === id ? { ...blink, isCompleted: !blink.isCompleted } : blink
      ));
    } catch (error) {
      throw error;
    }
  }, []);

  // Optimized sorting and filtering using useMemo
  const { sortedAndFilteredBlinks, groupedBlinks } = useMemo(() => {
    const filtered = blinks.filter(blink => 
      blink.title.toLowerCase().includes(searchText.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
      }
      return a.title.localeCompare(b.title);
    });

    const grouped = sorted.reduce((acc, blink) => {
      if (!acc[blink.type]) {
        acc[blink.type] = [];
      }
      acc[blink.type].push(blink);
      return acc;
    }, {} as Record<string, Blink[]>);

    return { sortedAndFilteredBlinks: sorted, groupedBlinks: grouped };
  }, [blinks, searchText, sortBy]);

  // Sort items within each category when title sorting is selected
  if (sortBy === "title") {
    Object.keys(groupedBlinks).forEach(type => {
      groupedBlinks[type].sort((a, b) => a.title.localeCompare(b.title));
    });
  }

  return (
    <List 
      isLoading={isLoading}
      searchBarPlaceholder="Search Blinks..."
      onSearchTextChange={setSearchText}
      searchBarAccessory={
        <List.Dropdown
          tooltip="View options"
          value={sortBy}
          onChange={(value) => {
            if (value === "toggle-sections") {
              setShowSections(!showSections);
            } else {
              setSortBy(value as SortOption);
            }
          }}
        >
          <List.Dropdown.Section title="Sort by">
            <List.Dropdown.Item 
              title="Sort by date" 
              value="newest" 
              icon={Icon.Calendar}
            />
            <List.Dropdown.Item 
              title="Sort by title" 
              value="title" 
              icon={Icon.Text}
            />
          </List.Dropdown.Section>
          <List.Dropdown.Section title="List settings">
            <List.Dropdown.Item 
              title={showSections ? "Hide sections" : "Show sections"} 
              value="toggle-sections"
              icon={showSections ? Icon.EyeSlash : Icon.Eye}
            />
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
      {showSections ? (
        CATEGORY_ORDER.map((type) => {
          const typeBlinks = groupedBlinks[type] || [];
          if (typeBlinks.length === 0) return null;
          return (
            <List.Section key={type} title={getBlinkTitle(type)}>
              {typeBlinks.map(blink => (
                <BlinkItem 
                  key={blink.id} 
                  blink={blink} 
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </List.Section>
          );
        })
      ) : (
        sortedAndFilteredBlinks.map(blink => (
          <BlinkItem 
            key={blink.id} 
            blink={blink} 
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        ))
      )}
    </List>
  );
}
