import { useEffect, useRef, useState } from "react";
import {
	AlertCircle,
	Check,
	Copy,
	Loader2,
	Mail,
	Send,
	X,
} from "lucide-react";
import {
	SUBMISSION_RECIPIENT,
	SUBMISSION_SUBJECT,
	buildSubmissionMailtoUrl,
	formatSubmissionEmailBody,
	type PuzzleSubmissionPayload,
} from "./submit";
import type { Difficulty } from "./types";

interface SudokuSubmitModalProps {
	isOpen: boolean;
	title: string;
	difficulty: Difficulty;
	clueCount: number;
	givens: string;
	solution: string;
	submitterName: string;
	onChangeSubmitterName: (name: string) => void;
	isSubmitting: boolean;
	errorMessage: string | null;
	onCancel: () => void;
	onConfirmSubmit: () => void;
}

const DIFFICULTY_BADGE_CLASSES: Record<Difficulty, string> = {
	Easy: "bg-emerald-950/70 text-emerald-300 border-emerald-700/60",
	Medium: "bg-sky-950/70 text-sky-300 border-sky-700/60",
	Hard: "bg-amber-950/70 text-amber-300 border-amber-700/60",
	Expert: "bg-rose-950/70 text-rose-300 border-rose-700/60",
};

/**
 * Confirmation modal that previews the validated custom Sudoku puzzle payload
 * before sending it via email, with copy and mailto: fallback actions.
 */
