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

const CENTER_SLOT_CLASSES: readonly string[] = [
	// top left
	"top-1.5 left-3 sm:top-2 sm:left-4 md:top-2.5 md:left-4.5 lg:top-3 lg:left-5.5",
	// top middle
	"top-1.5 left-1/2 sm:top-2 md:top-2.5 lg:top-3 -translate-x-1/2",
	// top right
	"top-1.5 right-3 sm:top-2 sm:right-4 md:top-2.5 md:right-4.5 lg:top-3 lg:right-5.5",

	// middle left
	"left-3 sm:left-4 md:left-4.5 lg:left-5.5 top-1/2 -translate-y-1/2",
	// middle middle
	"top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
	// middle right
	"right-3 sm:right-4 md:right-4.5 lg:right-5.5 top-1/2 -translate-y-1/2",

	// bottom left
	"bottom-1.5 left-3 sm:bottom-2 sm:left-4 md:bottom-2.5 md:left-4.5 lg:bottom-3 lg:left-5.5",
	// bottom middle
	"bottom-1.5 left-1/2 sm:bottom-2 md:bottom-2.5 lg:bottom-3 -translate-x-1/2",
	// bottom right
	"bottom-1.5 right-3 sm:bottom-2 sm:right-4 md:bottom-2.5 md:right-4.5 lg:bottom-3 lg:right-5.5",
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
			className={`w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 aspect-square shrink-0 relative select-none touch-none flex items-center justify-center transition-colors focus:outline-none ${bgClass} ${borderClasses}`}
		>
			{!isObscured && cell.value !== null && (
				<span className={`leading-none ${digitColorClass}`}>
					{cell.value}
				</span>
			)}

			{!isObscured && cell.value === null && (
				<>
					{hasCornerMarks &&
						[...cell.cornerMarks]
							.sort((a, b) => a - b)
							.map((digit, index) => {
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
											? gridCells.text.candidateHighlighted
											: gridCells.text.candidate
									}`}
								>
									{digit}
								</span>
							);
						})}

					{hasCenterMarks &&
						[...cell.centerMarks]
							.sort((a, b) => a - b)
							.map((digit, index) => {
							const slotClass =
								CENTER_SLOT_CLASSES[
									Math.min(
										index,
										CENTER_SLOT_CLASSES.length - 1,
									)
								];
							const isCandidateMatch =
								highlightedCandidateDigit !== null &&
								digit === highlightedCandidateDigit;

							return (
								<span
									key={`center-${digit}`}
									className={`absolute pointer-events-none text-[10px] sm:text-xs lg:text-sm leading-none font-medium ${slotClass} ${
										isCandidateMatch
											? gridCells.text.candidateHighlighted
											: gridCells.text.candidate
									}`}
								>
									{digit}
								</span>
							);
						})}
				</>
			)}
		</button>
	);
}
