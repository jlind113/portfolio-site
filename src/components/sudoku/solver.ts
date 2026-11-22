import type { BoardGrid, CellData, PuzzleValidationResult } from "./types";

const MAX_SOLVER_NODES = 250_000;

export function createEmptyBoard(): BoardGrid {
	const board: BoardGrid = [];
	for (let r = 0; r < 9; r++) {
		const row: CellData[] = [];
		for (let c = 0; c < 9; c++) {
			row.push({
				row: r,
				col: c,
				value: null,
				given: false,
				cornerMarks: [],
				centerMarks: [],
			});
		}
		board.push(row);
	}
	return board;
}

export function extractGivensFromBoard(board: BoardGrid): string {
	let result = "";
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			const cell = board[r]?.[c];
			if (cell && cell.given && cell.value !== null) {
				result += String(cell.value);
			} else {
				result += "0";
			}
		}
	}
	return result;
}

export function parseImportString(raw: string): string | null {
	const cleaned = raw.replace(/\s+/g, "").replace(/\./g, "0");
	if (/^[0-9]{81}$/.test(cleaned)) {
		return cleaned;
	}
	return null;
}

function isPlacementValid(grid: number[], idx: number, num: number): boolean {
	const r = Math.floor(idx / 9);
	const c = idx % 9;
	const br = Math.floor(r / 3) * 3;
	const bc = Math.floor(c / 3) * 3;

	for (let i = 0; i < 9; i++) {
		if (grid[r * 9 + i] === num) return false;
		if (grid[i * 9 + c] === num) return false;
		const boxIdx = (br + Math.floor(i / 3)) * 9 + (bc + (i % 3));
		if (grid[boxIdx] === num) return false;
	}
	return true;
}

export function validateCustomGivens(givens: string): PuzzleValidationResult {
	if (!/^[0-9]{81}$/.test(givens)) {
		return {
			status: "conflict",
			clueCount: 0,
			solution: null,
			message: "Invalid puzzle format: expected 81 digits.",
		};
	}

	const grid = givens.split("").map(Number);
	const clueCount = grid.filter((d) => d !== 0).length;

	if (clueCount === 0) {
		return {
			status: "empty",
			clueCount: 0,
			solution: null,
			message: "Place given clues on the board to create a puzzle.",
		};
	}

	// Verify no initial peer conflicts among given clues
	for (let i = 0; i < 81; i++) {
		const num = grid[i];
		if (num === 0) continue;
		grid[i] = 0;
		const ok = isPlacementValid(grid, i, num);
		grid[i] = num;
		if (!ok) {
			return {
				status: "conflict",
				clueCount,
				solution: null,
				message:
					"Invalid puzzle: conflicting given digits in the same row, column, or 3×3 cage.",
			};
		}
	}

	const solutions: string[] = [];
	let nodesVisited = 0;
	let nodeLimitHit = false;

	function solve(): void {
		if (solutions.length >= 2 || nodeLimitHit) return;
		nodesVisited++;
		if (nodesVisited > MAX_SOLVER_NODES) {
			nodeLimitHit = true;
			return;
		}

		let bestIdx = -1;
		let bestCandidates: number[] = [];
		let minCount = 10;

		for (let i = 0; i < 81; i++) {
			if (grid[i] !== 0) continue;
			const cands: number[] = [];
			for (let n = 1; n <= 9; n++) {
				if (isPlacementValid(grid, i, n)) {
					cands.push(n);
				}
			}
			if (cands.length === 0) return;
			if (cands.length < minCount) {
				minCount = cands.length;
				bestIdx = i;
				bestCandidates = cands;
				if (minCount === 1) break;
			}
		}

		if (bestIdx === -1) {
			solutions.push(grid.join(""));
			return;
		}

		for (const num of bestCandidates) {
			grid[bestIdx] = num;
			solve();
			grid[bestIdx] = 0;
			if (solutions.length >= 2 || nodeLimitHit) return;
		}
	}

	solve();

	if (solutions.length === 0) {
		return {
			status: "unsolvable",
			clueCount,
			solution: null,
			message: nodeLimitHit
				? `Solver timed out checking this puzzle (${clueCount} clues); add more givens and try again.`
				: `Unsolvable puzzle (${clueCount} clues): no valid Sudoku solution exists.`,
		};
	}

	if (solutions.length >= 2) {
		return {
			status: "multiple",
			clueCount,
			solution: null,
			message:
				clueCount < 17
					? `Multiple solutions (${clueCount} clues): a unique Sudoku requires at least 17 givens.`
					: `Multiple solutions found (${clueCount} clues): add more givens to make the solution unique.`,
		};
	}

	return {
		status: "unique",
		clueCount,
		solution: solutions[0],
		message: `Valid puzzle with a unique solution! (${clueCount} givens)`,
	};
}
