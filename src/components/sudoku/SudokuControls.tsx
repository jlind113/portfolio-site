import {
	CheckSquare,
	CornerUpLeft,
	Eraser,
	Eye,
	Grid3X3,
	Lightbulb,
	PenLine,
	Pencil,
	Redo2,
	ShieldAlert,
	Sparkles,
	Undo2,
} from "lucide-react";
import type { HighlightSettings, InputMode } from "./types";
import { controls } from './styles';

interface SudokuControlsProps {
	inputMode: InputMode;
	onChangeInputMode: (mode: InputMode) => void;
	isMultiSelectMode: boolean;
	selectedCount: number;
	onToggleMultiSelectMode: () => void;
	onClearSelection: () => void;
	digitCounts: Record<number, number>;
	onDigitInput: (digit: number) => void;
	canUndo: boolean;
	canRedo: boolean;
	undoCount: number;
	redoCount: number;
	onUndo: () => void;
	onRedo: () => void;
	onErase: () => void;
	onHint: () => void;
	onAutoNotes: () => void;
	highlightSettings: HighlightSettings;
	onToggleHighlightSetting: (key: keyof HighlightSettings) => void;
	disabled: boolean;
	isSolved: boolean;
}

const MODE_LABELS: Record<
	InputMode,
	{ label: string; hint: string; badgeClass: string }
> = {
	normal: {
		label: "Normal Digit",
		hint: "Enters main cell value",
		badgeClass: "text-purple-200 border-purple-500/70 bg-purple-900/50",
	},
	corner: {
		label: "Corner Pencil",
		hint: "Toggles corner marks on selected cell(s)",
		badgeClass: "text-sky-200 border-sky-500/70 bg-sky-900/50",
	},
	center: {
		label: "Center Pencil",
		hint: "Toggles centered marks on selected cell(s)",
		badgeClass: "text-emerald-200 border-emerald-500/70 bg-emerald-900/50",
	},
};

