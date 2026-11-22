import { useState } from "react";
import {
	Check,
	CheckCircle2,
	Copy,
	FileEdit,
	Plus,
	Save,
	Trash2,
	Upload,
} from "lucide-react";
import MiniSudokuPreview from "./MiniSudokuPreview";
import { parseImportString } from "./solver";
import { controls } from "./styles";
import {
	DIFFICULTIES,
	type CustomPuzzle,
	type Difficulty,
} from "./types";

interface SudokuCustomPanelProps {
	draftTitle: string;
	onChangeDraftTitle: (title: string) => void;
	draftDifficulty: Difficulty;
	onChangeDraftDifficulty: (difficulty: Difficulty) => void;
	clueCount: number;
	currentGivens: string;
	isTesting: boolean;
	hasUnsavedChanges: boolean;
	saveStatusMessage: string | null;
	customPuzzles: readonly CustomPuzzle[];
	activeDraftId: string | null;
	onNewCustomPuzzle: () => void;
	onSaveCustomPuzzle: () => void;
	onLoadCustomPuzzle: (puzzle: CustomPuzzle) => void;
	onDeleteCustomPuzzle: (id: string) => void;
	onImportGivens: (givens: string) => void;
}

const DIFFICULTY_BADGE_CLASSES: Record<Difficulty, string> = {
	Easy: "bg-emerald-950/70 text-emerald-300 border-emerald-700/60",
	Medium: "bg-sky-950/70 text-sky-300 border-sky-700/60",
	Hard: "bg-amber-950/70 text-amber-300 border-amber-700/60",
	Expert: "bg-rose-950/70 text-rose-300 border-rose-700/60",
};

