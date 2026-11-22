const THIN_LINES = [1, 2, 4, 5, 7, 8] as const;
const THICK_LINES = [3, 6] as const;

export default function MiniSudokuPreview({ givens }: { givens: string }) {
	const clueCoords: Array<{ r: number; c: number }> = [];
	for (let i = 0; i < 81; i++) {
		const ch = givens[i];
		if (ch && ch !== "0") {
			clueCoords.push({ r: Math.floor(i / 9), c: i % 9 });
		}
	}

	return (
		<svg
			viewBox="0 0 90 90"
			aria-hidden="true"
			className="size-13 shrink-0 rounded border border-[#0E1F37] bg-[#2F3337]"
		>
			{THIN_LINES.map((n) => (
				<g key={`thin-${n}`}>
					<line
						x1={n * 10}
						y1={0}
						x2={n * 10}
						y2={90}
						stroke="#435C78"
						strokeWidth="0.7"
					/>
					<line
						x1={0}
						y1={n * 10}
						x2={90}
						y2={n * 10}
						stroke="#435C78"
						strokeWidth="0.7"
					/>
				</g>
			))}

			{THICK_LINES.map((n) => (
				<g key={`thick-${n}`}>
					<line
						x1={n * 10}
						y1={0}
						x2={n * 10}
						y2={90}
						stroke="#5B98E0"
						strokeWidth="1.6"
					/>
					<line
						x1={0}
						y1={n * 10}
						x2={90}
						y2={n * 10}
						stroke="#5B98E0"
						strokeWidth="1.6"
					/>
				</g>
			))}

			{clueCoords.map(({ r, c }) => (
				<rect
					key={`${r}-${c}`}
					x={c * 10 + 1.8}
					y={r * 10 + 1.8}
					width="6.4"
					height="6.4"
					rx="1.2"
					fill="#ABD1FF"
				/>
			))}
		</svg>
	);
}
