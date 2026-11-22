import { getPuzzleById } from "./puzzles";
import type {
	BoardSnapshot,
	CustomPuzzle,
	Difficulty,
	HighlightSettings,
	InputMode,
	PuzzleProgressMap,
	StatsMap,
} from "./types";

const GAME_STORAGE_KEY = "portfolio_sudoku_state_v1";
const STATS_STORAGE_KEY = "portfolio_sudoku_stats_v1";
const PROGRESS_STORAGE_KEY = "portfolio_sudoku_progress_v1";
const CUSTOM_PUZZLES_STORAGE_KEY = "portfolio_sudoku_custom_puzzles_v1";
const MAX_STORED_HISTORY = 100;

export const DEFAULT_HIGHLIGHT_SETTINGS: HighlightSettings = {
	highlightPeers: true,
	highlightCandidates: true,
	errorChecking: true,
};

export interface SavedGameState {
	puzzleId: string;
	snapshot: BoardSnapshot;
	elapsedSeconds: number;
	isSolved: boolean;
	highlightSettings: HighlightSettings;
	undoStack: BoardSnapshot[];
	redoStack: BoardSnapshot[];
	inputMode: InputMode;
}

export function createDefaultStats(): StatsMap {
	return {
		Easy: { gamesWon: 0, bestTimeSeconds: null, totalTimeSeconds: 0 },
		Medium: { gamesWon: 0, bestTimeSeconds: null, totalTimeSeconds: 0 },
		Hard: { gamesWon: 0, bestTimeSeconds: null, totalTimeSeconds: 0 },
		Expert: { gamesWon: 0, bestTimeSeconds: null, totalTimeSeconds: 0 },
	};
}

function isValidSnapshot(value: unknown): value is BoardSnapshot {
	if (!value || typeof value !== "object") return false;
	const candidate = value as { cells?: unknown };
	if (!Array.isArray(candidate.cells) || candidate.cells.length !== 9) {
		return false;
	}
	return candidate.cells.every(
		(row) =>
			Array.isArray(row) &&
			row.length === 9 &&
			row.every(
				(cell) =>
					cell &&
					typeof cell === "object" &&
					(cell.value === null ||
						(typeof cell.value === "number" &&
							cell.value >= 1 &&
							cell.value <= 9)) &&
					Array.isArray(cell.cornerMarks) &&
					Array.isArray(cell.centerMarks),
			),
	);
}

export function loadSavedGame(): SavedGameState | null {
	try {
		const raw = localStorage.getItem(GAME_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<SavedGameState>;
		if (
			typeof parsed.puzzleId !== "string" ||
			!getPuzzleById(parsed.puzzleId) ||
			!isValidSnapshot(parsed.snapshot)
		) {
			return null;
		}

		const highlightSettings: HighlightSettings = {
			highlightPeers:
				typeof parsed.highlightSettings?.highlightPeers === "boolean"
					? parsed.highlightSettings.highlightPeers
					: DEFAULT_HIGHLIGHT_SETTINGS.highlightPeers,
			highlightCandidates:
				typeof parsed.highlightSettings?.highlightCandidates ===
				"boolean"
					? parsed.highlightSettings.highlightCandidates
					: DEFAULT_HIGHLIGHT_SETTINGS.highlightCandidates,
			errorChecking:
				typeof parsed.highlightSettings?.errorChecking === "boolean"
					? parsed.highlightSettings.errorChecking
					: DEFAULT_HIGHLIGHT_SETTINGS.errorChecking,
		};

		const inputMode: InputMode =
			parsed.inputMode === "corner" ||
			parsed.inputMode === "center" ||
			parsed.inputMode === "normal" ||
			parsed.inputMode === "given"
				? parsed.inputMode
				: "normal";

		return {
			puzzleId: parsed.puzzleId,
			snapshot: parsed.snapshot,
			elapsedSeconds:
				typeof parsed.elapsedSeconds === "number" &&
				parsed.elapsedSeconds >= 0
					? parsed.elapsedSeconds
					: 0,
			isSolved: Boolean(parsed.isSolved),
			highlightSettings,
			undoStack: Array.isArray(parsed.undoStack)
				? parsed.undoStack.filter(isValidSnapshot)
				: [],
			redoStack: Array.isArray(parsed.redoStack)
				? parsed.redoStack.filter(isValidSnapshot)
				: [],
			inputMode,
		};
	} catch {
		return null;
	}
}

export function saveGameState(state: SavedGameState): void {
	try {
		const trimmedState: SavedGameState = {
			...state,
			undoStack: state.undoStack.slice(-MAX_STORED_HISTORY),
			redoStack: state.redoStack.slice(-MAX_STORED_HISTORY),
		};
		localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(trimmedState));
	} catch {
		// Ignore quota or storage unavailability errors
	}
}