export default function SudokuControls({
	inputMode,
	onChangeInputMode,
	isMultiSelectMode,
	selectedCount,
	onToggleMultiSelectMode,
	onClearSelection,
	digitCounts,
	onDigitInput,
	canUndo,
	canRedo,
	undoCount,
	redoCount,
	onUndo,
	onRedo,
	onErase,
	onHint,
	onAutoNotes,
	highlightSettings,
	onToggleHighlightSetting,
	disabled,
	isSolved,
}: SudokuControlsProps) {
	const modeMeta =
		selectedCount > 1
			? {
					label: "Corner Pencil (Multi)",
					hint: "Toggles corner marks on selected cells",
					badgeClass: "text-[#A6D6FF] border-[#A6D6FF] bg-sky-900/50",
				}
			: MODE_LABELS[inputMode];
	const effectivePadMode: InputMode =
		selectedCount > 1 ? "corner" : inputMode;

	return (
		<div className="flex flex-col gap-4 w-full max-w-sm xl:w-72 2xl:w-84 shrink-0">
			{/* Pencil / Input Mode Switcher */}
			<div className={`${controls.cards} p-4 flex flex-col gap-3`}>
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold uppercase tracking-wider text-[#A6D6FF]">
						Input Mode
					</span>
					<span
						className={`text-[11px] font-medium px-2 py-0.5 rounded border ${modeMeta.badgeClass}`}
					>
						{modeMeta.label}
					</span>
				</div>

				<div className="grid grid-cols-3 gap-2">
					<button
						type="button"
						disabled={disabled}
						onClick={() => onChangeInputMode("normal")}
						aria-pressed={inputMode === "normal"}
						className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
							inputMode === "normal"
								? "bg-purple-900/60 border-purple-400 text-[#A6D6FF]"
								: "bg-slate-800/70 border-slate-700 text-[#A6D6FF] hover:border-slate-500"
						}`}
					>
						<PenLine className="size-4" />
						<span>Normal</span>
						<span className="text-[10px] font-normal text-[#A6D6FF]">
							Key Z
						</span>
					</button>

					<button
						type="button"
						disabled={disabled}
						onClick={() => onChangeInputMode("corner")}
						aria-pressed={inputMode === "corner"}
						className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
							inputMode === "corner"
								? "bg-sky-900/60 border-sky-400 text-[#A6D6FF]"
								: "bg-slate-800/70 border-slate-700 text-[#A6D6FF] hover:border-slate-500"
						}`}
					>
						<CornerUpLeft className="size-4" />
						<span>Corner</span>
						<span className="text-[10px] font-normal text-[#A6D6FF]">
							Key N / X
						</span>
					</button>

					<button
						type="button"
						disabled={disabled}
						onClick={() => onChangeInputMode("center")}
						aria-pressed={inputMode === "center"}
						className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
							inputMode === "center"
								? "bg-emerald-900/60 border-emerald-400 text-[#A6D6FF]"
								: "bg-slate-800/70 border-slate-700 text-[#A6D6FF] hover:border-slate-500"
						}`}
					>
						<Pencil className="size-4" />
						<span>Center</span>
						<span className="text-[10px] font-normal text-[#A6D6FF]">
							Key C
						</span>
					</button>
				</div>

				{/* Multi-Select Mode & Selection Counter */}
				<div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
					<button
						type="button"
						disabled={disabled}
						onClick={onToggleMultiSelectMode}
						aria-pressed={isMultiSelectMode}
						className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
							isMultiSelectMode
								? "bg-purple-700/50 border-purple-300 text-[#A6D6FF]"
								: "bg-slate-800/70 border-slate-700 text-[#A6D6FF] hover:border-slate-500"
						}`}
					>
						<CheckSquare className="size-3.5" />
						<span>Multi-Select</span>
					</button>

					<div className="flex items-center gap-2">
						<span className="text-xs text-[#A6D6FF]">
							<strong className="text-[#A6D6FF]">
								{selectedCount}
							</strong>{" "}
							selected
						</span>
						{selectedCount > 1 && (
							<button
								type="button"
								disabled={disabled}
								onClick={onClearSelection}
								className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 hover:border-slate-500 text-[11px] font-medium text-[#A6D6FF] transition-colors cursor-pointer disabled:opacity-50"
							>
								Clear
							</button>
						)}
					</div>
				</div>

				<p className="text-xs text-[#A6D6FF] leading-relaxed">
					Selecting multiple cells always enters{" "}
					<span className="text-[#A6D6FF] font-medium">Corner</span>{" "}
					marks. Clicking{" "}
					<span className="text-[#A6D6FF] font-medium">Corner</span> or{" "}
					<span className="text-[#A6D6FF] font-medium">Center</span>{" "}
					on a cell with pencil marks converts its mark type.
				</p>
			</div>

			{/* Number Pad 1-9 */}
			<div className={`${controls.cards} p-4 flex flex-col gap-3`}>
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold uppercase tracking-wider text-[#A6D6FF]">
						Number Pad
					</span>
					<span className="text-[11px] text-[#A6D6FF]">
						{modeMeta.hint}
					</span>
				</div>

				<div className="grid grid-cols-3 gap-2">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
						const placed = digitCounts[digit] ?? 0;
						const remaining = Math.max(0, 9 - placed);
						const isCompleted = placed >= 9;

						const activePadStyle =
							effectivePadMode === "corner"
								? "hover:border-sky-400/70 focus-visible:ring-sky-400"
								: effectivePadMode === "center"
									? "hover:border-emerald-400/70 focus-visible:ring-emerald-400"
									: "hover:border-purple-400/70 focus-visible:ring-purple-400";

						return (
							<button
								key={digit}
								type="button"
								disabled={disabled || isSolved}
								onClick={() => onDigitInput(digit)}
								className={`relative h-12 rounded-lg border bg-slate-800/80 border-slate-700 flex flex-col items-center justify-center transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${activePadStyle} ${
									isCompleted && effectivePadMode === "normal"
										? "opacity-55"
										: ""
								}`}
							>
								<span className="text-lg font-bold text-[#A6D6FF] leading-none">
									{digit}
								</span>
								<span className="text-[10px] text-[#A6D6FF] leading-none mt-1">
									{isCompleted ? "done" : `${remaining} left`}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Action Toolbar */}
			<div className={`${controls.cards} p-3 grid grid-cols-5 gap-1.5`}>
				<button
					type="button"
					disabled={disabled || isSolved || !canUndo}
					onClick={onUndo}
					title="Undo (Ctrl+Z)"
					className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-md border border-slate-700/70 bg-slate-800/60 hover:border-slate-500 text-[#A6D6FF] text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Undo2 className="size-4" />
					<span>Undo</span>
					<span className="text-[9px] text-slate-400">
						{undoCount}
					</span>
				</button>

				<button
					type="button"
					disabled={disabled || isSolved || !canRedo}
					onClick={onRedo}
					title="Redo (Ctrl+Y)"
					className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-md border border-slate-700/70 bg-slate-800/60 hover:border-slate-500 text-[#A6D6FF] text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Redo2 className="size-4" />
					<span>Redo</span>
					<span className="text-[9px] text-slate-400">
						{redoCount}
					</span>
				</button>

				<button
					type="button"
					disabled={disabled || isSolved}
					onClick={onErase}
					title="Erase selected cell(s) (Backspace)"
					className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-md border border-slate-700/70 bg-slate-800/60 hover:border-slate-500 text-[#A6D6FF] text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Eraser className="size-4" />
					<span>Erase</span>
					<span className="text-[9px] text-slate-400">Del</span>
				</button>

				<button
					type="button"
					disabled={disabled || isSolved}
					onClick={onHint}
					title="Reveal a valid cell"
					className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-md border border-slate-700/70 bg-slate-800/60 hover:border-amber-500/60 text-[#A6D6FF] text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Lightbulb className="size-4" />
					<span>Hint</span>
					<span className="text-[9px] text-slate-400">Solve 1</span>
				</button>

				<button
					type="button"
					disabled={disabled || isSolved}
					onClick={onAutoNotes}
					title="Fill valid candidate pencil marks for empty cells"
					className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-md border border-slate-700/70 bg-slate-800/60 hover:border-emerald-500/60 text-[#A6D6FF] text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Sparkles className="size-4" />
					<span>Notes</span>
					<span className="text-[9px] text-slate-400">Auto</span>
				</button>
			</div>

			{/* Visual Assistance & Error Checking Toggles */}
			<div className={`${controls.cards} p-4 flex flex-col gap-3`}>
				<span className="text-xs font-semibold uppercase tracking-wider text-[#A6D6FF]">
					Assistance &amp; Highlighting
				</span>

				<ToggleRow
					icon={<Grid3X3 className="size-4 text-[#A6D6FF]" />}
					label="Row / Column / Cage"
					description="Highlight peers of focused cell"
					checked={highlightSettings.highlightPeers}
					onToggle={() => onToggleHighlightSetting("highlightPeers")}
				/>

				<ToggleRow
					icon={<Eye className="size-4 text-[#A6D6FF]" />}
					label="Digits & Candidates"
					description="Highlight matching numbers & marks"
					checked={highlightSettings.highlightCandidates}
					onToggle={() =>
						onToggleHighlightSetting("highlightCandidates")
					}
				/>

				<ToggleRow
					icon={<ShieldAlert className="size-4 text-[#A6D6FF]" />}
					label="Error Checking"
					description="Flag conflicts and wrong entries"
					checked={highlightSettings.errorChecking}
					onToggle={() => onToggleHighlightSetting("errorChecking")}
				/>
			</div>
		</div>
	);
}

interface ToggleRowProps {
	icon: React.ReactNode;
	label: string;
	description: string;
	checked: boolean;
	onToggle: () => void;
}

function ToggleRow({
	icon,
	label,
	description,
	checked,
	onToggle,
}: ToggleRowProps) {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="flex items-start gap-2.5">
				<div className="mt-0.5 shrink-0">{icon}</div>
				<div className="flex flex-col">
					<span className="text-sm font-medium text-[#A6D6FF] leading-tight">
						{label}
					</span>
					<span className="text-xs text-[#A6D6FF] leading-tight mt-0.5">
						{description}
					</span>
				</div>
			</div>

			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-label={label}
				onClick={onToggle}
				className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors cursor-pointer ${
					checked
						? "bg-[#2A7CC3] border-[#46A7FC]"
						: "bg-slate-800 border-slate-600"
				}`}
			>
				<span
					className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
						checked ? "translate-x-5" : "translate-x-1"
					}`}
				/>
			</button>
		</div>
	);
}
