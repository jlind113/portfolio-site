import { CheckCircle2, Circle, Clock, Hammer } from "lucide-react";
import MiniSudokuPreview from "./MiniSudokuPreview";
import { controls } from "./styles";
import {
	LEVEL_FILTERS,
	type Difficulty,
	type LevelFilter,
	type PuzzleDefinition,
	type PuzzleProgressMap,
} from "./types";
import { formatTime } from "./utils";

interface SudokuLevelSelectorProps {
	selectedDifficulty: LevelFilter;
	onSelectDifficulty: (filter: LevelFilter) => void;
	puzzles: readonly PuzzleDefinition[];
	activePuzzleId: string;
	progressMap: PuzzleProgressMap;
	onSelectPuzzle: (puzzle: PuzzleDefinition) => void;
	onOpenCustomMaker?: () => void;
}

const DIFFICULTY_BADGE_CLASSES: Record<Difficulty, string> = {
	Easy: "bg-emerald-950/70 text-emerald-300 border-emerald-700/60",
	Medium: "bg-sky-950/70 text-sky-300 border-sky-700/60",
	Hard: "bg-amber-950/70 text-amber-300 border-amber-700/60",
	Expert: "bg-rose-950/70 text-rose-300 border-rose-700/60",
};

export default function SudokuLevelSelector({
	selectedDifficulty,
	onSelectDifficulty,
	puzzles,
	activePuzzleId,
	progressMap,
	onSelectPuzzle,
	onOpenCustomMaker,
}: SudokuLevelSelectorProps) {
	const completedCount = puzzles.filter(
		(item) => progressMap[item.id]?.completed,
	).length;

	return (
		<aside
			aria-label="Level selection"
			className={`${controls.cards} w-full max-w-md xl:w-64 2xl:w-76 shrink-0 p-3 flex flex-col gap-3`}
		>
			{/* Header + Difficulty Filter */}
			<div className="flex flex-col gap-2.5">
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold uppercase tracking-wider text-[#A6D6FF]">
						Levels
					</span>
					<span className="text-[11px] font-medium text-[#ABD1FF]">
						{completedCount}/{puzzles.length} beaten
					</span>
				</div>

				<div
					role="group"
					aria-label="Difficulty selection"
					className="grid grid-cols-3 sm:grid-cols-5 xl:grid-cols-2 2xl:grid-cols-3 gap-1.5"
				>
					{LEVEL_FILTERS.map((filter) => {
						const active = filter === selectedDifficulty;
						return (
							<button
								key={filter}
								type="button"
								onClick={() => onSelectDifficulty(filter)}
								className={`${controls.buttons.spacing} px-2 text-center ${
									active
										? controls.buttons.active
										: controls.buttons.inactive
								}`}
							>
								{filter}
							</button>
						);
					})}
				</div>
			</div>

			{/* Scrollable Level List */}
			{selectedDifficulty === "Custom" && puzzles.length === 0 ? (
				<div className="rounded-lg border border-slate-700/70 bg-slate-900/40 p-4 flex flex-col items-center text-center gap-3">
					<p className="text-xs text-slate-300 leading-relaxed">
						No valid custom puzzles yet. Create and validate a
						puzzle in the Custom Puzzle Maker to play it here.
					</p>
					{onOpenCustomMaker && (
						<button
							type="button"
							onClick={onOpenCustomMaker}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#46A7FC] bg-[#2A7CC3] hover:bg-[#348BD6] text-xs font-semibold text-white transition-colors cursor-pointer"
						>
							<Hammer className="size-3.5" />
							Open Custom Maker
						</button>
					)}
				</div>
			) : (
				<div className="flex flex-col gap-2 max-h-[420px] xl:max-h-[560px] overflow-y-auto pr-1">
					{puzzles.map((item) => {
						const isActive = item.id === activePuzzleId;
						const progress = progressMap[item.id];
						const isBeaten = Boolean(progress?.completed);
						const bestTime =
							progress?.bestTimeSeconds !== null &&
							progress?.bestTimeSeconds !== undefined
								? formatTime(progress.bestTimeSeconds)
								: "—";

						return (
							<button
								key={item.id}
								type="button"
								onClick={() => onSelectPuzzle(item)}
								aria-current={isActive ? "true" : undefined}
								className={`w-full text-left rounded-lg border p-2.5 flex flex-row items-center gap-3 transition-colors cursor-pointer ${
									isActive
										? "border-[#46A7FC] bg-[#2B4563]/80"
										: "border-slate-700/70 bg-slate-900/50 hover:border-[#5B98E0] hover:bg-[#2B4563]/40"
								}`}
							>
								<MiniSudokuPreview givens={item.givens} />

								<div className="flex-1 min-w-0 flex flex-col gap-1.5">
									<div className="flex items-center justify-between gap-2">
										<span className="text-sm font-semibold text-[#FFFFFF] truncate">
											{item.title}
										</span>
										<span
											className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${DIFFICULTY_BADGE_CLASSES[item.difficulty]}`}
										>
											{item.difficulty}
										</span>
									</div>

									<div className="flex items-center justify-between gap-2 text-xs">
										<span
											className={`inline-flex items-center gap-1 font-medium ${
												isBeaten
													? "text-emerald-300"
													: "text-slate-400"
											}`}
										>
											{isBeaten ? (
												<CheckCircle2 className="size-3.5 shrink-0" />
											) : (
												<Circle className="size-3.5 shrink-0" />
											)}
											<span>
												{isBeaten
													? "Beaten"
													: "Unbeaten"}
											</span>
										</span>

										<span className="inline-flex items-center gap-1 font-mono text-[#A6D6FF]">
											<Clock className="size-3 shrink-0 text-[#ABD1FF]/80" />
											<span>{bestTime}</span>
										</span>
									</div>
								</div>
							</button>
						);
					})}
				</div>
			)}
		</aside>
	);
}
