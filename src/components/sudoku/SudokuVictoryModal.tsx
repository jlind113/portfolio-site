import { Award, Play, Trophy, X } from "lucide-react";
import type { Difficulty, DifficultyStat } from "./types";
import { formatTime } from "./utils";

interface SudokuVictoryModalProps {
	isOpen: boolean;
	puzzleTitle: string;
	difficulty: Difficulty;
	elapsedSeconds: number;
	isNewBestTime: boolean;
	stat: DifficultyStat;
	onClose: () => void;
	onPlayAnother: () => void;
}

export default function SudokuVictoryModal({
	isOpen,
	puzzleTitle,
	difficulty,
	elapsedSeconds,
	isNewBestTime,
	stat,
	onClose,
	onPlayAnother,
}: SudokuVictoryModalProps) {
	if (!isOpen) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="sudoku-victory-title"
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
		>
			<div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl flex flex-col gap-5 relative">
				<button
					type="button"
					onClick={onClose}
					aria-label="Close victory modal"
					className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
				>
					<X className="size-5" />
				</button>

				<div className="flex flex-col items-center text-center gap-2 pt-2">
					<div className="size-14 rounded-full bg-purple-900/50 border border-purple-500/60 flex items-center justify-center text-purple-300">
						<Trophy className="size-7" />
					</div>
					<h2
						id="sudoku-victory-title"
						className="text-2xl font-bold text-slate-100"
					>
						Puzzle Solved!
					</h2>
					<p className="text-sm text-slate-400">
						{difficulty} — {puzzleTitle}
					</p>
					{isNewBestTime && (
						<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/60 text-amber-300 mt-1">
							<Award className="size-3.5" />
							New Personal Best!
						</span>
					)}
				</div>

				<div className="grid grid-cols-3 gap-3">
					<div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-center">
						<p className="text-[11px] uppercase tracking-wider text-slate-400">
							Time
						</p>
						<p className="text-lg font-bold text-slate-100 mt-0.5 font-mono">
							{formatTime(elapsedSeconds)}
						</p>
					</div>

					<div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-center">
						<p className="text-[11px] uppercase tracking-wider text-slate-400">
							Best
						</p>
						<p className="text-lg font-bold text-purple-300 mt-0.5 font-mono">
							{stat.bestTimeSeconds !== null
								? formatTime(stat.bestTimeSeconds)
								: formatTime(elapsedSeconds)}
						</p>
					</div>

					<div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-center">
						<p className="text-[11px] uppercase tracking-wider text-slate-400">
							Won
						</p>
						<p className="text-lg font-bold text-emerald-300 mt-0.5">
							{stat.gamesWon}
						</p>
					</div>
				</div>

				<div className="flex flex-row gap-3">
					<button
						type="button"
						onClick={onClose}
						className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:border-slate-500 text-sm font-semibold text-slate-200 transition-colors cursor-pointer"
					>
						Review Board
					</button>
					<button
						type="button"
						onClick={onPlayAnother}
						className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white transition-colors cursor-pointer"
					>
						<Play className="size-4" />
						Play Another
					</button>
				</div>
			</div>
		</div>
	);
}
