import type { Difficulty } from "./types";

export const SUBMISSION_RECIPIENT = "jackmarkcharleslindgren@gmail.com";
export const SUBMISSION_SUBJECT = "Custom Sudoku Puzzle Submission";
export const FORMSUBMIT_AJAX_ENDPOINT =
	"https://formsubmit.co/ajax/jackmarkcharleslindgren@gmail.com";

const REQUEST_TIMEOUT_MS = 15_000;

export interface PuzzleSubmissionPayload {
	title: string;
	difficulty: Difficulty;
	submittedBy?: string;
	givens: string;
	solution: string;
}

export interface PuzzleSubmissionResult {
	ok: boolean;
	message: string;
}

interface NormalizedSubmissionFields {
	title: string;
	difficulty: Difficulty;
	submittedBy: string;
	givens: string;
	solution: string;
}

interface FormSubmitApiResponse {
	success?: unknown;
	message?: unknown;
}

function normalizeSubmissionFields(
	payload: PuzzleSubmissionPayload,
): NormalizedSubmissionFields {
	return {
		title: payload.title.trim() || "Untitled Puzzle",
		difficulty: payload.difficulty,
		submittedBy: payload.submittedBy?.trim() ?? "",
		givens: payload.givens.trim(),
		solution: payload.solution.trim(),
	};
}

/**
 * Formats the plain-text email body containing puzzle metadata, optional credit,
 * and validated 81-character givens and solution strings.
 */
export function formatSubmissionEmailBody(
	payload: PuzzleSubmissionPayload,
): string {
	const fields = normalizeSubmissionFields(payload);
	const lines: string[] = [
		`title: ${fields.title}`,
		`difficulty: ${fields.difficulty}`,
	];
	if (fields.submittedBy.length > 0) {
		lines.push(`submittedBy: ${fields.submittedBy}`);
	}
	lines.push(`givens: ${fields.givens}`);
	lines.push(`solution: ${fields.solution}`);
	return lines.join("\n");
}

/**
 * Builds a pre-filled mailto: fallback URL targeting the submission recipient.
 */
export function buildSubmissionMailtoUrl(
	payload: PuzzleSubmissionPayload,
): string {
	const body = formatSubmissionEmailBody(payload);
	return `mailto:${SUBMISSION_RECIPIENT}?subject=${encodeURIComponent(
		SUBMISSION_SUBJECT,
	)}&body=${encodeURIComponent(body)}`;
}

/**
 * Builds the JSON payload expected by FormSubmit's AJAX endpoint.
 */
export function buildFormSubmitRequestBody(
	payload: PuzzleSubmissionPayload,
): Record<string, string> {
	const fields = normalizeSubmissionFields(payload);
	const body: Record<string, string> = {
		_subject: SUBMISSION_SUBJECT,
		_template: "basic",
		_captcha: "false",
		title: fields.title,
		difficulty: fields.difficulty,
	};
	if (fields.submittedBy.length > 0) {
		body.submittedBy = fields.submittedBy;
	}
	body.givens = fields.givens;
	body.solution = fields.solution;
	return body;
}

/**
 * Sends a validated custom Sudoku puzzle to FormSubmit's AJAX email endpoint.
 */
export async function submitPuzzleViaEmail(
	payload: PuzzleSubmissionPayload,
	fetchImpl: typeof fetch = fetch,
): Promise<PuzzleSubmissionResult> {
	const fields = normalizeSubmissionFields(payload);
	if (
		!/^[0-9]{81}$/.test(fields.givens) ||
		!/^[1-9]{81}$/.test(fields.solution)
	) {
		return {
			ok: false,
			message: "Invalid puzzle givens or solution format.",
		};
	}

	const controller = new AbortController();
	const timeoutId = globalThis.setTimeout(
		() => controller.abort(),
		REQUEST_TIMEOUT_MS,
	);

	try {
		const response = await fetchImpl(FORMSUBMIT_AJAX_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(buildFormSubmitRequestBody(payload)),
			signal: controller.signal,
		});

		let data: FormSubmitApiResponse | null = null;
		try {
			data = (await response.json()) as FormSubmitApiResponse;
		} catch {
			data = null;
		}

		// FormSubmit can return HTTP 200 with string "false" on failure.
		if (response.ok && String(data?.success).toLowerCase() === "true") {
			return {
				ok: true,
				message: `Puzzle submitted! Sent to ${SUBMISSION_RECIPIENT}.`,
			};
		}

		const apiMessage =
			typeof data?.message === "string" && data.message.trim().length > 0
				? data.message.trim()
				: `Submission failed (HTTP ${response.status}). Retry or use the Email App fallback.`;
		return {
			ok: false,
			message: apiMessage,
		};
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			return {
				ok: false,
				message:
					"Email request timed out. Please retry or use the Email App fallback.",
			};
		}
		return {
			ok: false,
			message:
				"Could not reach the email service. Check your connection or use the Email App fallback.",
		};
	} finally {
		globalThis.clearTimeout(timeoutId);
	}
}
