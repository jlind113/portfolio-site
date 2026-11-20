import type {
	BoardGrid,
	BoardSnapshot,
	CellData,
	PuzzleDefinition,
} from "./types";

export function createBoardFromPuzzle(puzzle: PuzzleDefinition): BoardGrid {
	const board: BoardGrid = [];
	for (let r = 0; r < 9; r++) {
		const row: CellData[] = [];
		for (let c = 0; c < 9; c++) {
			const char = puzzle.givens[r * 9 + c];
			const digit = char && char !== "0" ? Number(char) : null;
			row.push({
				row: r,
				col: c,
				value: digit,
				given: digit !== null,
				cornerMarks: [],
				centerMarks: [],
			});
		}
		board.push(row);
	}
	return board;
}

export function cloneBoard(board: BoardGrid): BoardGrid {
	return board.map((row) =>
		row.map((cell) => ({
			...cell,
			cornerMarks: [...cell.cornerMarks],
			centerMarks: [...cell.centerMarks],
		})),
	);
}

export function createSnapshot(board: BoardGrid): BoardSnapshot {
	return {
		cells: board.map((row) =>
			row.map((cell) => ({
				value: cell.value,
				cornerMarks: [...cell.cornerMarks],
				centerMarks: [...cell.centerMarks],
			})),
		),
	};
}

export function applySnapshot(
	board: BoardGrid,
	snapshot: BoardSnapshot,
): BoardGrid {
	return board.map((row, r) =>
		row.map((cell, c) => {
			const snap = snapshot.cells[r]?.[c];
			if (!snap || cell.given) {
				return {
					...cell,
					cornerMarks: [...cell.cornerMarks],
					centerMarks: [...cell.centerMarks],
				};
			}
			return {
				...cell,
				value: snap.value,
				cornerMarks: [...snap.cornerMarks],
				centerMarks: [...snap.centerMarks],
			};
		}),
	);
}

export function getCageIndex(row: number, col: number): number {
	return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

export function arePeers(
	r1: number,
	c1: number,
	r2: number,
	c2: number,
): boolean {
	if (r1 === r2 && c1 === c2) return false;
	return (
		r1 === r2 || c1 === c2 || getCageIndex(r1, c1) === getCageIndex(r2, c2)
	);
}

export function getCellConflict(
	board: BoardGrid,
	puzzle: PuzzleDefinition,
	row: number,
	col: number,
): { hasRuleConflict: boolean; hasSolutionMismatch: boolean } {
	const cell = board[row]?.[col];
	if (!cell || cell.value === null) {
		return { hasRuleConflict: false, hasSolutionMismatch: false };
	}

	const val = cell.value;
	let hasRuleConflict = false;
	for (let r = 0; r < 9 && !hasRuleConflict; r++) {
		for (let c = 0; c < 9; c++) {
			if (arePeers(row, col, r, c) && board[r][c].value === val) {
				hasRuleConflict = true;
				break;
			}
		}
	}

	const expected = Number(puzzle.solution[row * 9 + col]);
	const hasSolutionMismatch = !cell.given && val !== expected;

	return { hasRuleConflict, hasSolutionMismatch };
}

export function computeValidCandidates(
	board: BoardGrid,
	row: number,
	col: number,
): number[] {
	const cell = board[row]?.[col];
	if (!cell || cell.value !== null) return [];

	const used = new Set<number>();
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			if (arePeers(row, col, r, c)) {
				const peerVal = board[r][c].value;
				if (peerVal !== null) used.add(peerVal);
			}
		}
	}

	const candidates: number[] = [];
	for (let n = 1; n <= 9; n++) {
		if (!used.has(n)) candidates.push(n);
	}
	return candidates;
}

export function populateAutoNotes(
	board: BoardGrid,
	target: "corner" | "center" = "center",
): BoardGrid {
	const next = cloneBoard(board);
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			const cell = next[r][c];
			if (cell.given || cell.value !== null) continue;
			const candidates = computeValidCandidates(next, r, c);
			if (target === "corner") {
				cell.cornerMarks = candidates;
				cell.centerMarks = [];
			} else {
				cell.centerMarks = candidates;
				cell.cornerMarks = [];
			}
		}
	}
	return next;
}

export function removePeerPencilMarks(
	board: BoardGrid,
	row: number,
	col: number,
	digit: number,
): void {
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			if (!arePeers(row, col, r, c)) continue;
			const peer = board[r][c];
			if (peer.cornerMarks.includes(digit)) {
				peer.cornerMarks = peer.cornerMarks.filter((d) => d !== digit);
			}
			if (peer.centerMarks.includes(digit)) {
				peer.centerMarks = peer.centerMarks.filter((d) => d !== digit);
			}
		}
	}
}

export function isBoardSolved(
	board: BoardGrid,
	puzzle: PuzzleDefinition,
): boolean {
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			const expected = Number(puzzle.solution[r * 9 + c]);
			if (board[r]?.[c]?.value !== expected) {
				return false;
			}
		}
	}
	return true;
}

export function formatTime(totalSeconds: number): string {
	const clamped = Math.max(0, Math.floor(totalSeconds));
	const hours = Math.floor(clamped / 3600);
	const minutes = Math.floor((clamped % 3600) / 60);
	const seconds = clamped % 60;

	const mm = String(minutes).padStart(2, "0");
	const ss = String(seconds).padStart(2, "0");
	if (hours > 0) {
		return `${hours}:${mm}:${ss}`;
	}
	return `${mm}:${ss}`;
}

export function countDigitPlacements(board: BoardGrid): Record<number, number> {
	const counts: Record<number, number> = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 0,
		7: 0,
		8: 0,
		9: 0,
	};
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			const val = board[r]?.[c]?.value;
			if (val !== null && val >= 1 && val <= 9) {
				counts[val] = (counts[val] ?? 0) + 1;
			}
		}
	}
	return counts;
}
