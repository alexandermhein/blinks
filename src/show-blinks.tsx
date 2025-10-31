/**
 * Show Blinks: lists, filters, and groups Blinks with lightweight cleanup.
 */
import { Icon, List } from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import BlinkItem from "./components/blink-item";
import type { Blink, SortOption } from "./types/blinks";
import { getBlinkTitle } from "./utils/design";
import type { BlinkType } from "./utils/design";
import {
	cleanupCompletedReminders,
	deleteBlink,
	getBlinks,
	markCleanupRun,
	shouldRunCleanup,
	toggleBlinkCompletion,
} from "./utils/storage";
import { showFailure, showSuccess } from "./utils/toast";

// Use shared date formatter

// Define fixed category order
const CATEGORY_ORDER: BlinkType[] = [
	"reminder",
	"thought",
	"bookmark",
	"quote",
];

export default function Command() {
	const [blinks, setBlinks] = useState<Blink[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showSections, setShowSections] = useState(true);
	const [searchText, setSearchText] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("newest");

	const loadBlinks = useCallback(async () => {
		try {
			if (await shouldRunCleanup()) {
				await cleanupCompletedReminders();
				await markCleanupRun();
			}
			const storedBlinks = await getBlinks();
			setBlinks(storedBlinks);
		} catch (error) {
			showFailure(
				"Error loading Blinks",
				error instanceof Error ? error.message : "Unknown error occurred",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadBlinks();
	}, [loadBlinks]);

	const handleDelete = useCallback(async (id: string) => {
		try {
			await deleteBlink(id);
			setBlinks((prevBlinks) => prevBlinks.filter((blink) => blink.id !== id));
			showSuccess("Blink deleted");
		} catch (error) {
			showFailure(
				"Error deleting Blink",
				error instanceof Error ? error.message : "Unknown error occurred",
			);
		}
	}, []);

	const handleToggle = useCallback(async (id: string) => {
		await toggleBlinkCompletion(id);
		setBlinks((prevBlinks) =>
			prevBlinks.map((blink) =>
				blink.id === id ? { ...blink, isCompleted: !blink.isCompleted } : blink,
			),
		);
	}, []);

	// Optimized sorting and filtering using useMemo
	const { sortedAndFilteredBlinks, groupedBlinks } = useMemo(() => {
		const filtered = blinks.filter((blink) =>
			blink.title.toLowerCase().includes(searchText.toLowerCase()),
		);

		const sorted = [...filtered].sort((a, b) => {
			// Special handling for reminders - sort by reminder date
			if (a.type === "reminder" && b.type === "reminder") {
				const dateA = new Date(a.reminderDate || "");
				const dateB = new Date(b.reminderDate || "");
				return dateA.getTime() - dateB.getTime();
			}

			// For non-reminders or mixed types, use the selected sort option
			if (sortBy === "newest") {
				return (
					new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
				);
			}
			return a.title.localeCompare(b.title);
		});

		const grouped = sorted.reduce(
			(acc, blink) => {
				if (!acc[blink.type]) {
					acc[blink.type] = [];
				}
				acc[blink.type].push(blink);
				return acc;
			},
			{} as Record<string, Blink[]>,
		);

		// Ensure per-category sort is applied when title sorting selected
		if (sortBy === "title") {
			for (const type of Object.keys(grouped)) {
				grouped[type].sort((a: Blink, b: Blink) =>
					a.title.localeCompare(b.title),
				);
			}
		}

		return { sortedAndFilteredBlinks: sorted, groupedBlinks: grouped };
	}, [blinks, searchText, sortBy]);

	if (!isLoading && blinks.length === 0) {
		return (
			<List>
				<List.EmptyView
					icon={Icon.BlankDocument}
					title="No Blinks Yet"
					description="Capture your first Blink to get started!"
				/>
			</List>
		);
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
			{showSections
				? CATEGORY_ORDER.map((type) => {
						const typeBlinks = groupedBlinks[type] || [];
						if (typeBlinks.length === 0) return null;
						return (
							<List.Section key={type} title={getBlinkTitle(type)}>
								{typeBlinks.map((blink: Blink) => (
									<BlinkItem
										key={blink.id}
										blink={blink}
										onDelete={handleDelete}
										onToggle={handleToggle}
										onRefresh={loadBlinks}
									/>
								))}
							</List.Section>
						);
					})
				: sortedAndFilteredBlinks.map((blink: Blink) => (
						<BlinkItem
							key={blink.id}
							blink={blink}
							onDelete={handleDelete}
							onToggle={handleToggle}
							onRefresh={loadBlinks}
						/>
					))}
		</List>
	);
}
