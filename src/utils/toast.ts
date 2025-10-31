import { Toast, showToast } from "@raycast/api";

export async function showSuccess(
	title: string,
	message?: string,
): Promise<Toast.Toast> {
	return await showToast({ style: Toast.Style.Success, title, message });
}

export async function showFailure(
	title: string,
	message?: string,
): Promise<Toast.Toast> {
	return await showToast({ style: Toast.Style.Failure, title, message });
}

export async function showLoading(
	title: string,
	message?: string,
): Promise<Toast.Toast> {
	return await showToast({ style: Toast.Style.Animated, title, message });
}