export default function SudokuSubmitModal({
	isOpen,
	title,
	difficulty,
	clueCount,
	givens,
	solution,
	submitterName,
	onChangeSubmitterName,
	isSubmitting,
	errorMessage,
	onCancel,
	onConfirmSubmit,
}: SudokuSubmitModalProps) {
	const [copied, setCopied] = useState(false);
	const copyTimerRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (copyTimerRef.current !== null) {
				window.clearTimeout(copyTimerRef.current);
			}
		};
	}, []);

	if (!isOpen) return null;

	const cleanTitle = title.trim() || "Untitled Puzzle";
	const payload: PuzzleSubmissionPayload = {
		title: cleanTitle,
		difficulty,
		submittedBy: submitterName,
		givens,
		solution,
	};
	const emailBody = formatSubmissionEmailBody(payload);
	const mailtoUrl = buildSubmissionMailtoUrl(payload);

	const handleCopyEmail = async () => {
		try {
			await navigator.clipboard.writeText(
				`Subject: ${SUBMISSION_SUBJECT}\n\n${emailBody}`,
			);
			if (copyTimerRef.current !== null) {
				window.clearTimeout(copyTimerRef.current);
			}
			setCopied(true);
			copyTimerRef.current = window.setTimeout(() => {
				setCopied(false);
				copyTimerRef.current = null;
			}, 1800);
		} catch {
			// Ignore clipboard failures in restricted environments
		}
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="sudoku-submit-title"
			onClick={() => {
				if (!isSubmitting) onCancel();
			}}
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[#2A7CC3]/60 bg-[#1E304A] p-6 shadow-2xl flex flex-col gap-4 relative"
			>
				<button
					type="button"
					disabled={isSubmitting}
					onClick={onCancel}
					aria-label="Close submission modal"
					className="absolute top-4 right-4 text-[#ABD1FF] hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<X className="size-5" />
				</button>

				{/* Modal Header */}
				<div className="flex flex-col items-center text-center gap-2 pt-1">
					<div className="size-12 rounded-full bg-[#2A7CC3]/30 border border-[#46A7FC]/60 flex items-center justify-center text-[#A6D6FF]">
						<Send className="size-5" />
					</div>
					<h2
						id="sudoku-submit-title"
						className="text-xl font-bold text-white"
					>
						Submit Custom Puzzle
					</h2>
					<p className="text-xs text-[#ABD1FF]">
						To:{" "}
						<span className="font-mono text-[#A6D6FF]">
							{SUBMISSION_RECIPIENT}
						</span>
					</p>
				</div>

				{/* Metadata Strip */}
				<div className="rounded-lg border border-[#0E1F37] bg-slate-950/70 px-3.5 py-2.5 flex flex-row flex-wrap items-center justify-between gap-2">
					<span className="text-sm font-semibold text-white truncate max-w-[230px]">
						{cleanTitle}
					</span>
					<div className="flex items-center gap-2">
						<span
							className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${DIFFICULTY_BADGE_CLASSES[difficulty]}`}
						>
							{difficulty}
						</span>
						<span className="text-xs text-emerald-300 font-medium">
							{clueCount} givens · Unique solution
						</span>
					</div>
				</div>

				{/* Optional Submitter Credit */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="sudoku-submitter-name"
						className="text-xs font-semibold uppercase tracking-wider text-[#A6D6FF]"
					>
						Your Name / Credit (optional)
					</label>
					<input
						id="sudoku-submitter-name"
						type="text"
						value={submitterName}
						onChange={(e) => onChangeSubmitterName(e.target.value)}
						placeholder="Leave blank to submit anonymously"
						maxLength={50}
						disabled={isSubmitting}
						className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#46A7FC] focus:outline-none disabled:opacity-50"
					/>
				</div>

				{/* Email Content Preview */}
				<div className="rounded-lg border border-[#0E1F37] bg-slate-950/80 p-3 flex flex-col gap-2">
					<div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
						<span className="text-xs text-[#ABD1FF] truncate">
							<span className="font-semibold text-[#A6D6FF]">
								Subject:
							</span>{" "}
							{SUBMISSION_SUBJECT}
						</span>
						<button
							type="button"
							onClick={handleCopyEmail}
							className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-700 bg-slate-900 hover:border-[#46A7FC] text-[11px] font-medium text-[#A6D6FF] transition-colors cursor-pointer shrink-0"
						>
							{copied ? (
								<Check className="size-3 text-emerald-300" />
							) : (
								<Copy className="size-3" />
							)}
							{copied ? "Copied!" : "Copy Email"}
						</button>
					</div>
					<pre className="whitespace-pre-wrap break-all font-mono text-xs text-slate-200 leading-relaxed select-all">
						{emailBody}
					</pre>
				</div>

				{/* Error Banner + Fallback Actions */}
				{errorMessage && (
					<div
						role="alert"
						className="rounded-lg border border-rose-500/70 bg-rose-950/60 p-3 flex flex-col gap-2.5 text-xs text-rose-100"
					>
						<div className="flex items-start gap-2">
							<AlertCircle className="size-4 text-rose-300 shrink-0 mt-0.5" />
							<span className="leading-relaxed">
								{errorMessage}
							</span>
						</div>
						<div className="flex flex-row flex-wrap items-center gap-2">
							<a
								href={mailtoUrl}
								className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-rose-400/60 bg-rose-900/50 hover:bg-rose-800/60 text-xs font-semibold text-white transition-colors"
							>
								<Mail className="size-3.5" />
								Open in Email App
							</a>
							<button
								type="button"
								onClick={handleCopyEmail}
								className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-600 bg-slate-900/70 hover:border-slate-400 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
							>
								<Copy className="size-3.5" />
								Copy Email Text
							</button>
						</div>
					</div>
				)}

				{/* Primary Modal Actions */}
				<div className="flex flex-row gap-3 pt-1">
					<button
						type="button"
						disabled={isSubmitting}
						onClick={onCancel}
						className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:border-slate-500 text-sm font-semibold text-slate-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
					<button
						type="button"
						disabled={isSubmitting}
						onClick={onConfirmSubmit}
						className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2A7CC3] hover:bg-[#348BD6] border border-[#46A7FC] text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
					>
						{isSubmitting ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Sending...
							</>
						) : (
							<>
								<Send className="size-4" />
								{errorMessage ? "Retry Send" : "Confirm & Send"}
							</>
						)}
					</button>
				</div>

				{/* Secondary Email Client Link */}
				<div className="text-center text-[11px] text-slate-400">
					Prefer your email client?{" "}
					<a
						href={mailtoUrl}
						className="text-[#A6D6FF] hover:text-white underline underline-offset-2 transition-colors"
					>
						Open in Email App
					</a>
				</div>
			</div>
		</div>
	);
}
