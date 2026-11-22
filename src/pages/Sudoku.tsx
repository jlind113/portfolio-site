import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import {
	AlertTriangle,
	ArrowLeft,
	Check,
	CheckCircle2,
	Hammer,
	Info,
	Mail,
	Pause,
	Play,
	RotateCcw,
	Send,
	ShieldCheck,
	Trophy,
	X,
	XCircle,
} from "lucide-react";
import SudokuControls from "../components/sudoku/SudokuControls";
import SudokuCustomPanel from "../components/sudoku/SudokuCustomPanel";
import SudokuGrid from "../components/sudoku/SudokuGrid";
import SudokuLevelSelector from "../components/sudoku/SudokuLevelSelector";
import SudokuSubmitModal from "../components/sudoku/SudokuSubmitModal";
import SudokuVictoryModal from "../components/sudoku/SudokuVictoryModal";
import {
	getPuzzleById,
	getPuzzlesByDifficulty,
} from "../components/sudoku/puzzles";
import {
	createEmptyBoard,
	extractGivensFromBoard,
	validateCustomGivens,
} from "../components/sudoku/solver";
import {
	DEFAULT_HIGHLIGHT_SETTINGS,
	loadCustomPuzzles,
	loadPuzzleProgress,
	loadSavedGame,
	loadStats,
	saveCustomPuzzles,
	saveGameState,
	savePuzzleProgress,
	saveStats,
} from "../components/sudoku/storage";
import {
	buildSubmissionMailtoUrl,
	submitPuzzleViaEmail,
	type PuzzleSubmissionPayload,
} from "../components/sudoku/submit";
import type {
	AppMode,
	BoardGrid,
	BoardSnapshot,
	CustomPuzzle,
	Difficulty,
	HighlightSettings,
	InputMode,
	LevelFilter,
	PuzzleDefinition,
	PuzzleProgressMap,
	PuzzleValidationResult,
	StatsMap,
} from "../components/sudoku/types";
import {
	applySnapshot,
	cloneBoard,
	countDigitPlacements,
	createBoardFromPuzzle,
	createSnapshot,
	formatTime,
	isBoardSolved,
	populateAutoNotes,
	removePeerPencilMarks,
} from "../components/sudoku/utils";

interface CellCoord {
	row: number;
	col: number;
}

interface InitialGameState {
	puzzle: PuzzleDefinition;
	initialFilter: LevelFilter;
	board: BoardGrid;
	elapsedSeconds: number;
	isSolved: boolean;
	highlightSettings: HighlightSettings;
	undoStack: BoardSnapshot[];
	redoStack: BoardSnapshot[];
	inputMode: InputMode;
}

interface SavedPlaySession {
	puzzle: PuzzleDefinition;
	board: BoardGrid;
	elapsedSeconds: number;
	isSolved: boolean;
	undoStack: BoardSnapshot[];
	redoStack: BoardSnapshot[];
	inputMode: InputMode;
	selectedDifficultyFilter: LevelFilter;
}

interface SavedEditorDraft {
	draftId: string | null;
	title: string;
	difficulty: Difficulty;
	board: BoardGrid;
	undoStack: BoardSnapshot[];
	redoStack: BoardSnapshot[];
	validationResult: PuzzleValidationResult | null;
	hasUnsavedChanges: boolean;
	inputMode: InputMode;
}

interface PendingSubmission {
	title: string;
	difficulty: Difficulty;
	clueCount: number;
	givens: string;
	solution: string;
}

interface SubmitBannerState {
	type: "success" | "error" | "info";
	message: string;
	fallbackMailtoUrl?: string;
}

function getInitialGameState(): InitialGameState {
	const saved = loadSavedGame();
	if (saved) {
		const builtIn = getPuzzleById(saved.puzzleId);
		const customList = builtIn ? [] : loadCustomPuzzles();
		const customMatch = builtIn
			? undefined
			: customList.find((item) => item.id === saved.puzzleId);
		const savedPuzzle = builtIn ?? customMatch;
		if (savedPuzzle) {
			const baseBoard = createBoardFromPuzzle(savedPuzzle);
			return {
				puzzle: savedPuzzle,
				initialFilter: customMatch ? "Custom" : savedPuzzle.difficulty,
				board: applySnapshot(baseBoard, saved.snapshot),
				elapsedSeconds: saved.elapsedSeconds,
				isSolved: saved.isSolved,
				highlightSettings: saved.highlightSettings,
				undoStack: saved.undoStack,
				redoStack: saved.redoStack,
				inputMode:
					saved.inputMode === "given" ? "normal" : saved.inputMode,
			};
		}
	}

	const defaultPuzzle = getPuzzlesByDifficulty("Easy")[0];
	return {
		puzzle: defaultPuzzle,
		initialFilter: defaultPuzzle.difficulty,
		board: createBoardFromPuzzle(defaultPuzzle),
		elapsedSeconds: 0,
		isSolved: false,
		highlightSettings: DEFAULT_HIGHLIGHT_SETTINGS,
		undoStack: [],
		redoStack: [],
		inputMode: "normal",
	};
}

function extractDigitFromKeyEvent(e: KeyboardEvent): number | null {
	if (e.key >= "1" && e.key <= "9") {
		return Number(e.key);
	}
	if (e.code.startsWith("Digit") && e.code.length === 6) {
		const num = Number(e.code.slice(5));
		if (num >= 1 && num <= 9) return num;
	}
	if (e.code.startsWith("Numpad") && e.code.length === 7) {
		const num = Number(e.code.slice(6));
		if (num >= 1 && num <= 9) return num;
	}
	return null;
}

