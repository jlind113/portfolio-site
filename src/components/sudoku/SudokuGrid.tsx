import type { PointerEvent } from "react";
import { Play } from "lucide-react";
import SudokuCell from "./SudokuCell";
import type { BoardGrid, HighlightSettings, PuzzleDefinition } from "./types";
import { arePeers, getCellConflict } from "./utils";
import { gridColors } from './styles';

interface SudokuGridProps {
	board: BoardGrid;
	puzzle: PuzzleDefinition;
	selectedCells: ReadonlyArray<{ row: number; col: number }>;
	focusedCell: { row: number; col: number } | null;
	highlightedDigit?: number | null;
	highlightSettings: HighlightSettings;
	isPaused: boolean;
	onCellPointerDown: (
		row: number,
		col: number,
		e: PointerEvent<HTMLButtonElement>,
	) => void;
	onCellPointerEnter: (
		row: number,
		col: number,
		e: PointerEvent<HTMLButtonElement>,
	) => void;
	onResume: () => void;
}

export default function SudokuGrid({
	board,
	puzzle,
	selectedCells,
	focusedCell,
	highlightedDigit = null,
	highlightSettings,
	isPaused,
	onCellPointerDown,
	onCellPointerEnter,
	onResume,
}: SudokuGridProps) {
	const selectedSet = new Set(
		selectedCells.map((cell) => `${cell.row}-${cell.col}`),
	);

	const focusedValue =
		focusedCell !== null
			? (board[focusedCell.row]?.[focusedCell.col]?.value ?? null)
			: null;
	const activeDigit = focusedValue ?? highlightedDigit;

	return (
		<div
			role="grid"
			aria-label="Sudoku 9 by 9 board"
			className={`inline-grid grid-cols-9 border-2 ${gridColors.border} rounded-md overflow-hidden shadow-md ${gridColors.background} relative select-none`}
		>
			{board.map((row, r) =>
				row.map((cell, c) => {
					const isSelected =
						!isPaused && selectedSet.has(`${r}-${c}`);
					const isFocused =
						!isPaused &&
						focusedCell?.row === r &&
						focusedCell?.col === c;

					const isPeerHighlighted =
						!isPaused &&
						highlightSettings.highlightPeers &&
						focusedCell !== null &&
						!isSelected &&
						arePeers(focusedCell.row, focusedCell.col, r, c);

					const isSameDigitHighlighted =
						!isPaused &&
						highlightSettings.highlightCandidates &&
						activeDigit !== null &&
						cell.value === activeDigit &&
						!isSelected;

					const highlightedCandidateDigit =
						!isPaused && highlightSettings.highlightCandidates
							? activeDigit
							: null;

					const conflict = highlightSettings.errorChecking
						? getCellConflict(board, puzzle, r, c)
						: {
								hasRuleConflict: false,
								hasSolutionMismatch: false,
							};

					const hasError =
						!isPaused &&
						highlightSettings.errorChecking &&
						(conflict.hasRuleConflict ||
							conflict.hasSolutionMismatch);

					const rightBorder =
						c === 8
							? ""
							: c === 2 || c === 5
								? `border-r-2 ${gridColors.gridLines.vertical.thick}`
								: `border-r ${gridColors.gridLines.vertical.thin}`;

					const bottomBorder =
						r === 8
							? ""
							: r === 2 || r === 5
								? `border-b-2 ${gridColors.gridLines.horizontal.thick}`
								: `border-b ${gridColors.gridLines.horizontal.thin}`;

					return (
						<SudokuCell
							key={`${r}-${c}`}
							cell={cell}
							isSelected={isSelected}
							isFocused={isFocused}
							isPeerHighlighted={isPeerHighlighted}
							isSameDigitHighlighted={isSameDigitHighlighted}
							highlightedCandidateDigit={
								highlightedCandidateDigit
							}
							hasError={hasError}
							isObscured={isPaused}
							borderClasses={`${rightBorder} ${bottomBorder}`}
							onPointerDown={onCellPointerDown}
							onPointerEnter={onCellPointerEnter}
						/>
					);
				}),
			)}

			{isPaused && (
				<div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6 text-center">
					<div className="flex flex-col items-center gap-1">
						<p className="text-xl font-bold text-slate-100 tracking-tight">
							Game Paused
						</p>
						<p className="text-xs text-slate-400">
							Board hidden while timer is paused
						</p>
					</div>
					<button
						type="button"
						onClick={onResume}
						className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors shadow-lg cursor-pointer"
					>
						<Play className="size-4" />
						Resume Game
					</button>
				</div>
			)}
		</div>
	);
}
