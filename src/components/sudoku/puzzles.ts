import easyPuzzlesData from "./puzzleData/EasyPuzzles.json";
import expertPuzzlesData from "./puzzleData/ExpertPuzzles.json";
import hardPuzzlesData from "./puzzleData/HardPuzzles.json";
import mediumPuzzlesData from "./puzzleData/MediumPuzzles.json";
import type { Difficulty, PuzzleDefinition } from "./types";

const PUZZLES_BY_DIFFICULTY: Record<Difficulty, readonly PuzzleDefinition[]> = {
	Easy: easyPuzzlesData as PuzzleDefinition[],
	Medium: mediumPuzzlesData as PuzzleDefinition[],
	Hard: hardPuzzlesData as PuzzleDefinition[],
	Expert: expertPuzzlesData as PuzzleDefinition[],
};

export const PUZZLES: readonly PuzzleDefinition[] = [
	...PUZZLES_BY_DIFFICULTY.Easy,
	...PUZZLES_BY_DIFFICULTY.Medium,
	...PUZZLES_BY_DIFFICULTY.Hard,
	...PUZZLES_BY_DIFFICULTY.Expert,
];

const PUZZLE_BY_ID: ReadonlyMap<string, PuzzleDefinition> = new Map(
	PUZZLES.map((puzzle) => [puzzle.id, puzzle]),
);

export function getPuzzlesByDifficulty(
	difficulty: Difficulty,
): PuzzleDefinition[] {
	return [...PUZZLES_BY_DIFFICULTY[difficulty]];
}

export function getPuzzleById(id: string): PuzzleDefinition | undefined {
	return PUZZLE_BY_ID.get(id);
}

export function getRandomPuzzle(
	difficulty: Difficulty,
	excludeId?: string,
): PuzzleDefinition {
	const pool = PUZZLES_BY_DIFFICULTY[difficulty];
	const candidates =
		excludeId && pool.length > 1
			? pool.filter((puzzle) => puzzle.id !== excludeId)
			: pool;
	const index = Math.floor(Math.random() * candidates.length);
	return candidates[index];
}
