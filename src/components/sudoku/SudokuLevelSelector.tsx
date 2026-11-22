import { CheckCircle2, Circle, Clock } from "lucide-react";
import { controls } from "./styles";
import {
	DIFFICULTIES,
	type Difficulty,
	type PuzzleDefinition,
	type PuzzleProgressMap,
} from "./types";
import { formatTime } from "./utils";

interface SudokuLevelSelectorProps {
	selectedDifficulty: Difficulty;
	onSelectDifficulty: (difficulty: Difficulty) => void;
	puzzles: readonly PuzzleDefinition[];
	activePuzzleId: string;
	progressMap: PuzzleProgressMap;
	onSelectPuzzle: (puzzle: PuzzleDefinition) => void;
}

const DIFFICULTY_BADGE_CLASSES: Record<Difficulty, string> = {
	Easy: "bg-emerald-950/70 text-emerald-300 border-emerald-700/60",
	Medium: "bg-sky-950/70 text-sky-300 border-sky-700/60",
	Hard: "bg-amber-950/70 text-amber-300 border-amber-700/60",
	Expert: "bg-rose-950/70 text-rose-300 border-rose-700/60",
};

const THIN_LINES = [1, 2, 4, 5, 7, 8] as const;
const THICK_LINES = [3, 6] as const;

function MiniSudokuPreview({ givens }: { givens: string }) {
	const clueCoords: Array<{ r: number; c: number }> = [];
	for (let i = 0; i < 81; i++) {
		const ch = givens[i];
		if (ch && ch !== "0") {
			clueCoords.push({ r: Math.floor(i / 9), c: i % 9 });
		}
	}

	return (
		<svg
			viewBox="0 0 90 90"
			aria-hidden="true"
			className="size-13 shrink-0 rounded border border-[#0E1F37] bg-[#2F3337]"
		>
			{THIN_LINES.map((n) => (
				<g key={`thin-${n}`}>
					<line
						x1={n * 10}
						y1={0}
						x2={n * 10}
						y2={90}
						stroke="#435C78"
						strokeWidth="0.7"
					/>
					<line
						x1={0}
						y1={n * 10}
						x2={90}
						y2={n * 10}
						stroke="#435C78"
						strokeWidth="0.7"
					/>
				</g>
			))}

			{THICK_LINES.map((n) => (
				<g key={`thick-${n}`}>
					<line
						x1={n * 10}
						y1={0}
						x2={n * 10}
						y2={90}
						stroke="#5B98E0"
						strokeWidth="1.6"
					/>
					<line
						x1={0}
						y1={n * 10}
						x2={90}
						y2={n * 10}
						stroke="#5B98E0"
						strokeWidth="1.6"
					/>
				</g>
			))}

			{clueCoords.map(({ r, c }) => (
				<rect
					key={`${r}-${c}`}
					x={c * 10 + 1.8}
					y={r * 10 + 1.8}
					width="6.4"
					height="6.4"
					rx="1.2"
					fill="#ABD1FF"
				/>
			))}
		</svg>
	);
}

export default function SudokuLevelSelector({
	selectedDifficulty,
	onSelectDifficulty,
	puzzles,
	activePuzzleId,
	progressMap,
	onSelectPuzzle,
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
					className="grid grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-1.5"
				>
					{DIFFICULTIES.map((diff) => {
						const active = diff === selectedDifficulty;
						return (
							<button
								key={diff}
								type="button"
								onClick={() => onSelectDifficulty(diff)}
								className={`${controls.buttons.spacing} px-2 text-center ${
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
			</div>

			{/* Scrollable Level List */}
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
											{isBeaten ? "Beaten" : "Unbeaten"}
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
		</aside>
	);
}