export default function Sudoku() {
	const [initialState] = useState<InitialGameState>(() =>
		getInitialGameState(),
	);
	const [appMode, setAppMode] = useState<AppMode>("play");
	const [puzzle, setPuzzle] = useState<PuzzleDefinition>(initialState.puzzle);
	const [selectedDifficultyFilter, setSelectedDifficultyFilter] =
		useState<LevelFilter>(initialState.initialFilter);
	const [board, setBoard] = useState<BoardGrid>(initialState.board);
	const [selectedCells, setSelectedCells] = useState<CellCoord[]>([]);
	const [focusedCell, setFocusedCell] = useState<CellCoord | null>(null);
	const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
	const isDraggingRef = useRef<boolean>(false);
	const [highlightedDigit, setHighlightedDigit] = useState<number | null>(
		null,
	);
	const [inputMode, setInputMode] = useState<InputMode>(
		initialState.inputMode,
	);
	const [undoStack, setUndoStack] = useState<BoardSnapshot[]>(
		initialState.undoStack,
	);
	const [redoStack, setRedoStack] = useState<BoardSnapshot[]>(
		initialState.redoStack,
	);
	const [elapsedSeconds, setElapsedSeconds] = useState<number>(
		initialState.elapsedSeconds,
	);
	const [isPaused, setIsPaused] = useState<boolean>(false);
	const [isSolved, setIsSolved] = useState<boolean>(initialState.isSolved);
	const [isVictoryModalOpen, setIsVictoryModalOpen] =
		useState<boolean>(false);
	const [isNewBestTime, setIsNewBestTime] = useState<boolean>(false);
	const [highlightSettings, setHighlightSettings] =
		useState<HighlightSettings>(initialState.highlightSettings);
	const [stats, setStats] = useState<StatsMap>(() => loadStats());
	const [puzzleProgress, setPuzzleProgress] = useState<PuzzleProgressMap>(
		() => loadPuzzleProgress(),
	);

	// Custom puzzle maker state
	const [customPuzzles, setCustomPuzzles] = useState<CustomPuzzle[]>(() =>
		loadCustomPuzzles(),
	);
	const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
	const [draftTitle, setDraftTitle] = useState<string>("My Custom Puzzle");
	const [draftDifficulty, setDraftDifficulty] = useState<Difficulty>("Medium");
	const [validationResult, setValidationResult] =
		useState<PuzzleValidationResult | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
	const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
	const [savedPlaySession, setSavedPlaySession] =
		useState<SavedPlaySession | null>(null);
	const [savedEditorDraft, setSavedEditorDraft] =
		useState<SavedEditorDraft | null>(null);
	const [pendingSubmission, setPendingSubmission] =
		useState<PendingSubmission | null>(null);
	const [submitterName, setSubmitterName] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [submitModalError, setSubmitModalError] = useState<string | null>(
		null,
	);
	const [submittedGivensList, setSubmittedGivensList] = useState<string[]>(
		[],
	);
	const [submitBanner, setSubmitBanner] = useState<SubmitBannerState | null>(
		null,
	);
	const saveFeedbackTimerRef = useRef<number | null>(null);

	// Clean up save feedback timeout on unmount
	useEffect(() => {
		return () => {
			if (saveFeedbackTimerRef.current !== null) {
				window.clearTimeout(saveFeedbackTimerRef.current);
			}
		};
	}, []);

	// End drag-selection when pointer releases anywhere
	useEffect(() => {
		const stopDragging = () => {
			isDraggingRef.current = false;
		};
		window.addEventListener("pointerup", stopDragging);
		window.addEventListener("pointercancel", stopDragging);
		return () => {
			window.removeEventListener("pointerup", stopDragging);
			window.removeEventListener("pointercancel", stopDragging);
		};
	}, []);

	// Elapsed game timer (runs only in Play and Test modes)
	useEffect(() => {
		if (appMode === "create" || isPaused || isSolved) return;
		const intervalId = window.setInterval(() => {
			setElapsedSeconds((prev) => prev + 1);
		}, 1000);
		return () => window.clearInterval(intervalId);
	}, [appMode, isPaused, isSolved]);

	// Persist active Play Mode game state to localStorage
	useEffect(() => {
		if (appMode !== "play") return;
		saveGameState({
			puzzleId: puzzle.id,
			snapshot: createSnapshot(board),
			elapsedSeconds,
			isSolved,
			highlightSettings,
			undoStack,
			redoStack,
			inputMode,
		});
	}, [
		appMode,
		puzzle.id,
		board,
		elapsedSeconds,
		isSolved,
		highlightSettings,
		undoStack,
		redoStack,
		inputMode,
	]);

	const digitCounts = useMemo(() => countDigitPlacements(board), [board]);
	const currentStat = stats[puzzle.difficulty];
	const filteredPuzzles = useMemo<PuzzleDefinition[]>(() => {
		if (selectedDifficultyFilter === "Custom") {
			return customPuzzles.filter((item) => item.isValidUnique);
		}
		return getPuzzlesByDifficulty(selectedDifficultyFilter);
	}, [customPuzzles, selectedDifficultyFilter]);

	const currentGivens = useMemo(
		() =>
			appMode === "create"
				? extractGivensFromBoard(board)
				: puzzle.givens,
		[appMode, board, puzzle.givens],
	);

	const isCurrentGivensSubmitted = useMemo(
		() =>
			appMode === "create" && submittedGivensList.includes(currentGivens),
		[appMode, currentGivens, submittedGivensList],
	);

	const clueCount = useMemo(
		() => currentGivens.split("").filter((ch) => ch !== "0").length,
		[currentGivens],
	);

	const activeDisplayPuzzle = useMemo<PuzzleDefinition>(() => {
		if (appMode === "create") {
			return {
				id: activeDraftId ?? "custom-draft",
				title: draftTitle.trim() || "Untitled Puzzle",
				difficulty: draftDifficulty,
				givens: currentGivens,
				solution: "",
			};
		}
		return puzzle;
	}, [
		activeDraftId,
		appMode,
		currentGivens,
		draftDifficulty,
		draftTitle,
		puzzle,
	]);

	const flashSaveFeedback = useCallback((message: string) => {
		if (saveFeedbackTimerRef.current !== null) {
			window.clearTimeout(saveFeedbackTimerRef.current);
		}
		setSaveFeedback(message);
		saveFeedbackTimerRef.current = window.setTimeout(() => {
			setSaveFeedback(null);
			saveFeedbackTimerRef.current = null;
		}, 1800);
	}, []);

	const commitBoardChange = useCallback(
		(nextBoard: BoardGrid, pushUndo = true) => {
			if (pushUndo) {
				const snap = createSnapshot(board);
				setUndoStack((prev) => [...prev, snap]);
				setRedoStack([]);
			}
			setBoard(nextBoard);

			if (appMode === "create") return;

			if (!isSolved && isBoardSolved(nextBoard, puzzle)) {
				setIsSolved(true);
				setIsPaused(false);
				if (appMode === "play") {
					setStats((prevStats) => {
						const diffStat = prevStats[puzzle.difficulty];
						const beatBest =
							diffStat.bestTimeSeconds === null ||
							elapsedSeconds < diffStat.bestTimeSeconds;
						setIsNewBestTime(beatBest);

						const updated: StatsMap = {
							...prevStats,
							[puzzle.difficulty]: {
								gamesWon: diffStat.gamesWon + 1,
								bestTimeSeconds: beatBest
									? elapsedSeconds
									: diffStat.bestTimeSeconds,
								totalTimeSeconds:
									diffStat.totalTimeSeconds + elapsedSeconds,
							},
						};
						saveStats(updated);
						return updated;
					});
					setPuzzleProgress((prevProgress) => {
						const prevEntry = prevProgress[puzzle.id];
						const nextBest =
							prevEntry?.bestTimeSeconds === null ||
							prevEntry?.bestTimeSeconds === undefined ||
							elapsedSeconds < prevEntry.bestTimeSeconds
								? elapsedSeconds
								: prevEntry.bestTimeSeconds;
						const updatedProgress: PuzzleProgressMap = {
							...prevProgress,
							[puzzle.id]: {
								completed: true,
								bestTimeSeconds: nextBest,
								wins: (prevEntry?.wins ?? 0) + 1,
							},
						};
						savePuzzleProgress(updatedProgress);
						return updatedProgress;
					});
					setIsVictoryModalOpen(true);
				}
			}
		},
		[appMode, board, elapsedSeconds, isSolved, puzzle],
	);

	const startPuzzle = useCallback((targetPuzzle: PuzzleDefinition) => {
		setPuzzle(targetPuzzle);
		setBoard(createBoardFromPuzzle(targetPuzzle));
		setSelectedCells([]);
		setFocusedCell(null);
		setHighlightedDigit(null);
		setUndoStack([]);
		setRedoStack([]);
		setElapsedSeconds(0);
		setIsPaused(false);
		setIsSolved(false);
		setIsVictoryModalOpen(false);
		setIsNewBestTime(false);
	}, []);

	const handleSelectPuzzle = useCallback(
		(targetPuzzle: PuzzleDefinition) => {
			if (targetPuzzle.id === puzzle.id) return;
			const isCustom = customPuzzles.some(
				(item) => item.id === targetPuzzle.id,
			);
			setSelectedDifficultyFilter(
				isCustom ? "Custom" : targetPuzzle.difficulty,
			);
			startPuzzle(targetPuzzle);
		},
		[customPuzzles, puzzle.id, startPuzzle],
	);

	const handleNextPuzzle = useCallback(() => {
		const isCurrentCustom = selectedDifficultyFilter === "Custom";
		const pool: PuzzleDefinition[] = isCurrentCustom
			? customPuzzles.filter((item) => item.isValidUnique)
			: getPuzzlesByDifficulty(puzzle.difficulty);
		if (pool.length === 0) return;
		const currentIndex = pool.findIndex((p) => p.id === puzzle.id);
		const nextPuzzle = pool[(currentIndex + 1) % pool.length];
		setSelectedDifficultyFilter(
			isCurrentCustom ? "Custom" : nextPuzzle.difficulty,
		);
		startPuzzle(nextPuzzle);
	}, [customPuzzles, puzzle.difficulty, puzzle.id, selectedDifficultyFilter, startPuzzle]);

	const handleEnterCreateMode = useCallback(() => {
		if (appMode === "create") return;
		if (appMode === "play") {
			setSavedPlaySession({
				puzzle,
				board: cloneBoard(board),
				elapsedSeconds,
				isSolved,
				undoStack,
				redoStack,
				inputMode,
				selectedDifficultyFilter,
			});
		}

		setAppMode("create");
		setBoard(createEmptyBoard());
		setActiveDraftId(null);
		setDraftTitle(`Custom Puzzle #${customPuzzles.length + 1}`);
		setDraftDifficulty("Medium");
		setInputMode("given");
		setSelectedCells([]);
		setFocusedCell(null);
		setHighlightedDigit(null);
		setUndoStack([]);
		setRedoStack([]);
		setIsPaused(false);
		setIsSolved(false);
		setIsVictoryModalOpen(false);
		setValidationResult(null);
		setHasUnsavedChanges(false);
		setSaveFeedback(null);
		setPendingSubmission(null);
		setSubmitModalError(null);
		setSubmitBanner(null);
	}, [
		appMode,
		board,
		customPuzzles.length,
		elapsedSeconds,
		inputMode,
		isSolved,
		puzzle,
		redoStack,
		selectedDifficultyFilter,
		undoStack,
	]);

	const handleExitCreateToPlay = useCallback(() => {
		setAppMode("play");
		setSavedEditorDraft(null);
		setValidationResult(null);
		setPendingSubmission(null);
		setSubmitModalError(null);
		setSubmitBanner(null);
		setSelectedCells([]);
		setFocusedCell(null);
		setHighlightedDigit(null);
		setIsPaused(false);
		setIsVictoryModalOpen(false);

		if (savedPlaySession) {
			const builtIn = getPuzzleById(savedPlaySession.puzzle.id);
			const customMatch = customPuzzles.find(
				(item) => item.id === savedPlaySession.puzzle.id && item.isValidUnique,
			);
			if (builtIn || customMatch) {
				setPuzzle(customMatch ?? savedPlaySession.puzzle);
				setBoard(savedPlaySession.board);
				setElapsedSeconds(savedPlaySession.elapsedSeconds);
				setIsSolved(savedPlaySession.isSolved);
				setUndoStack(savedPlaySession.undoStack);
				setRedoStack(savedPlaySession.redoStack);
				setInputMode(
					savedPlaySession.inputMode === "given"
						? "normal"
						: savedPlaySession.inputMode,
				);
				setSelectedDifficultyFilter(
					savedPlaySession.selectedDifficultyFilter,
				);
				setSavedPlaySession(null);
				return;
			}
		}

		const fallback = getPuzzlesByDifficulty("Easy")[0];
		setPuzzle(fallback);
		setBoard(createBoardFromPuzzle(fallback));
		setElapsedSeconds(0);
		setIsSolved(false);
		setUndoStack([]);
		setRedoStack([]);
		setInputMode("normal");
		setSelectedDifficultyFilter(fallback.difficulty);
		setSavedPlaySession(null);
	}, [customPuzzles, savedPlaySession]);

	const handleCheckValidity = useCallback(() => {
		const givens = extractGivensFromBoard(board);
		const result = validateCustomGivens(givens);
		setValidationResult(result);
	}, [board]);

	const handleOpenSubmitModal = useCallback(() => {
		if (appMode !== "create" || isSubmitting) return;
		const givens = extractGivensFromBoard(board);
		const result = validateCustomGivens(givens);
		setValidationResult(result);

		if (result.status !== "unique" || !result.solution) {
			setSubmitBanner(null);
			return;
		}

		if (submittedGivensList.includes(givens)) {
			setSubmitBanner({
				type: "info",
				message:
					"This exact puzzle has already been submitted. Edit the givens to submit a new version.",
			});
			return;
		}

		setSubmitBanner(null);
		setSubmitModalError(null);
		setPendingSubmission({
			title: draftTitle.trim() || "Untitled Puzzle",
			difficulty: draftDifficulty,
			clueCount: result.clueCount,
			givens,
			solution: result.solution,
		});
	}, [
		appMode,
		board,
		draftDifficulty,
		draftTitle,
		isSubmitting,
		submittedGivensList,
	]);

	const handleCloseSubmitModal = useCallback(() => {
		if (isSubmitting) return;
		setPendingSubmission(null);
		setSubmitModalError(null);
	}, [isSubmitting]);

	const handleConfirmSubmitPuzzle = useCallback(async () => {
		if (!pendingSubmission || isSubmitting) return;

		const recheck = validateCustomGivens(pendingSubmission.givens);
		if (recheck.status !== "unique" || !recheck.solution) {
			setValidationResult(recheck);
			setPendingSubmission(null);
			setSubmitModalError(null);
			return;
		}

		const payload: PuzzleSubmissionPayload = {
			title: pendingSubmission.title,
			difficulty: pendingSubmission.difficulty,
			submittedBy: submitterName,
			givens: pendingSubmission.givens,
			solution: recheck.solution,
		};

		setIsSubmitting(true);
		setSubmitModalError(null);

		const res = await submitPuzzleViaEmail(payload);
		setIsSubmitting(false);

		if (res.ok) {
			const confirmedGivens = pendingSubmission.givens;
			setSubmittedGivensList((prev) =>
				prev.includes(confirmedGivens)
					? prev
					: [...prev, confirmedGivens],
			);
			setPendingSubmission(null);
			setSubmitModalError(null);
			setSubmitBanner({
				type: "success",
				message: res.message,
			});
		} else {
			setSubmitModalError(res.message);
			setSubmitBanner({
				type: "error",
				message: res.message,
				fallbackMailtoUrl: buildSubmissionMailtoUrl(payload),
			});
		}
	}, [isSubmitting, pendingSubmission, submitterName]);

	const handleStartTestMode = useCallback(() => {
		if (appMode !== "create") return;
		const givens = extractGivensFromBoard(board);
		const result = validateCustomGivens(givens);
		setValidationResult(result);

		if (
			result.status === "empty" ||
			result.status === "conflict" ||
			result.status === "unsolvable"
		) {
			return;
		}

		setSavedEditorDraft({
			draftId: activeDraftId,
			title: draftTitle,
			difficulty: draftDifficulty,
			board: cloneBoard(board),
			undoStack,
			redoStack,
			validationResult: result,
			hasUnsavedChanges,
			inputMode,
		});

		const testPuzzle: PuzzleDefinition = {
			id: activeDraftId ?? "custom-test",
			title: draftTitle.trim() || "Untitled Puzzle",
			difficulty: draftDifficulty,
			givens,
			solution: result.solution ?? "",
		};

		setAppMode("test");
		setPuzzle(testPuzzle);
		setBoard(createBoardFromPuzzle(testPuzzle));
		setInputMode("normal");
		setSelectedCells([]);
		setFocusedCell(null);
		setHighlightedDigit(null);
		setUndoStack([]);
		setRedoStack([]);
		setElapsedSeconds(0);
		setIsPaused(false);
		setIsSolved(false);
		setIsVictoryModalOpen(false);
		setValidationResult(null);
		setPendingSubmission(null);
		setSubmitModalError(null);
		setSubmitBanner(null);
	}, [
		activeDraftId,
		appMode,
		board,
		draftDifficulty,
		draftTitle,
		hasUnsavedChanges,
		inputMode,
		redoStack,
		undoStack,
	]);

	const handleBackToEditor = useCallback(() => {
		setAppMode("create");
		setIsPaused(false);
		setIsSolved(false);
		setIsVictoryModalOpen(false);
		setSelectedCells([]);
		setFocusedCell(null);
		setHighlightedDigit(null);

		if (savedEditorDraft) {
			setActiveDraftId(savedEditorDraft.draftId);
			setDraftTitle(savedEditorDraft.title);
			setDraftDifficulty(savedEditorDraft.difficulty);
			setBoard(savedEditorDraft.board);
			setUndoStack(savedEditorDraft.undoStack);
			setRedoStack(savedEditorDraft.redoStack);
			setValidationResult(savedEditorDraft.validationResult);
			setHasUnsavedChanges(savedEditorDraft.hasUnsavedChanges);
			setInputMode(savedEditorDraft.inputMode);
			setSavedEditorDraft(null);
		} else {
			setInputMode("given");
		}
	}, [savedEditorDraft]);

	const handleNewCustomPuzzle = useCallback(() => {
		setAppMode("create");
		setSavedEditorDraft(null);
		setBoard(createEmptyBoard());
		setActiveDraftId(null);
		setDraftTitle(`Custom Puzzle #${customPuzzles.length + 1}`);
		setDraftDifficulty("Medium");
		setInputMode("given");
		setSelectedCells([]);
		setFocusedCell(null);
		setHighlightedDigit(null);
		setUndoStack([]);
		setRedoStack([]);
		setValidationResult(null);
		setHasUnsavedChanges(false);
		setSaveFeedback(null);
		setPendingSubmission(null);
		setSubmitModalError(null);
		setSubmitBanner(null);
	}, [customPuzzles.length]);

	const handleSaveCustomPuzzle = useCallback(() => {
		const givens = extractGivensFromBoard(board);
		const result = validateCustomGivens(givens);
		setValidationResult(result);

		const now = Date.now();
		const cleanTitle = draftTitle.trim() || "Untitled Puzzle";
		const existingIndex =
			activeDraftId !== null
				? customPuzzles.findIndex((item) => item.id === activeDraftId)
				: -1;

		let updatedList: CustomPuzzle[];
		let targetId: string;

		if (existingIndex >= 0) {
			const existing = customPuzzles[existingIndex];
			targetId = existing.id;
			const updatedItem: CustomPuzzle = {
				...existing,
				title: cleanTitle,
				difficulty: draftDifficulty,
				givens,
				solution: result.solution ?? "",
				isValidUnique: result.status === "unique",
				updatedAt: now,
			};
			updatedList = customPuzzles.map((item, idx) =>
				idx === existingIndex ? updatedItem : item,
			);
		} else {
			targetId = `custom-${now}`;
			const createdItem: CustomPuzzle = {
				id: targetId,
				title: cleanTitle,
				difficulty: draftDifficulty,
				givens,
				solution: result.solution ?? "",
				isValidUnique: result.status === "unique",
				createdAt: now,
				updatedAt: now,
			};
			updatedList = [createdItem, ...customPuzzles];
		}

		setCustomPuzzles(updatedList);
		saveCustomPuzzles(updatedList);
		setActiveDraftId(targetId);
		setDraftTitle(cleanTitle);
		setHasUnsavedChanges(false);
		flashSaveFeedback("Saved!");
	}, [
		activeDraftId,
		board,
		customPuzzles,
		draftDifficulty,
		draftTitle,
		flashSaveFeedback,
	]);

	const handleLoadCustomPuzzle = useCallback((target: CustomPuzzle) => {
		setAppMode("create");
		setSavedEditorDraft(null);
		setActiveDraftId(target.id);
		setDraftTitle(target.title);
		setDraftDifficulty(target.difficulty);
		setBoard(createBoardFromPuzzle(target));
		setInputMode("given");
		setSelectedCells([]);
		setFocusedCell(null);
		setHighlightedDigit(null);
		setUndoStack([]);
		setRedoStack([]);
		setValidationResult(null);
		setHasUnsavedChanges(false);
		setSaveFeedback(null);
		setPendingSubmission(null);
		setSubmitModalError(null);
		setSubmitBanner(null);
	}, []);

	const handleDeleteCustomPuzzle = useCallback(
		(id: string) => {
			const updatedList = customPuzzles.filter((item) => item.id !== id);
			setCustomPuzzles(updatedList);
			saveCustomPuzzles(updatedList);
			if (activeDraftId === id) {
				setActiveDraftId(null);
				setHasUnsavedChanges(true);
			}
		},
		[activeDraftId, customPuzzles],
	);

	const handleImportGivens = useCallback(
		(givens: string) => {
			const tempPuzzle: PuzzleDefinition = {
				id: activeDraftId ?? "custom-import",
				title: draftTitle,
				difficulty: draftDifficulty,
				givens,
				solution: "",
			};
			const snap = createSnapshot(board);
			setUndoStack((prev) => [...prev, snap]);
			setRedoStack([]);
			setBoard(createBoardFromPuzzle(tempPuzzle));
			setValidationResult(null);
			setSubmitBanner(null);
			setHasUnsavedChanges(true);
			setSelectedCells([]);
			setFocusedCell(null);
		},
		[activeDraftId, board, draftDifficulty, draftTitle],
	);

	const handleRestartPuzzle = useCallback(() => {
		if (appMode === "create") {
			const snap = createSnapshot(board);
			setUndoStack((prev) => [...prev, snap]);
			setRedoStack([]);
			setBoard(createEmptyBoard());
			setSelectedCells([]);
			setFocusedCell(null);
			setHighlightedDigit(null);
			setValidationResult(null);
			setSubmitBanner(null);
			setHasUnsavedChanges(true);
			return;
		}
		startPuzzle(puzzle);
	}, [appMode, board, puzzle, startPuzzle]);

	const syncPencilModeForSingleCell = useCallback(
		(coord: CellCoord) => {
			if (inputMode === "normal" || inputMode === "given") return;
			const cell = board[coord.row]?.[coord.col];
			if (!cell || cell.given || cell.value !== null) return;
			if (cell.cornerMarks.length > 0) {
				setInputMode("corner");
			} else if (cell.centerMarks.length > 0) {
				setInputMode("center");
			}
		},
		[board, inputMode],
	);

	const handleChangeInputMode = useCallback(
		(nextMode: InputMode) => {
			setInputMode(nextMode);
			if (
				isPaused ||
				isSolved ||
				(nextMode !== "corner" && nextMode !== "center") ||
				selectedCells.length === 0
			) {
				return;
			}

			const nextBoard = cloneBoard(board);
			let converted = false;

			for (const { row, col } of selectedCells) {
				const target = nextBoard[row]?.[col];
				if (!target || target.given || target.value !== null) continue;

				if (nextMode === "corner" && target.centerMarks.length > 0) {
					target.cornerMarks = Array.from(
						new Set([...target.cornerMarks, ...target.centerMarks]),
					).sort((a, b) => a - b);
					target.centerMarks = [];
					converted = true;
				} else if (
					nextMode === "center" &&
					target.cornerMarks.length > 0
				) {
					target.centerMarks = Array.from(
						new Set([...target.centerMarks, ...target.cornerMarks]),
					).sort((a, b) => a - b);
					target.cornerMarks = [];
					converted = true;
				}
			}

			if (converted) {
				commitBoardChange(nextBoard);
			}
		},
		[board, commitBoardChange, isPaused, isSolved, selectedCells],
	);

	const handleCellPointerDown = useCallback(
		(row: number, col: number, e: PointerEvent<HTMLButtonElement>) => {
			if (e.pointerType === "mouse" && e.button !== 0) return;
			e.preventDefault();
			if (isPaused) return;

			const exists = selectedCells.some(
				(c) => c.row === row && c.col === col,
			);
			const isAdditive =
				isMultiSelectMode || e.ctrlKey || e.metaKey || e.shiftKey;

			if (!isAdditive) {
				if (exists && selectedCells.length === 1) {
					isDraggingRef.current = false;
					setSelectedCells([]);
					setFocusedCell(null);
				} else {
					isDraggingRef.current = true;
					const coord = { row, col };
					setSelectedCells([coord]);
					setFocusedCell(coord);
					syncPencilModeForSingleCell(coord);
				}
			} else if (exists) {
				isDraggingRef.current = false;
				const next = selectedCells.filter(
					(c) => !(c.row === row && c.col === col),
				);
				setSelectedCells(next);
				if (next.length === 0) {
					setFocusedCell(null);
				} else {
					const nextFocused = next[next.length - 1];
					setFocusedCell(nextFocused);
					if (next.length === 1) {
						syncPencilModeForSingleCell(nextFocused);
					}
				}
			} else {
				isDraggingRef.current = true;
				const next = [...selectedCells, { row, col }];
				setSelectedCells(next);
				setFocusedCell({ row, col });
				if (next.length === 1) {
					syncPencilModeForSingleCell({ row, col });
				}
			}

			setHighlightedDigit(null);
		},
		[
			isMultiSelectMode,
			isPaused,
			selectedCells,
			syncPencilModeForSingleCell,
		],
	);

	const handleCellPointerEnter = useCallback(
		(row: number, col: number) => {
			if (!isDraggingRef.current || isPaused) return;
			setFocusedCell({ row, col });
			setSelectedCells((prev) =>
				prev.some((c) => c.row === row && c.col === col)
					? prev
					: [...prev, { row, col }],
			);
		},
		[isPaused],
	);

	const handleClearSelection = useCallback(() => {
		setSelectedCells([]);
		setFocusedCell(null);
		setHighlightedDigit(null);
	}, []);

	const handleDigitInput = useCallback(
		(digit: number, modeOverride?: InputMode) => {
			if (isPaused || isSolved) return;
			if (selectedCells.length === 0) {
				setHighlightedDigit((prev) => (prev === digit ? null : digit));
				return;
			}

			const isGivenPlacement =
				appMode === "create" && !modeOverride && inputMode === "given";

			if (isGivenPlacement) {
				const nextBoard = cloneBoard(board);
				let changed = false;
				for (const { row, col } of selectedCells) {
					const target = nextBoard[row]?.[col];
					if (!target) continue;
					if (target.value !== digit || !target.given) {
						target.value = digit;
						target.given = true;
						target.cornerMarks = [];
						target.centerMarks = [];
						removePeerPencilMarks(nextBoard, row, col, digit);
						changed = true;
					}
				}
				if (!changed) return;
				setHighlightedDigit(null);
				setValidationResult(null);
				setSubmitBanner(null);
				setHasUnsavedChanges(true);
				commitBoardChange(nextBoard);
				return;
			}

			const editableTargets = selectedCells.filter(
				({ row, col }) => !board[row]?.[col]?.given,
			);
			if (editableTargets.length === 0) {
				setHighlightedDigit((prev) => (prev === digit ? null : digit));
				return;
			}

			const effectiveMode: InputMode =
				selectedCells.length > 1
					? "corner"
					: (modeOverride ?? inputMode);
			const nextBoard = cloneBoard(board);

			if (effectiveMode === "normal") {
				let changed = false;
				for (const { row, col } of editableTargets) {
					const target = nextBoard[row][col];
					if (target.value !== digit) {
						target.value = digit;
						removePeerPencilMarks(nextBoard, row, col, digit);
						changed = true;
					}
				}
				if (!changed) return;
				setHighlightedDigit(null);
				commitBoardChange(nextBoard);
				return;
			}

			// Corner and center pencil marks apply only to cells without a main value
			const emptyTargets = editableTargets.filter(
				({ row, col }) => board[row][col].value === null,
			);
			if (emptyTargets.length === 0) return;

			if (effectiveMode === "corner") {
				const allHaveDigit = emptyTargets.every(
					({ row, col }) =>
						board[row][col].cornerMarks.includes(digit) ||
						board[row][col].centerMarks.includes(digit),
				);
				for (const { row, col } of emptyTargets) {
					const target = nextBoard[row][col];
					const mergedCorner = Array.from(
						new Set([...target.cornerMarks, ...target.centerMarks]),
					);
					target.centerMarks = [];
					if (allHaveDigit) {
						target.cornerMarks = mergedCorner
							.filter((d) => d !== digit)
							.sort((a, b) => a - b);
					} else {
						target.cornerMarks = Array.from(
							new Set([...mergedCorner, digit]),
						).sort((a, b) => a - b);
					}
				}
				commitBoardChange(nextBoard);
				return;
			}

			if (effectiveMode === "center") {
				const allHaveDigit = emptyTargets.every(
					({ row, col }) =>
						board[row][col].centerMarks.includes(digit) ||
						board[row][col].cornerMarks.includes(digit),
				);
				for (const { row, col } of emptyTargets) {
					const target = nextBoard[row][col];
					const mergedCenter = Array.from(
						new Set([...target.centerMarks, ...target.cornerMarks]),
					);
					target.cornerMarks = [];
					if (allHaveDigit) {
						target.centerMarks = mergedCenter
							.filter((d) => d !== digit)
							.sort((a, b) => a - b);
					} else {
						target.centerMarks = Array.from(
							new Set([...mergedCenter, digit]),
						).sort((a, b) => a - b);
					}
				}
				commitBoardChange(nextBoard);
			}
		},
		[
			appMode,
			board,
			commitBoardChange,
			inputMode,
			isPaused,
			isSolved,
			selectedCells,
		],
	);

	const handleErase = useCallback(() => {
		if (isPaused || isSolved || selectedCells.length === 0) return;

		const canEraseGiven = appMode === "create" && inputMode === "given";
		const nextBoard = cloneBoard(board);
		let changed = false;
		let changedGiven = false;

		for (const { row, col } of selectedCells) {
			const cell = nextBoard[row]?.[col];
			if (!cell || (!canEraseGiven && cell.given)) continue;

			const isAlreadyEmpty =
				cell.value === null &&
				!cell.given &&
				cell.cornerMarks.length === 0 &&
				cell.centerMarks.length === 0;
			if (isAlreadyEmpty) continue;

			if (cell.given) changedGiven = true;
			cell.value = null;
			cell.given = false;
			cell.cornerMarks = [];
			cell.centerMarks = [];
			changed = true;
		}

		if (!changed) return;
		if (changedGiven) {
			setValidationResult(null);
			setSubmitBanner(null);
			setHasUnsavedChanges(true);
		}
		commitBoardChange(nextBoard);
	}, [
		appMode,
		board,
		commitBoardChange,
		inputMode,
		isPaused,
		isSolved,
		selectedCells,
	]);

	const handleUndo = useCallback(() => {
		if (isPaused || isSolved || undoStack.length === 0) return;
		const previousSnap = undoStack[undoStack.length - 1];
		const currentSnap = createSnapshot(board);
		const restoreGivens = appMode === "create";

		setUndoStack((prev) => prev.slice(0, -1));
		setRedoStack((prev) => [...prev, currentSnap]);
		setBoard((prevBoard) =>
			applySnapshot(prevBoard, previousSnap, restoreGivens),
		);
		if (restoreGivens) {
			setValidationResult(null);
			setSubmitBanner(null);
			setHasUnsavedChanges(true);
		}
	}, [appMode, board, isPaused, isSolved, undoStack]);

	const handleRedo = useCallback(() => {
		if (isPaused || isSolved || redoStack.length === 0) return;
		const nextSnap = redoStack[redoStack.length - 1];
		const currentSnap = createSnapshot(board);
		const restoreGivens = appMode === "create";

		setRedoStack((prev) => prev.slice(0, -1));
		setUndoStack((prev) => [...prev, currentSnap]);
		setBoard((prevBoard) =>
			applySnapshot(prevBoard, nextSnap, restoreGivens),
		);
		if (restoreGivens) {
			setValidationResult(null);
			setSubmitBanner(null);
			setHasUnsavedChanges(true);
		}
	}, [appMode, board, isPaused, isSolved, redoStack]);

	const handleHint = useCallback(() => {
		if (
			appMode === "create" ||
			puzzle.solution.length !== 81 ||
			isPaused ||
			isSolved
		) {
			return;
		}

		let targetCoords: CellCoord | null = null;
		if (focusedCell) {
			const sel = board[focusedCell.row][focusedCell.col];
			const expected = Number(
				puzzle.solution[focusedCell.row * 9 + focusedCell.col],
			);
			if (!sel.given && sel.value !== expected) {
				targetCoords = focusedCell;
			}
		}

		if (!targetCoords) {
			const emptyCells: CellCoord[] = [];
			const incorrectCells: CellCoord[] = [];
			for (let r = 0; r < 9; r++) {
				for (let c = 0; c < 9; c++) {
					const cell = board[r][c];
					if (cell.given) continue;
					const expected = Number(puzzle.solution[r * 9 + c]);
					if (cell.value === null) {
						emptyCells.push({ row: r, col: c });
					} else if (cell.value !== expected) {
						incorrectCells.push({ row: r, col: c });
					}
				}
			}
			const pool = emptyCells.length > 0 ? emptyCells : incorrectCells;
			if (pool.length === 0) return;
			targetCoords = pool[Math.floor(Math.random() * pool.length)];
		}

		const { row, col } = targetCoords;
		const expectedDigit = Number(puzzle.solution[row * 9 + col]);
		const nextBoard = cloneBoard(board);
		nextBoard[row][col].value = expectedDigit;
		nextBoard[row][col].cornerMarks = [];
		nextBoard[row][col].centerMarks = [];
		removePeerPencilMarks(nextBoard, row, col, expectedDigit);
		setSelectedCells([{ row, col }]);
		setFocusedCell({ row, col });
		setHighlightedDigit(null);
		commitBoardChange(nextBoard);
	}, [
		appMode,
		board,
		commitBoardChange,
		focusedCell,
		isPaused,
		isSolved,
		puzzle.solution,
	]);

	const handleAutoNotes = useCallback(() => {
		if (isPaused || isSolved) return;
		const nextBoard = populateAutoNotes(board, "corner");
		commitBoardChange(nextBoard);
	}, [board, commitBoardChange, isPaused, isSolved]);

	const handleToggleHighlightSetting = useCallback(
		(key: keyof HighlightSettings) => {
			setHighlightSettings((prev) => ({
				...prev,
				[key]: !prev[key],
			}));
		},
		[],
	);

	// Global keyboard controls
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (pendingSubmission !== null) {
				if (e.key === "Escape" && !isSubmitting) {
					e.preventDefault();
					handleCloseSubmitModal();
				}
				return;
			}

			const target = e.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			const lowerKey = e.key.toLowerCase();

			// Pause / Resume shortcuts (Play and Test modes only)
			if (
				appMode !== "create" &&
				!e.ctrlKey &&
				!e.metaKey &&
				!e.altKey &&
				(lowerKey === "p" || e.code === "Space")
			) {
				if (isSolved) return;
				e.preventDefault();
				setIsPaused((prev) => !prev);
				return;
			}

			if (isPaused || isSolved) return;

			// Clear selection with Escape
			if (e.key === "Escape") {
				e.preventDefault();
				handleClearSelection();
				return;
			}

			// Ctrl+A / Cmd+A selects all empty non-given cells
			if ((e.ctrlKey || e.metaKey) && lowerKey === "a") {
				e.preventDefault();
				const emptyCells: CellCoord[] = [];
				for (let r = 0; r < 9; r++) {
					for (let c = 0; c < 9; c++) {
						const cell = board[r][c];
						if (!cell.given && cell.value === null) {
							emptyCells.push({ row: r, col: c });
						}
					}
				}
				setSelectedCells(emptyCells);
				setFocusedCell(emptyCells.length > 0 ? emptyCells[0] : null);
				setHighlightedDigit(null);
				return;
			}

			// Undo / Redo shortcuts
			if (e.ctrlKey || e.metaKey) {
				if (lowerKey === "z") {
					e.preventDefault();
					if (e.shiftKey) {
						handleRedo();
					} else {
						handleUndo();
					}
					return;
				}
				if (lowerKey === "y") {
					e.preventDefault();
					handleRedo();
					return;
				}
			}

			// Input mode shortcuts
			if (!e.ctrlKey && !e.metaKey && !e.altKey) {
				if (appMode === "create" && lowerKey === "g") {
					e.preventDefault();
					handleChangeInputMode("given");
					return;
				}
				if (lowerKey === "z") {
					e.preventDefault();
					handleChangeInputMode("normal");
					return;
				}
				if (lowerKey === "x" || lowerKey === "n") {
					e.preventDefault();
					handleChangeInputMode(
						inputMode === "corner"
							? appMode === "create"
								? "given"
								: "normal"
							: "corner",
					);
					return;
				}
				if (lowerKey === "c" || lowerKey === "m") {
					e.preventDefault();
					handleChangeInputMode(
						inputMode === "center"
							? appMode === "create"
								? "given"
								: "normal"
							: "center",
					);
					return;
				}
				if (e.key === "Tab") {
					e.preventDefault();
					if (appMode === "create") {
						handleChangeInputMode(
							inputMode === "given"
								? "normal"
								: inputMode === "normal"
									? "corner"
									: inputMode === "corner"
										? "center"
										: "given",
						);
					} else {
						handleChangeInputMode(
							inputMode === "normal"
								? "corner"
								: inputMode === "corner"
									? "center"
									: "normal",
						);
					}
					return;
				}
			}

			// Arrow / WASD grid navigation (Shift or Multi-Select mode extends selection)
			let dRow = 0;
			let dCol = 0;
			if (e.key === "ArrowUp" || (!e.ctrlKey && lowerKey === "w")) {
				dRow = -1;
			} else if (
				e.key === "ArrowDown" ||
				(!e.ctrlKey && lowerKey === "s")
			) {
				dRow = 1;
			} else if (
				e.key === "ArrowLeft" ||
				(!e.ctrlKey && lowerKey === "a")
			) {
				dCol = -1;
			} else if (
				e.key === "ArrowRight" ||
				(!e.ctrlKey && lowerKey === "d")
			) {
				dCol = 1;
			}

			if (dRow !== 0 || dCol !== 0) {
				e.preventDefault();
				const nextCoord: CellCoord = focusedCell
					? {
							row: (focusedCell.row + dRow + 9) % 9,
							col: (focusedCell.col + dCol + 9) % 9,
						}
					: { row: 0, col: 0 };

				setFocusedCell(nextCoord);
				if (e.shiftKey || isMultiSelectMode) {
					const nextList = selectedCells.some(
						(c) =>
							c.row === nextCoord.row && c.col === nextCoord.col,
					)
						? selectedCells
						: [...selectedCells, nextCoord];
					setSelectedCells(nextList);
					if (nextList.length === 1) {
						syncPencilModeForSingleCell(nextCoord);
					}
				} else {
					setSelectedCells([nextCoord]);
					syncPencilModeForSingleCell(nextCoord);
				}
				setHighlightedDigit(null);
				return;
			}

			// Erase shortcuts
			if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
				e.preventDefault();
				handleErase();
				return;
			}

			// Digit 1-9 input (supports Shift for Corner, Alt for Center)
			const digit = extractDigitFromKeyEvent(e);
			if (digit !== null && !e.ctrlKey && !e.metaKey) {
				e.preventDefault();
				const override: InputMode | undefined = e.shiftKey
					? "corner"
					: e.altKey
						? "center"
						: undefined;
				handleDigitInput(digit, override);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [
		appMode,
		board,
		focusedCell,
		handleChangeInputMode,
		handleClearSelection,
		handleCloseSubmitModal,
		handleDigitInput,
		handleErase,
		handleRedo,
		handleUndo,
		inputMode,
		isMultiSelectMode,
		isPaused,
		isSolved,
		isSubmitting,
		pendingSubmission,
		selectedCells,
		syncPencilModeForSingleCell,
	]);

	const disableHint =
		appMode === "create" ||
		(appMode === "test" && puzzle.solution.length !== 81);

	return (
		<div className="w-full h-full flex flex-col items-center overflow-y-auto">
			<section className="w-full max-w-[1500px] pt-8 pb-16 px-2 xl:px-4 flex flex-col items-center gap-6">
				{/* Header */}
				<div className="flex flex-col items-center text-center">
					<h1 className="text-4xl font-bold tracking-tight text-[#ABD1FF]">
						Sudoku
					</h1>
					<div className="mt-3 h-px w-24 bg-[#ABD1FF]" />
					<h2 className="text-[#ABD1FF] text-xl font-bold pt-2">
						{activeDisplayPuzzle.title}
					</h2>
					<div className="flex flex-row items-center gap-4 mt-2 text-md text-[#ABD1FF]">
						<span className="text-[#ABD1FF]">
							{appMode === "create"
								? "Mode:"
								: appMode === "test"
									? "Testing:"
									: "Difficulty:"}{" "}
							<span className="font-semibold">
								{appMode === "create"
									? `Custom Maker (${draftDifficulty})`
									: appMode === "test"
										? draftDifficulty
										: puzzle.difficulty}
							</span>
						</span>
						{appMode === "play" ? (
							<>
								<span className="text-[#ABD1FF]">|</span>
								<span>
									Won:{" "}
									<span className="text-emerald-300 font-semibold">
										{currentStat.gamesWon}
									</span>
								</span>
								<span className="text-[#ABD1FF]">|</span>
								<span>
									Best Time:{" "}
									<span className="text-purple-300 font-semibold">
										{currentStat.bestTimeSeconds !== null
											? formatTime(
													currentStat.bestTimeSeconds,
												)
											: "-"}
									</span>
								</span>
							</>
						) : (
							<>
								<span className="text-[#ABD1FF]">|</span>
								<span>
									Givens:{" "}
									<span className="text-white font-semibold">
										{clueCount}
									</span>
								</span>
							</>
						)}
					</div>
				</div>

				{/* Top HUD Bar */}
				<div className="w-full max-w-5xl rounded-lg border-2 border-[#0E1F37] bg-[#1E304A] px-4 py-3 flex flex-row flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-xs text-[#ABD1FF]">
						<span className="font-semibold uppercase tracking-wider text-[#A6D6FF]">
							{appMode === "create"
								? "Custom Maker:"
								: appMode === "test"
									? "Testing Custom:"
									: "Active Level:"}
						</span>
						<span className="font-semibold text-white">
							{activeDisplayPuzzle.title}
						</span>
					</div>

					{/* Timer & Session Actions */}
					<div className="flex flex-row items-center gap-2.5 flex-wrap">
						{appMode !== "create" && (
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-950/80 border border-slate-800">
								<span className="text-sm font-mono font-semibold text-slate-100 tabular-nums">
									{formatTime(elapsedSeconds)}
								</span>
								{!isSolved && (
									<button
										type="button"
										onClick={() => setIsPaused((p) => !p)}
										aria-label={
											isPaused
												? "Resume game"
												: "Pause game"
										}
										title={
											isPaused
												? "Resume (P / Space)"
												: "Pause (P / Space)"
										}
										className="text-slate-300 hover:text-purple-300 transition-colors cursor-pointer"
									>
										{isPaused ? (
											<Play className="size-4" />
										) : (
											<Pause className="size-4" />
										)}
									</button>
								)}
							</div>
						)}

						<button
							type="button"
							onClick={handleRestartPuzzle}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-700 bg-slate-800/70 hover:border-slate-500 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
						>
							<RotateCcw className="size-3.5" />
							{appMode === "create" ? "Clear Board" : "Restart"}
						</button>

						{appMode === "play" && (
							<button
								type="button"
								onClick={handleEnterCreateMode}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#46A7FC] bg-[#2A7CC3] hover:bg-[#348BD6] text-xs font-semibold text-white transition-colors cursor-pointer"
							>
								<Hammer className="size-3.5" />
								Create Puzzle
							</button>
						)}

						{appMode === "create" && (
							<>
								<button
									type="button"
									onClick={handleCheckValidity}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-500/70 bg-emerald-900/50 hover:bg-emerald-800/60 text-xs font-semibold text-emerald-100 transition-colors cursor-pointer"
								>
									<ShieldCheck className="size-3.5" />
									Check Validity
								</button>

								<button
									type="button"
									onClick={handleStartTestMode}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#46A7FC] bg-[#2A7CC3] hover:bg-[#348BD6] text-xs font-semibold text-white transition-colors cursor-pointer"
								>
									<Play className="size-3.5" />
									Test Puzzle
								</button>

								<button
									type="button"
									disabled={
										isSubmitting ||
										isCurrentGivensSubmitted
									}
									onClick={handleOpenSubmitModal}
									title={
										isCurrentGivensSubmitted
											? "This exact puzzle has already been submitted in this session"
											: "Validate and submit this puzzle by email"
									}
									className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-colors ${
										isCurrentGivensSubmitted
											? "border-emerald-500/50 bg-emerald-950/60 text-emerald-300 opacity-75 cursor-not-allowed"
											: "border-purple-400/70 bg-purple-700 hover:bg-purple-600 text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
									}`}
								>
									{isCurrentGivensSubmitted ? (
										<Check className="size-3.5" />
									) : (
										<Send className="size-3.5" />
									)}
									{isCurrentGivensSubmitted
										? "Submitted"
										: "Submit Puzzle"}
								</button>

								<button
									type="button"
									onClick={handleExitCreateToPlay}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-600 bg-slate-800/80 hover:border-slate-400 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
								>
									<ArrowLeft className="size-3.5" />
									Back to Play
								</button>
							</>
						)}

						{appMode === "test" && (
							<button
								type="button"
								onClick={handleBackToEditor}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#46A7FC] bg-[#2A7CC3] hover:bg-[#348BD6] text-xs font-semibold text-white transition-colors cursor-pointer"
							>
								<ArrowLeft className="size-3.5" />
								Back to Editor
							</button>
						)}
					</div>
				</div>

				{/* Validation Status Banner (Creator Mode) */}
				{appMode === "create" && validationResult !== null && (
					<div
						role="status"
						className={`w-full max-w-5xl rounded-lg border px-4 py-3 flex flex-row items-center justify-between gap-3 ${
							validationResult.status === "unique"
								? "border-emerald-500/70 bg-emerald-950/50 text-emerald-100"
								: validationResult.status === "multiple"
									? "border-amber-500/70 bg-amber-950/50 text-amber-100"
									: "border-rose-500/70 bg-rose-950/50 text-rose-100"
						}`}
					>
						<div className="flex items-center gap-2.5 text-sm font-medium">
							{validationResult.status === "unique" ? (
								<CheckCircle2 className="size-4 text-emerald-300 shrink-0" />
							) : validationResult.status === "multiple" ? (
								<AlertTriangle className="size-4 text-amber-300 shrink-0" />
							) : (
								<XCircle className="size-4 text-rose-300 shrink-0" />
							)}
							<span>{validationResult.message}</span>
						</div>
						<button
							type="button"
							onClick={() => setValidationResult(null)}
							aria-label="Dismiss validation status"
							className="text-current/70 hover:text-current transition-colors cursor-pointer"
						>
							<X className="size-4" />
						</button>
					</div>
				)}

				{/* Submission Status Banner (Creator Mode) */}
				{appMode === "create" && submitBanner !== null && (
					<div
						role="status"
						className={`w-full max-w-5xl rounded-lg border px-4 py-3 flex flex-row flex-wrap items-center justify-between gap-3 ${
							submitBanner.type === "success"
								? "border-emerald-500/70 bg-emerald-950/50 text-emerald-100"
								: submitBanner.type === "info"
									? "border-sky-500/70 bg-sky-950/50 text-sky-100"
									: "border-rose-500/70 bg-rose-950/50 text-rose-100"
						}`}
					>
						<div className="flex items-center gap-2.5 text-sm font-medium">
							{submitBanner.type === "success" ? (
								<CheckCircle2 className="size-4 text-emerald-300 shrink-0" />
							) : submitBanner.type === "info" ? (
								<Info className="size-4 text-sky-300 shrink-0" />
							) : (
								<XCircle className="size-4 text-rose-300 shrink-0" />
							)}
							<span>{submitBanner.message}</span>
						</div>
						<div className="flex items-center gap-2">
							{submitBanner.fallbackMailtoUrl && (
								<a
									href={submitBanner.fallbackMailtoUrl}
									className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-rose-400/60 bg-rose-900/50 hover:bg-rose-800/60 text-xs font-semibold text-white transition-colors"
								>
									<Mail className="size-3.5" />
									Open in Email App
								</a>
							)}
							<button
								type="button"
								onClick={() => setSubmitBanner(null)}
								aria-label="Dismiss submission status"
								className="text-current/70 hover:text-current transition-colors cursor-pointer"
							>
								<X className="size-4" />
							</button>
						</div>
					</div>
				)}

				{/* Inline Solved Banner (Play Mode & Test Mode) */}
				{isSolved && appMode === "play" && (
					<div className="w-full max-w-5xl rounded-lg border border-emerald-600/60 bg-emerald-950/40 px-4 py-3 flex flex-row flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-2.5 text-emerald-200 text-sm font-medium">
							<Trophy className="size-4 text-emerald-300 shrink-0" />
							<span>
								Solved <strong>{puzzle.title}</strong> (
								{puzzle.difficulty}) in{" "}
								<span className="font-mono font-bold">
									{formatTime(elapsedSeconds)}
								</span>
							</span>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setIsVictoryModalOpen(true)}
								className="px-3 py-1 rounded-md border border-emerald-500/50 bg-emerald-900/40 hover:bg-emerald-800/50 text-xs font-semibold text-emerald-200 transition-colors cursor-pointer"
							>
								View Summary
							</button>
							<button
								type="button"
								onClick={handleNextPuzzle}
								className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors cursor-pointer"
							>
								Next Level
							</button>
						</div>
					</div>
				)}

				{isSolved && appMode === "test" && (
					<div className="w-full max-w-5xl rounded-lg border border-emerald-500/70 bg-emerald-950/50 px-4 py-3 flex flex-row flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-2.5 text-emerald-100 text-sm font-medium">
							<Trophy className="size-4 text-emerald-300 shrink-0" />
							<span>
								Test Passed! Solved{" "}
								<strong>{puzzle.title}</strong> in{" "}
								<span className="font-mono font-bold">
									{formatTime(elapsedSeconds)}
								</span>
							</span>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={handleRestartPuzzle}
								className="px-3 py-1 rounded-md border border-emerald-500/50 bg-emerald-900/40 hover:bg-emerald-800/50 text-xs font-semibold text-emerald-100 transition-colors cursor-pointer"
							>
								Restart Test
							</button>
							<button
								type="button"
								onClick={handleBackToEditor}
								className="px-3 py-1 rounded-md bg-[#2A7CC3] hover:bg-[#348BD6] text-xs font-semibold text-white transition-colors cursor-pointer"
							>
								Back to Editor
							</button>
						</div>
					</div>
				)}

				{/* Main Play Area */}
				<div className="w-full flex flex-col xl:flex-row items-center xl:items-start justify-center gap-6 xl:gap-4 2xl:gap-6">
					{appMode === "play" ? (
						<SudokuLevelSelector
							selectedDifficulty={selectedDifficultyFilter}
							onSelectDifficulty={setSelectedDifficultyFilter}
							puzzles={filteredPuzzles}
							activePuzzleId={puzzle.id}
							progressMap={puzzleProgress}
							onSelectPuzzle={handleSelectPuzzle}
							onOpenCustomMaker={handleEnterCreateMode}
						/>
					) : (
						<SudokuCustomPanel
							draftTitle={draftTitle}
							onChangeDraftTitle={(title) => {
								setDraftTitle(title);
								setHasUnsavedChanges(true);
							}}
							draftDifficulty={draftDifficulty}
							onChangeDraftDifficulty={(diff) => {
								setDraftDifficulty(diff);
								setHasUnsavedChanges(true);
							}}
							clueCount={clueCount}
							currentGivens={currentGivens}
							isTesting={appMode === "test"}
							hasUnsavedChanges={hasUnsavedChanges}
							saveStatusMessage={saveFeedback}
							customPuzzles={customPuzzles}
							activeDraftId={activeDraftId}
							onNewCustomPuzzle={handleNewCustomPuzzle}
							onSaveCustomPuzzle={handleSaveCustomPuzzle}
							onLoadCustomPuzzle={handleLoadCustomPuzzle}
							onDeleteCustomPuzzle={handleDeleteCustomPuzzle}
							onImportGivens={handleImportGivens}
						/>
					)}

					<div className="flex flex-col items-center gap-3 shrink-0">
						<SudokuGrid
							board={board}
							puzzle={activeDisplayPuzzle}
							selectedCells={selectedCells}
							focusedCell={focusedCell}
							highlightedDigit={highlightedDigit}
							highlightSettings={highlightSettings}
							isPaused={isPaused && appMode !== "create"}
							onCellPointerDown={handleCellPointerDown}
							onCellPointerEnter={handleCellPointerEnter}
							onResume={() => setIsPaused(false)}
						/>

						<p className="text-xs text-slate-400 text-center max-w-lg">
							Drag or Ctrl/Shift+Click to multi-select · Arrows /
							WASD to move · 1–9 enter ·{" "}
							{appMode === "create"
								? "G for Given · "
								: ""}
							Shift+1–9 Corner · Alt+1–9 Center · Esc clear ·
							Ctrl+A all empty
						</p>
					</div>

					<SudokuControls
						inputMode={inputMode}
						onChangeInputMode={handleChangeInputMode}
						isCreatorMode={appMode === "create"}
						disableHint={disableHint}
						isMultiSelectMode={isMultiSelectMode}
						selectedCount={selectedCells.length}
						onToggleMultiSelectMode={() =>
							setIsMultiSelectMode((prev) => !prev)
						}
						onClearSelection={handleClearSelection}
						digitCounts={digitCounts}
						onDigitInput={(d) => handleDigitInput(d)}
						canUndo={undoStack.length > 0}
						canRedo={redoStack.length > 0}
						undoCount={undoStack.length}
						redoCount={redoStack.length}
						onUndo={handleUndo}
						onRedo={handleRedo}
						onErase={handleErase}
						onHint={handleHint}
						onAutoNotes={handleAutoNotes}
						highlightSettings={highlightSettings}
						onToggleHighlightSetting={handleToggleHighlightSetting}
						disabled={isPaused}
						isSolved={isSolved}
					/>
				</div>
			</section>

			<SudokuVictoryModal
				isOpen={isVictoryModalOpen}
				puzzleTitle={puzzle.title}
				difficulty={puzzle.difficulty}
				elapsedSeconds={elapsedSeconds}
				isNewBestTime={isNewBestTime}
				stat={currentStat}
				onClose={() => setIsVictoryModalOpen(false)}
				onPlayAnother={handleNextPuzzle}
			/>

			<SudokuSubmitModal
				isOpen={pendingSubmission !== null}
				title={pendingSubmission?.title ?? draftTitle}
				difficulty={pendingSubmission?.difficulty ?? draftDifficulty}
				clueCount={pendingSubmission?.clueCount ?? clueCount}
				givens={pendingSubmission?.givens ?? ""}
				solution={pendingSubmission?.solution ?? ""}
				submitterName={submitterName}
				onChangeSubmitterName={setSubmitterName}
				isSubmitting={isSubmitting}
				errorMessage={submitModalError}
				onCancel={handleCloseSubmitModal}
				onConfirmSubmit={handleConfirmSubmitPuzzle}
			/>
		</div>
	);
}