export default function SudokuCustomPanel({
	draftTitle,
	onChangeDraftTitle,
	draftDifficulty,
	onChangeDraftDifficulty,
	clueCount,
	currentGivens,
	isTesting,
	hasUnsavedChanges,
	saveStatusMessage,
	customPuzzles,
	activeDraftId,
	onNewCustomPuzzle,
	onSaveCustomPuzzle,
	onLoadCustomPuzzle,
	onDeleteCustomPuzzle,
	onImportGivens,
}: SudokuCustomPanelProps) {
	const [copied, setCopied] = useState(false);
	const [showImport, setShowImport] = useState(false);
	const [importInput, setImportInput] = useState("");
	const [importError, setImportError] = useState<string | null>(null);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(currentGivens);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1800);
		} catch {
			// Ignore clipboard failures in restricted environments
		}
	};

	const handleImportSubmit = () => {
		const parsed = parseImportString(importInput);
		if (!parsed) {
			setImportError("Enter exactly 81 digits (0 or . for blanks).");
			return;
		}
		setImportError(null);
		setImportInput("");
		setShowImport(false);
		onImportGivens(parsed);
	};

	return (
		<aside
			aria-label="Custom puzzle manager"
			className={`${controls.cards} w-full max-w-md xl:w-64 2xl:w-76 shrink-0 p-3 flex flex-col gap-3`}
		>
			{/* Draft Metadata & Actions */}
			<div className="flex flex-col gap-2.5">
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold uppercase tracking-wider text-[#A6D6FF]">
						Custom Maker
					</span>
					<span className="text-[11px] font-medium text-[#ABD1FF]">
						{clueCount} givens
					</span>
				</div>

				<input
					type="text"
					value={draftTitle}
					disabled={isTesting}
					onChange={(e) => onChangeDraftTitle(e.target.value)}
					placeholder="Untitled Puzzle"
					aria-label="Custom puzzle title"
					maxLength={40}
					className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-[#46A7FC] focus:outline-none disabled:opacity-50"
				/>

				<div
					role="group"
					aria-label="Custom puzzle difficulty tag"
					className="grid grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-1.5"
				>
					{DIFFICULTIES.map((diff) => {
						const active = diff === draftDifficulty;
						return (
							<button
								key={diff}
								type="button"
								disabled={isTesting}
								onClick={() => onChangeDraftDifficulty(diff)}
								className={`${controls.buttons.spacing} px-2 text-center disabled:opacity-50 disabled:cursor-not-allowed ${
									active
										? controls.buttons.active
										: controls.buttons.inactive
								}`}
							>
								{diff}
							</button>
						);
					})}
				</div>

				<div className="grid grid-cols-2 gap-2">
					<button
						type="button"
						disabled={isTesting}
						onClick={onNewCustomPuzzle}
						className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-700 bg-slate-800/80 hover:border-[#5B98E0] text-xs font-semibold text-[#ABD1FF] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Plus className="size-3.5" />
						New Puzzle
					</button>

					<button
						type="button"
						disabled={isTesting}
						onClick={onSaveCustomPuzzle}
						className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
							hasUnsavedChanges
								? "border-[#46A7FC] bg-[#2A7CC3] hover:bg-[#348BD6] text-white"
								: "border-emerald-600/70 bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-100"
						}`}
					>
						<Save className="size-3.5" />
						{saveStatusMessage ?? "Save"}
					</button>
				</div>

				{/* Copy / Import 81-Char String */}
				<div className="flex flex-col gap-2 pt-1 border-t border-slate-800">
					<div className="grid grid-cols-2 gap-2">
						<button
							type="button"
							disabled={isTesting}
							onClick={handleCopy}
							className="inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded border border-slate-700/80 bg-slate-900/70 hover:border-slate-500 text-[11px] font-medium text-[#A6D6FF] transition-colors cursor-pointer disabled:opacity-50"
						>
							{copied ? (
								<Check className="size-3 text-emerald-300" />
							) : (
								<Copy className="size-3" />
							)}
							{copied ? "Copied!" : "Copy 81-Char"}
						</button>

						<button
							type="button"
							disabled={isTesting}
							onClick={() => {
								setShowImport((prev) => !prev);
								setImportError(null);
							}}
							aria-expanded={showImport}
							className="inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded border border-slate-700/80 bg-slate-900/70 hover:border-slate-500 text-[11px] font-medium text-[#A6D6FF] transition-colors cursor-pointer disabled:opacity-50"
						>
							<Upload className="size-3" />
							Import
						</button>
					</div>

					{showImport && !isTesting && (
						<div className="flex flex-col gap-1.5 rounded-md border border-slate-700 bg-slate-950/70 p-2">
							<input
								type="text"
								value={importInput}
								onChange={(e) => {
									setImportInput(e.target.value);
									setImportError(null);
								}}
								placeholder="Paste 81 chars (0 or . = blank)"
								aria-label="Import 81 character puzzle string"
								className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-mono text-white placeholder:text-slate-500 focus:border-[#46A7FC] focus:outline-none"
							/>
							{importError && (
								<span className="text-[11px] text-rose-300">
									{importError}
								</span>
							)}
							<button
								type="button"
								onClick={handleImportSubmit}
								className="px-2.5 py-1 rounded bg-[#2A7CC3] hover:bg-[#348BD6] text-xs font-semibold text-white transition-colors cursor-pointer"
							>
								Load String
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Created Puzzles List */}
			<div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold uppercase tracking-wider text-[#A6D6FF]">
						Your Puzzles
					</span>
					<span className="text-[11px] font-medium text-[#ABD1FF]">
						{customPuzzles.length} saved
					</span>
				</div>

				{customPuzzles.length === 0 ? (
					<p className="text-xs text-slate-400 rounded-lg border border-slate-700/60 bg-slate-900/40 p-3 text-center leading-relaxed">
						No saved custom puzzles yet. Place givens and click
						Save.
					</p>
				) : (
					<div className="flex flex-col gap-2 max-h-[300px] xl:max-h-[340px] overflow-y-auto pr-1">
						{customPuzzles.map((item) => {
							const isActive = item.id === activeDraftId;
							return (
								<div
									key={item.id}
									className={`w-full rounded-lg border p-2 flex flex-row items-center gap-2.5 transition-colors ${
										isActive
											? "border-[#46A7FC] bg-[#2B4563]/80"
											: "border-slate-700/70 bg-slate-900/50 hover:border-[#5B98E0] hover:bg-[#2B4563]/40"
									}`}
								>
									<button
										type="button"
										disabled={isTesting}
										onClick={() => onLoadCustomPuzzle(item)}
										aria-current={
											isActive ? "true" : undefined
										}
										className="flex-1 min-w-0 flex flex-row items-center gap-2.5 text-left cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
									>
										<MiniSudokuPreview
											givens={item.givens}
										/>

										<div className="flex-1 min-w-0 flex flex-col gap-1">
											<span className="text-xs font-semibold text-white truncate">
												{item.title}
											</span>

											<div className="flex items-center gap-1.5 flex-wrap">
												<span
													className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${DIFFICULTY_BADGE_CLASSES[item.difficulty]}`}
												>
													{item.difficulty}
												</span>
												<span
													className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
														item.isValidUnique
															? "bg-emerald-950/70 text-emerald-300 border-emerald-700/60"
															: "bg-amber-950/70 text-amber-300 border-amber-700/60"
													}`}
												>
													{item.isValidUnique ? (
														<CheckCircle2 className="size-2.5" />
													) : (
														<FileEdit className="size-2.5" />
													)}
													{item.isValidUnique
														? "Valid"
														: "Draft"}
												</span>
											</div>
										</div>
									</button>

									<button
										type="button"
										disabled={isTesting}
										onClick={(e) => {
											e.stopPropagation();
											onDeleteCustomPuzzle(item.id);
										}}
										aria-label={`Delete ${item.title}`}
										title={`Delete ${item.title}`}
										className="p-1.5 rounded-md text-slate-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
									>
										<Trash2 className="size-3.5" />
									</button>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</aside>
	);
}
