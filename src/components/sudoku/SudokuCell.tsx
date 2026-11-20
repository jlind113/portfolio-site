import type { PointerEvent } from "react";
import type { CellData } from "./types";
import { gridCells } from "./styles";

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
		e: PointerEvent<HTMLButtonElement>,
	) => void;
	onPointerEnter: (
		row: number,
		col: number,
		e: PointerEvent<HTMLButtonElement>,
	) => void;
}

const CORNER_SLOT_CLASSES: readonly string[] = [
	// value pair 1 = center marks
	// value pair 2 = corner marks
	// Candidates are added in this order

	// top left
	"top-0.5 left-1 sm:top-1 sm:left-1.5",
	// top middle
	"top-0.5 left-1/2 sm:top-1 -translate-x-1/2",
	// top right
	"top-0.5 right-1 sm:top-1 sm:right-1.5",

	// middle left
	"left-1 sm:left-1.5 top-1/2 -translate-y-1/2",
	// middle middle
	"top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
	// middle right
	"right-1 sm:right-1.5 top-1/2 -translate-y-1/2",

	// bottom left
	"bottom-0.5 left-1 sm:bottom-1 sm:left-1.5",
	// bottom middle
	"bottom-0.5 left-1/2 sm:bottom-1 -translate-x-1/2",
	// bottom right
	"bottom-0.5 right-1 sm:bottom-1 sm:right-1.5",
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
		? `${gridCells.background} ${gridCells.backgroundhover}`
		: `${gridCells.background} ${gridCells.backgroundhover}`;

	if (isSelected && hasError) {
		bgClass = `${gridCells.isSelected.error}`;
	} else if (isSelected && isFocused) {
		bgClass = `${gridCells.isSelected.focused}`;
	} else if (isSelected) {
		bgClass = `${gridCells.isSelected.neighboor}`;
	} else if (hasError) {
		bgClass = `${gridCells.hasError}`;
	} else if (isSameDigitHighlighted) {
		bgClass = `${gridCells.sameDigitHighlighted}`;
	} else if (isPeerHighlighted) {
		bgClass = `${gridCells.peerHighlighted}`;
	}

	const digitColorClass = cell.given
		? hasError
			? `${gridCells.text.given.error}`
			: `${gridCells.text.given.normal}`
		: hasError
			? `${gridCells.text.entered.error}`
			: `${gridCells.text.entered.normal}`;

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
									Math.min(
										index,
										CORNER_SLOT_CLASSES.length - 1,
									)
								];
							const isCandidateMatch =
								highlightedCandidateDigit !== null &&
								digit === highlightedCandidateDigit;

							return (
								<span
									key={`corner-${digit}`}
									className={`absolute pointer-events-none text-xs sm:text-sm lg:text-[15px] leading-none font-semibold ${slotClass} ${
										isCandidateMatch
											? "outline-2 outline-offset-1 outline-amber-400 text-[#FEFAFA] font-bold rounded-sm"
											: "text-[#FEFAFA]"
									}`}
								>
									{digit}
								</span>
							);
						})}

					{hasCenterMarks && (
						<div
							className={`flex items-center justify-evenly flex-wrap px-4 pointer-events-none ${
								hasCornerMarks
									? "bg-slate-950/90 border border-slate-700/80 rounded px-1 py-0.5"
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
										className={`text-xs sm:text-sm lg:text-base leading-3.5 font-medium tracking-tight mx-0.5 my-0.2 ${
											isCandidateMatch
												? "outline-2 outline-offset-1 outline-amber-400 text-[#FEFAFA] font-bold rounded"
												: "text-[#FEFAFA]"
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