export function loadStats(): StatsMap {
	const defaults = createDefaultStats();
	try {
		const raw = localStorage.getItem(STATS_STORAGE_KEY);
		if (!raw) return defaults;
		const parsed = JSON.parse(raw) as Partial<StatsMap>;
		const difficulties: Difficulty[] = ["Easy", "Medium", "Hard", "Expert"];
		for (const diff of difficulties) {
			const entry = parsed[diff];
			if (entry && typeof entry === "object") {
				defaults[diff] = {
					gamesWon:
						typeof entry.gamesWon === "number" ? entry.gamesWon : 0,
					bestTimeSeconds:
						typeof entry.bestTimeSeconds === "number"
							? entry.bestTimeSeconds
							: null,
					totalTimeSeconds:
						typeof entry.totalTimeSeconds === "number"
							? entry.totalTimeSeconds
							: 0,
				};
			}
		}
		return defaults;
	} catch {
		return defaults;
	}
}

export function saveStats(stats: StatsMap): void {
	try {
		localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
	} catch {
		// Ignore quota or storage unavailability errors
	}
}

export function loadPuzzleProgress(): PuzzleProgressMap {
	try {
		const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		if (!parsed || typeof parsed !== "object") return {};

		const result: PuzzleProgressMap = {};
		for (const [id, entry] of Object.entries(parsed)) {
			if (!entry || typeof entry !== "object") continue;
			const item = entry as {
				completed?: unknown;
				bestTimeSeconds?: unknown;
				wins?: unknown;
			};
			result[id] = {
				completed: Boolean(item.completed),
				bestTimeSeconds:
					typeof item.bestTimeSeconds === "number" &&
					item.bestTimeSeconds >= 0
						? item.bestTimeSeconds
						: null,
				wins:
					typeof item.wins === "number" && item.wins >= 0
						? item.wins
						: 0,
			};
		}
		return result;
	} catch {
		return {};
	}
}

export function savePuzzleProgress(progress: PuzzleProgressMap): void {
	try {
		localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
	} catch {
		// Ignore quota or storage unavailability errors
	}
}

function isValidDifficulty(val: unknown): val is Difficulty {
	return (
		val === "Easy" ||
		val === "Medium" ||
		val === "Hard" ||
		val === "Expert"
	);
}

export function loadCustomPuzzles(): CustomPuzzle[] {
	try {
		const raw = localStorage.getItem(CUSTOM_PUZZLES_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];

		const list: CustomPuzzle[] = [];
		for (const item of parsed) {
			if (!item || typeof item !== "object") continue;
			const entry = item as Partial<CustomPuzzle>;
			if (
				typeof entry.id !== "string" ||
				typeof entry.title !== "string" ||
				!isValidDifficulty(entry.difficulty) ||
				typeof entry.givens !== "string" ||
				!/^[0-9]{81}$/.test(entry.givens) ||
				typeof entry.solution !== "string"
			) {
				continue;
			}
			list.push({
				id: entry.id,
				title: entry.title,
				difficulty: entry.difficulty,
				givens: entry.givens,
				solution: entry.solution,
				isValidUnique: Boolean(entry.isValidUnique),
				createdAt:
					typeof entry.createdAt === "number"
						? entry.createdAt
						: Date.now(),
				updatedAt:
					typeof entry.updatedAt === "number"
						? entry.updatedAt
						: Date.now(),
			});
		}
		return list;
	} catch {
		return [];
	}
}

export function saveCustomPuzzles(puzzles: CustomPuzzle[]): void {
	try {
		localStorage.setItem(
			CUSTOM_PUZZLES_STORAGE_KEY,
			JSON.stringify(puzzles),
		);
	} catch {
		// Ignore quota or storage unavailability errors
	}
}
