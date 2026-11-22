export type Difficulty = "Easy" | "Medium" | "Hard" | "Expert";

export const DIFFICULTIES: readonly Difficulty[] = [
	"Easy",
	"Medium",
	"Hard",
	"Expert",
] as const;

export type InputMode = "normal" | "corner" | "center";

export interface CellData {
	row: number;
	col: number;
	value: number | null;
	given: boolean;
	cornerMarks: number[];
	centerMarks: number[];
}

export type BoardGrid = CellData[][];

export interface CellSnapshot {
	value: number | null;
	cornerMarks: number[];
	centerMarks: number[];
}

export interface BoardSnapshot {
	cells: CellSnapshot[][];
}

export interface HighlightSettings {
	highlightPeers: boolean;
	highlightCandidates: boolean;
	errorChecking: boolean;
}

export interface PuzzleDefinition {
	id: string;
	title: string;
	difficulty: Difficulty;
	givens: string;
	solution: string;
}

export interface DifficultyStat {
	gamesWon: number;
	bestTimeSeconds: number | null;
	totalTimeSeconds: number;
}

export type StatsMap = Record<Difficulty, DifficultyStat>;

export interface PuzzleProgress {
	completed: boolean;
	bestTimeSeconds: number | null;
	wins: number;
}

export type PuzzleProgressMap = Record<string, PuzzleProgress>;
