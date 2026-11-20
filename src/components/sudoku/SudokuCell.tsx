import type { PointerEvent } from "react";
import type { CellData } from "./types";

interface SudokuCellProps {
	cell: CellData;
	isSelected: boolean;
	isFocused: boolean;
	isPeerHighlighted: boolean;
	isSameDigitHighlighted: boolean;
	highlightedCandidateDigit: number | null;
	hasError: boolean;
	isObscured?: boolean;
	borderClasses?: string;
	onPointerDown: (
		row: number,
		col: number,
		e: PointerEvent<HTMLButtonElement>
	) => void;
	onPointerEnter: (
		row: number,
		col: number,
		e: PointerEvent<HTMLButtonElement>
	) => void;
}

const CORNER_SLOT_CLASSES: readonly string[] = [
	"top-0.5 left-1 sm:top-1 sm:left-1.5",
	"top-0.5 right-1 sm:top-1 sm:right-1.5",
	"bottom-0.5 left-1 sm:bottom-1 sm:left-1.5",
	"bottom-0.5 right-1 sm:bottom-1 sm:right-1.5",
	"top-0.5 sm:top-1 left-1/2 -translate-x-1/2",
	"bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2",
	"left-1 sm:left-1.5 top-1/2 -translate-y-1/2",
	"right-1 sm:right-1.5 top-1/2 -translate-y-1/2",
	"bottom-1/3 left-1/3 sm:bottom-7 sm:left-8",
];

export default function SudokuCell({
	cell,
	isSelected,
	isFocused,
	isPeerHighlighted,
	isSameDigitHighlighted,
	highlightedCandidateDigit,
	hasError,
	isObscured = false,
	borderClasses = "",
	onPointerDown,
	onPointerEnter,
}: SudokuCellProps) {
	let bgClass = cell.given
		? "bg-slate-950"
		: "bg-slate-900/90 hover:bg-slate-800/80";

	if (isSelected && hasError) {
		bgClass = "bg-rose-700/55 ring-[3px] ring-inset ring-rose-400 z-10";
	} else if (isSelected && isFocused) {
		bgClass = "bg-purple-600/55 ring-[3px] ring-inset ring-purple-300 z-10";
	} else if (isSelected) {
		bgClass = "bg-purple-600/45 ring-2 ring-inset ring-purple-400/90 z-10";
	} else if (hasError) {
		bgClass = "bg-rose-600/50 ring-2 ring-inset ring-rose-400 text-rose-100";
	} else if (isSameDigitHighlighted) {
		bgClass = "bg-cyan-600/45 ring-2 ring-inset ring-cyan-400/80";
	} else if (isPeerHighlighted) {
		bgClass = "bg-slate-700/80";
	}

	const digitColorClass = cell.given
		? hasError
			? "text-rose-200 font-bold text-2xl sm:text-3xl lg:text-4xl"
			: "text-white font-bold text-2xl sm:text-3xl lg:text-4xl"
		: hasError
			? "text-rose-200 font-semibold text-2xl sm:text-3xl lg:text-4xl"
			: "text-violet-200 font-semibold text-2xl sm:text-3xl lg:text-4xl";

	const hasCornerMarks = cell.cornerMarks.length > 0;
	const hasCenterMarks = cell.centerMarks.length > 0;

	const ariaLabel = `Row ${cell.row + 1}, Column ${cell.col + 1}${
		!isObscured && cell.value !== null
			? `, value ${cell.value}${cell.given ? " (given)" : ""}`
			: ", empty"
	}`;

	return (
		<button
			type="button"
			onPointerDown={(e) => onPointerDown(cell.row, cell.col, e)}
			onPointerEnter={(e) => onPointerEnter(cell.row, cell.col, e)}
			aria-label={ariaLabel}
			aria-selected={isSelected}
			className={`w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 relative select-none touch-none flex items-center justify-center transition-colors focus:outline-none ${bgClass} ${borderClasses}`}
		>
			{!isObscured && cell.value !== null && (
				<span className={`leading-none ${digitColorClass}`}>
					{cell.value}
				</span>
			)}

			{!isObscured && cell.value === null && (
				<>
					{hasCornerMarks &&
						cell.cornerMarks.map((digit, index) => {
							const slotClass =
								CORNER_SLOT_CLASSES[
									Math.min(index, CORNER_SLOT_CLASSES.length - 1)
								];
							const isCandidateMatch =
								highlightedCandidateDigit !== null &&
								digit === highlightedCandidateDigit;

							return (
								<span
									key={`corner-${digit}`}
									className={`absolute pointer-events-none text-xs sm:text-sm lg:text-[15px] leading-none font-bold ${slotClass} ${
										isCandidateMatch
											? "bg-amber-400 text-slate-950 font-extrabold rounded px-1 py-0.5 shadow-sm"
											: "text-sky-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]"
									}`}
								>
									{digit}
								</span>
							);
						})}

					{hasCenterMarks && (
						<div
							className={`flex items-center justify-center flex-wrap gap-0.5 px-1 pointer-events-none z-10 ${
								hasCornerMarks
									? "bg-slate-950/90 border border-slate-700/80 rounded px-1 py-0.5 shadow-sm"
									: ""
							}`}
						>
							{cell.centerMarks.map((digit) => {
								const isCandidateMatch =
									highlightedCandidateDigit !== null &&
									digit === highlightedCandidateDigit;

								return (
									<span
										key={`center-${digit}`}
										className={`text-xs sm:text-sm lg:text-base leading-none font-bold tracking-tight ${
											isCandidateMatch
												? "bg-amber-400 text-slate-950 font-extrabold rounded px-1 py-0.5 shadow-sm"
												: "text-emerald-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]"
										}`}
									>
										{digit}
									</span>
								);
							})}
						</div>
					)}
				</>
			)}
		</button>
	);
}
