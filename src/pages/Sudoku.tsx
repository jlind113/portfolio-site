import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Pause, Play, RotateCcw, Trophy } from "lucide-react";
import SudokuControls from "../components/sudoku/SudokuControls";
import SudokuGrid from "../components/sudoku/SudokuGrid";
import SudokuLevelSelector from "../components/sudoku/SudokuLevelSelector";
import SudokuVictoryModal from "../components/sudoku/SudokuVictoryModal";
import {
	getPuzzleById,
	getPuzzlesByDifficulty,
} from "../components/sudoku/puzzles";
import {
	DEFAULT_HIGHLIGHT_SETTINGS,
	loadPuzzleProgress,
	loadSavedGame,
	loadStats,
	saveGameState,
	savePuzzleProgress,
	saveStats,
} from "../components/sudoku/storage";
import type {
	BoardGrid,
	BoardSnapshot,
	Difficulty,
	HighlightSettings,
	InputMode,
	PuzzleDefinition,
	PuzzleProgressMap,
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
	board: BoardGrid;
	elapsedSeconds: number;
	isSolved: boolean;
	highlightSettings: HighlightSettings;
	undoStack: BoardSnapshot[];
	redoStack: BoardSnapshot[];
	inputMode: InputMode;
}

function getInitialGameState(): InitialGameState {
	const saved = loadSavedGame();
	if (saved) {
		const savedPuzzle = getPuzzleById(saved.puzzleId);
		if (savedPuzzle) {
			const baseBoard = createBoardFromPuzzle(savedPuzzle);
			return {
				puzzle: savedPuzzle,
				board: applySnapshot(baseBoard, saved.snapshot),
				elapsedSeconds: saved.elapsedSeconds,
				isSolved: saved.isSolved,
				highlightSettings: saved.highlightSettings,
				undoStack: saved.undoStack,
				redoStack: saved.redoStack,
				inputMode: saved.inputMode,
			};
		}
	}

	const defaultPuzzle = getPuzzlesByDifficulty("Easy")[0];
	return {
		puzzle: defaultPuzzle,
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
	const [puzzle, setPuzzle] = useState<PuzzleDefinition>(initialState.puzzle);
	const [selectedDifficultyFilter, setSelectedDifficultyFilter] =
		useState<Difficulty>(initialState.puzzle.difficulty);
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

	// Elapsed game timer
	useEffect(() => {
		if (isPaused || isSolved) return;
		const intervalId = window.setInterval(() => {
			setElapsedSeconds((prev) => prev + 1);
		}, 1000);
		return () => window.clearInterval(intervalId);
	}, [isPaused, isSolved]);

	// Persist active game state to localStorage
	useEffect(() => {
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
	const filteredPuzzles = useMemo(
		() => getPuzzlesByDifficulty(selectedDifficultyFilter),
		[selectedDifficultyFilter],
	);

	const commitBoardChange = useCallback(
		(nextBoard: BoardGrid, pushUndo = true) => {
			if (pushUndo) {
				const snap = createSnapshot(board);
				setUndoStack((prev) => [...prev, snap]);
				setRedoStack([]);
			}
			setBoard(nextBoard);

			if (!isSolved && isBoardSolved(nextBoard, puzzle)) {
				setIsSolved(true);
				setIsPaused(false);
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
		},
		[board, elapsedSeconds, isSolved, puzzle],
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
			setSelectedDifficultyFilter(targetPuzzle.difficulty);
			startPuzzle(targetPuzzle);
		},
		[puzzle.id, startPuzzle],
	);

	const handleNextPuzzle = useCallback(() => {
		const pool = getPuzzlesByDifficulty(puzzle.difficulty);
		const currentIndex = pool.findIndex((p) => p.id === puzzle.id);
		const nextPuzzle = pool[(currentIndex + 1) % pool.length];
		setSelectedDifficultyFilter(nextPuzzle.difficulty);
		startPuzzle(nextPuzzle);
	}, [puzzle.difficulty, puzzle.id, startPuzzle]);

	const handleRestartPuzzle = useCallback(() => {
		startPuzzle(puzzle);
	}, [puzzle, startPuzzle]);

	const syncPencilModeForSingleCell = useCallback(
		(coord: CellCoord) => {
			if (inputMode === "normal") return;
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

		const nextBoard = cloneBoard(board);
		let changed = false;

		for (const { row, col } of selectedCells) {
			const cell = nextBoard[row]?.[col];
			if (!cell || cell.given) continue;

			const isAlreadyEmpty =
				cell.value === null &&
				cell.cornerMarks.length === 0 &&
				cell.centerMarks.length === 0;
			if (isAlreadyEmpty) continue;

			cell.value = null;
			cell.cornerMarks = [];
			cell.centerMarks = [];
			changed = true;
		}

		if (!changed) return;
		commitBoardChange(nextBoard);
	}, [board, commitBoardChange, isPaused, isSolved, selectedCells]);

	const handleUndo = useCallback(() => {
		if (isPaused || isSolved || undoStack.length === 0) return;
		const previousSnap = undoStack[undoStack.length - 1];
		const currentSnap = createSnapshot(board);

		setUndoStack((prev) => prev.slice(0, -1));
		setRedoStack((prev) => [...prev, currentSnap]);
		setBoard((prevBoard) => applySnapshot(prevBoard, previousSnap));
	}, [board, isPaused, isSolved, undoStack]);

	const handleRedo = useCallback(() => {
		if (isPaused || isSolved || redoStack.length === 0) return;
		const nextSnap = redoStack[redoStack.length - 1];
		const currentSnap = createSnapshot(board);

		setRedoStack((prev) => prev.slice(0, -1));
		setUndoStack((prev) => [...prev, currentSnap]);
		setBoard((prevBoard) => applySnapshot(prevBoard, nextSnap));
	}, [board, isPaused, isSolved, redoStack]);

	const handleHint = useCallback(() => {
		if (isPaused || isSolved) return;

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

			// Pause / Resume shortcuts
			if (
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
				if (lowerKey === "z") {
					e.preventDefault();
					handleChangeInputMode("normal");
					return;
				}
				if (lowerKey === "x" || lowerKey === "n") {
					e.preventDefault();
					handleChangeInputMode(
						inputMode === "corner" ? "normal" : "corner",
					);
					return;
				}
				if (lowerKey === "c" || lowerKey === "m") {
					e.preventDefault();
					handleChangeInputMode(
						inputMode === "center" ? "normal" : "center",
					);
					return;
				}
				if (e.key === "Tab") {
					e.preventDefault();
					handleChangeInputMode(
						inputMode === "normal"
							? "corner"
							: inputMode === "corner"
								? "center"
								: "normal",
					);
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
		board,
		focusedCell,
		handleChangeInputMode,
		handleClearSelection,
		handleDigitInput,
		handleErase,
		handleRedo,
		handleUndo,
		inputMode,
		isMultiSelectMode,
		isPaused,
		isSolved,
		selectedCells,
		syncPencilModeForSingleCell,
	]);

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
						{puzzle.title}
					</h2>
					<div className="flex flex-row items-center gap-4 mt-2 text-md text-[#ABD1FF]">
						<span className="text-[#ABD1FF]">
							Difficulty:{" "}
							<span className="font-semibold">
								{puzzle.difficulty}
							</span>
						</span>
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
									? formatTime(currentStat.bestTimeSeconds)
									: "-"}
							</span>
						</span>
					</div>
				</div>

				{/* Top HUD Bar */}
				<div className="w-full max-w-5xl rounded-lg border-2 border-[#0E1F37] bg-[#1E304A] px-4 py-3 flex flex-row flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-xs text-[#ABD1FF]">
						<span className="font-semibold uppercase tracking-wider text-[#A6D6FF]">
							Active Level:
						</span>
						<span className="font-semibold text-white">
							{puzzle.title}
						</span>
					</div>

					{/* Timer & Session Actions */}
					<div className="flex flex-row items-center gap-2.5 flex-wrap">
						<div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-950/80 border border-slate-800">
							<span className="text-sm font-mono font-semibold text-slate-100 tabular-nums">
								{formatTime(elapsedSeconds)}
							</span>
							{!isSolved && (
								<button
									type="button"
									onClick={() => setIsPaused((p) => !p)}
									aria-label={
										isPaused ? "Resume game" : "Pause game"
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

						<button
							type="button"
							onClick={handleRestartPuzzle}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-700 bg-slate-800/70 hover:border-slate-500 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
						>
							<RotateCcw className="size-3.5" />
							Restart
						</button>
					</div>
				</div>

				{/* Inline Solved Banner when Modal is Dismissed */}
				{isSolved && (
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

				{/* Main Play Area */}
				<div className="w-full flex flex-col xl:flex-row items-center xl:items-start justify-center gap-6 xl:gap-4 2xl:gap-6">
					<SudokuLevelSelector
						selectedDifficulty={selectedDifficultyFilter}
						onSelectDifficulty={setSelectedDifficultyFilter}
						puzzles={filteredPuzzles}
						activePuzzleId={puzzle.id}
						progressMap={puzzleProgress}
						onSelectPuzzle={handleSelectPuzzle}
					/>

					<div className="flex flex-col items-center gap-3 shrink-0">
						<SudokuGrid
							board={board}
							puzzle={puzzle}
							selectedCells={selectedCells}
							focusedCell={focusedCell}
							highlightedDigit={highlightedDigit}
							highlightSettings={highlightSettings}
							isPaused={isPaused}
							onCellPointerDown={handleCellPointerDown}
							onCellPointerEnter={handleCellPointerEnter}
							onResume={() => setIsPaused(false)}
						/>

						<p className="text-xs text-slate-400 text-center max-w-lg">
							Drag or Ctrl/Shift+Click to multi-select · Arrows /
							WASD to move · 1–9 enter · Shift+1–9 Corner ·
							Alt+1–9 Center · Esc clear · Ctrl+A all empty
						</p>
					</div>

					<SudokuControls
						inputMode={inputMode}
						onChangeInputMode={handleChangeInputMode}
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
		</div>
	);
}
