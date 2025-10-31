import { Action, ActionPanel, Form, Toast, useNavigation } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import type { Blink } from "../types/blinks";
import { type BlinkType, isValidBlinkType } from "../utils/design";
import { updateBlink } from "../utils/storage";
import { showFailure, showSuccess } from "../utils/toast";

interface EditBlinkFormProps {
	blink: Blink;
	onSuccess?: () => void;
}

interface BlinkValues {
	type: BlinkType;
	title: string;
	source: string;
	reminderDate?: Date;
	author?: string;
	description?: string;
}

export default function EditBlinkForm({
	blink,
	onSuccess,
}: EditBlinkFormProps) {
	const { pop } = useNavigation();
	const { handleSubmit, itemProps, setValue } = useForm<BlinkValues>({
		initialValues: {
			type: blink.type,
			title: blink.title,
			source: blink.source || "",
			reminderDate: blink.reminderDate
				? new Date(blink.reminderDate)
				: undefined,
			author: blink.author || "",
			description: blink.description || "",
		},
		onSubmit(values) {
			if (!isValidBlinkType(values.type)) {
				showFailure("Invalid Blink", "Please select a valid Blink type");
				return;
			}

			if (values.type === "reminder" && !values.reminderDate) {
				showFailure("Missing reminder date", "Please select a date");
				return;
			}

			const updatedBlink = {
				...blink,
				type: values.type,
				title: values.title,
				...(itemProps.source.value ? { source: itemProps.source.value } : {}),
				...(values.type === "reminder" && values.reminderDate
					? { reminderDate: values.reminderDate }
					: {}),
				...(values.type === "quote" && values.author
					? { author: values.author }
					: {}),
				...(values.description ? { description: values.description } : {}),
			};

			updateBlink(updatedBlink)
				.then(() => {
					showSuccess("Blink updated", `"${values.title}" saved`);
					onSuccess?.();
					pop();
				})
				.catch((error) => {
					showFailure(
						"Error updating Blink",
						error instanceof Error ? error.message : "Unknown error occurred",
					);
				});
		},
		validation: {
			title: FormValidation.Required,
		},
	});

	const handleTypeChange = (value: string) => {
		if (isValidBlinkType(value)) {
			setValue("type", value);
			if (value !== "reminder") {
				setValue("reminderDate", undefined);
			}
		}
	};

	return (
		<Form
			actions={
				<ActionPanel>
					<Action.SubmitForm
						title="Update Blink"
						onSubmit={handleSubmit}
						shortcut={{ modifiers: ["cmd"], key: "return" }}
					/>
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
			{itemProps.type.value === "reminder" && (
				<Form.DatePicker
					id="reminderDate"
					title="Date"
					type={Form.DatePicker.Type.DateTime}
					value={itemProps.reminderDate?.value}
					onChange={(date) => setValue("reminderDate", date || undefined)}
				/>
			)}
			{itemProps.type.value === "reminder" ? (
				<Form.TextField
					title="Blink"
					placeholder="Capture a Blink ..."
					{...itemProps.title}
				/>
			) : (
				<Form.TextArea
					title="Blink"
					placeholder="Capture a Blink ..."
					{...itemProps.title}
				/>
			)}
			{itemProps.type.value === "reminder" && (
				<Form.TextArea
					title="Description"
					placeholder="Add context or notes about the reminder"
					{...itemProps.description}
				/>
			)}
			{itemProps.type.value === "quote" && (
				<>
					<Form.TextField
						title="Author"
						placeholder="Enter the author's name"
						{...itemProps.author}
					/>
					<Form.TextArea
						title="Description"
						placeholder="Add context or notes about the quote"
						{...itemProps.description}
					/>
				</>
			)}
			{blink.source && (
				<Form.TextField
					title="Source"
					placeholder="https://example.com"
					{...itemProps.source}
				/>
			)}
		</Form>
	);
}
