import { ActionPanel, Action, Icon, List, showToast, Toast } from "@raycast/api";
import { useEffect, useState, useMemo } from "react";
import { Blink, getBlinks, deleteBlink } from "./utils/storage";
import { getBlinkIcon, getBlinkTitle, getBlinkIconColor, BlinkType } from "./utils/design";

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

type SortOption = "newest" | "title";

interface BlinkItemProps {
  blink: Blink;
  onDelete: (id: string) => Promise<void>;
}

// Extracted BlinkItem component for better maintainability
const BlinkItem = ({ blink, onDelete }: BlinkItemProps) => (
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
        <Action.CopyToClipboard content={blink.title} />
        {blink.source && <Action.OpenInBrowser url={blink.source} />}
        <Action
          title="Delete Blink"
          icon={Icon.Trash}
          style={Action.Style.Destructive}
          onAction={() => onDelete(blink.id)}
        />
      </ActionPanel>
    }
  />
);

export default function Command() {
  const [blinks, setBlinks] = useState<Blink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSections, setShowSections] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    loadBlinks();
  }, []);

  async function loadBlinks() {
    try {
      const storedBlinks = await getBlinks();
      setBlinks(storedBlinks);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error loading blinks",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBlink(id);
      setBlinks(blinks.filter(blink => blink.id !== id));
      showToast({
        style: Toast.Style.Success,
        title: "Blink deleted",
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error deleting blink",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

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
      searchBarPlaceholder="Search blinks..."
      onSearchTextChange={setSearchText}
      searchBarAccessory={
        <List.Dropdown
          tooltip="View Options"
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
                <BlinkItem key={blink.id} blink={blink} onDelete={handleDelete} />
              ))}
            </List.Section>
          );
        })
      ) : (
        sortedAndFilteredBlinks.map(blink => (
          <BlinkItem key={blink.id} blink={blink} onDelete={handleDelete} />
        ))
      )}
    </List>
  );
}
