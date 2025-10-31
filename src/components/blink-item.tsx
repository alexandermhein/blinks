/**
 * BlinkItem: renders a single Blink with actions to view, edit, toggle, and delete.
 */
import {
	Action,
	ActionPanel,
	Icon,
	List,
	Toast,
	showToast,
} from "@raycast/api";
import { memo } from "react";
import type { BlinkItemProps } from "../types/blinks";
import { formatDate } from "../utils/date";
import {
	getBlinkColor,
	getBlinkIcon,
	getBlinkIconColor,
} from "../utils/design";
import BlinkDetail from "./blink-detail";
import EditBlinkForm from "./edit-blink-form";

const BlinkItem = memo(
	({ blink, onDelete, onToggle, onRefresh }: BlinkItemProps) => {
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
					message:
						error instanceof Error ? error.message : "Unknown error occurred",
				});
			}
		};

		const commonActions = (
			<>
				<Action.Push
					title="View Blink"
					icon={Icon.Info}
					target={<BlinkDetail blink={blink} onDelete={onDelete} />}
				/>
				{blink.source && (
					<Action.OpenInBrowser
						url={blink.source}
						shortcut={{ modifiers: ["cmd"], key: "l" }}
					/>
				)}
				<Action.Push
					title="Edit Blink"
					icon={Icon.Pencil}
					shortcut={{ modifiers: ["cmd"], key: "e" }}
					target={<EditBlinkForm blink={blink} onSuccess={onRefresh} />}
				/>
			</>
		);

		const deleteAction = (
			<Action
				title="Delete Blink"
				icon={Icon.Trash}
				style={Action.Style.Destructive}
				shortcut={{ modifiers: ["cmd"], key: "backspace" }}
				onAction={() => onDelete(blink.id)}
			/>
		);

		if (blink.type === "reminder") {
			return (
				<List.Item
					key={blink.id}
					icon={{
						source: blink.isCompleted ? Icon.Checkmark : Icon.Circle,
						tintColor: getBlinkColor(blink.type),
					}}
					title={blink.title}
					subtitle={blink.description}
					accessories={[
						...(blink.source
							? [{ icon: Icon.Link, tooltip: blink.source }]
							: []),
						...(blink.reminderDate
							? [
									{
										tag: {
											value: formatDate(blink.reminderDate),
											color: getBlinkColor(blink.type),
										},
									},
								]
							: []),
						{ text: formatDate(blink.createdOn) },
					]}
					actions={
						<ActionPanel>
							{commonActions}
							<Action
								icon={blink.isCompleted ? Icon.Undo : Icon.Checkmark}
								title={blink.isCompleted ? "Reset Reminder" : "Remove Reminder"}
								shortcut={{ modifiers: ["cmd"], key: "return" }}
								onAction={handleToggle}
							/>
							{deleteAction}
						</ActionPanel>
					}
				/>
			);
		}

		return (
			<List.Item
				key={blink.id}
				icon={{
					source: getBlinkIcon(blink.type),
					tintColor: getBlinkIconColor(blink.type),
				}}
				title={blink.title}
				subtitle={blink.type === "quote" ? blink.author : blink.description}
				accessories={[
					...(blink.source ? [{ icon: Icon.Link, tooltip: blink.source }] : []),
					{ text: formatDate(blink.createdOn) },
				]}
				actions={
					<ActionPanel>
						{commonActions}
						{deleteAction}
					</ActionPanel>
				}
			/>
		);
	},
);

BlinkItem.displayName = "BlinkItem";

export default BlinkItem;
