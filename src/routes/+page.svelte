

<script lang="ts">
	const size = 5;
	let solved = $state(false);
	let clearingGrid = $state<CellState[][] | null>(null);
	let exploding = $state(false);

	let showVerticalLine = $state(false);
	let showHorizontalLine = $state(false);
	type SymmetryMode = 'vertical' | 'horizontal' | 'random';

	let generationMode = $state<SymmetryMode>('random');
	let validSolutionModes: SymmetryMode[] = ['vertical', 'horizontal'];

	function changeGenerationMode(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		generationMode = select.value as SymmetryMode;
		newPuzzle();
	}

	function checkSolvedSymmetries(source: CellState[][]) {
		return {
			vertical: isVerticallySymmetrical(source),
			horizontal: isHorizontallySymmetrical(source)
		};
	}
	const CELL_STATES = {
		blue: 0,
		orange: 1
	} as const;

	type CellState = (typeof CELL_STATES)[keyof typeof CELL_STATES];

	let solutionGrid = $state<CellState[][]>(createEmptyGrid());
	let grid = $state<CellState[][]>(createEmptyGrid());

	function createEmptyGrid(): CellState[][] {
		return Array.from({ length: size }, () =>
			Array.from({ length: size }, () => CELL_STATES.blue)
		);
	}

	function randomCell(): CellState {
		return Math.random() < 0.5 ? CELL_STATES.blue : CELL_STATES.orange;
	}

	function cloneGrid(source: CellState[][]): CellState[][] {
		return source.map((row) => [...row]);
	}

	function createVerticalSymmetryGrid(): CellState[][] {
		const newGrid = createEmptyGrid();
		const half = Math.floor(size / 2);

		for (let row = 0; row < size; row++) {
			for (let col = 0; col < half; col++) {
				const value = randomCell();
				const mirrorCol = size - 1 - col;

				newGrid[row][col] = value;
				newGrid[row][mirrorCol] = value;
			}
		}

		return newGrid;
	}

	function createHorizontalSymmetryGrid(): CellState[][] {
		const newGrid = createEmptyGrid();
		const half = Math.floor(size / 2);

		for (let row = 0; row < half; row++) {
			for (let col = 0; col < size; col++) {
				const value = randomCell();
				const mirrorRow = size - 1 - row;

				newGrid[row][col] = value;
				newGrid[mirrorRow][col] = value;
			}
		}

		return newGrid;
	}

	function createSymmetryGrid(mode: SymmetryMode): CellState[][] {
		if (mode === 'vertical') {
			return createVerticalSymmetryGrid();
		}

		if (mode === 'horizontal') {
			return createHorizontalSymmetryGrid();
		}

		const randomMode = Math.random() < 0.5 ? 'vertical' : 'horizontal';
		return createSymmetryGrid(randomMode);
	}

	function isVerticallySymmetrical(source: CellState[][]) {
		const half = Math.floor(size / 2);

		for (let row = 0; row < size; row++) {
			for (let col = 0; col < half; col++) {
				const mirrorCol = size - 1 - col;

				if (source[row][col] !== source[row][mirrorCol]) {
					return false;
				}
			}
		}

		return true;
	}

	function isHorizontallySymmetrical(source: CellState[][]) {
		const half = Math.floor(size / 2);

		for (let row = 0; row < half; row++) {
			for (let col = 0; col < size; col++) {
				const mirrorRow = size - 1 - row;

				if (source[row][col] !== source[mirrorRow][col]) {
					return false;
				}
			}
		}

		return true;
	}

	function isSolved(source: CellState[][]) {
		return validSolutionModes.some((mode) => {
			if (mode === 'vertical') return isVerticallySymmetrical(source);
			if (mode === 'horizontal') return isHorizontallySymmetrical(source);

			return false;
		});
	}

	function scrambleGrid(
		source: CellState[][],
		flips = 8,
		mode: SymmetryMode = 'vertical'
	): CellState[][] {
		if (mode === 'random') {
			mode = Math.random() < 0.5 ? 'vertical' : 'horizontal';
		}
		const half = Math.floor(size / 2);
		const scrambled = cloneGrid(source);
		const pairs = [];

		if (mode === 'vertical') {
			for (let row = 0; row < size; row++) {
				for (let col = 0; col < half; col++) {
					pairs.push({
						a: { row, col },
						b: { row, col: size - 1 - col }
					});
				}
			}
		}

		if (mode === 'horizontal') {
			for (let row = 0; row < half; row++) {
				for (let col = 0; col < size; col++) {
					pairs.push({
						a: { row, col },
						b: { row: size - 1 - row, col }
					});
				}
			}
		}

		pairs.sort(() => Math.random() - 0.5);

		const flipsToApply = Math.min(flips, pairs.length);

		for (let i = 0; i < flipsToApply; i++) {
			const pair = pairs[i];
			const cellToFlip = Math.random() < 0.5 ? pair.a : pair.b;

			scrambled[cellToFlip.row][cellToFlip.col] =
				scrambled[cellToFlip.row][cellToFlip.col] === CELL_STATES.blue
					? CELL_STATES.orange
					: CELL_STATES.blue;
		}

		return scrambled;
	}

	function newPuzzle() {
		const actualGenerationMode =
			generationMode === 'random'
				? Math.random() < 0.5
					? 'vertical'
					: 'horizontal'
				: generationMode;

		const solution = createSymmetryGrid(actualGenerationMode);

		solutionGrid = solution;
		grid = scrambleGrid(solution, 2, actualGenerationMode);
	}

	async function toggleCell(row: number, col: number) {
		if (solved) return;

		grid[row][col] =
			grid[row][col] === CELL_STATES.blue
				? CELL_STATES.orange
				: CELL_STATES.blue;

		const solvedSymmetries = checkSolvedSymmetries(grid);

		const validSolved =
			(validSolutionModes.includes('vertical') && solvedSymmetries.vertical) ||
			(validSolutionModes.includes('horizontal') && solvedSymmetries.horizontal);

		if (!validSolved) return;

		showVerticalLine = solvedSymmetries.vertical;
		showHorizontalLine = solvedSymmetries.horizontal;

		solved = true;
		clearingGrid = cloneGrid(grid);

		await new Promise((resolve) => setTimeout(resolve, 450));

		newPuzzle();
		exploding = true;

		await new Promise((resolve) => setTimeout(resolve, 700));

		clearingGrid = null;
		exploding = false;
		solved = false;
		showVerticalLine = false;
		showHorizontalLine = false;
	}

	function getCellClass(cell: CellState) {
		if (cell === CELL_STATES.blue) return 'bg-blue-500';
		if (cell === CELL_STATES.orange) return 'bg-orange-500';

		return 'bg-slate-500';
	}

	newPuzzle();
</script>

<main class="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

	<section class="w-full max-w-180">
		<h1 class="mb-4 text-3xl font-bold text-center">SymmeTreat</h1>
		<div class="mb-4 flex justify-center gap-3">
			<button
				type="button"
				class="rounded bg-slate-700 px-4 py-2 hover:bg-slate-600"
				onclick={newPuzzle}
			>
				New Puzzle
			</button>

			<select
				class="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
				value={generationMode}
				onchange={changeGenerationMode}
			>
				<option value="random">Random</option>
				<option value="vertical">Vertical</option>
				<option value="horizontal">Horizontal</option>
			</select>
		</div>
		<div class="relative overflow-hidden rounded-2xl">
			<div
				class={[
					'grid aspect-square w-full gap-2 rounded-2xl bg-slate-800 p-3 shadow-xl transition-all duration-500',
					solved ? 'scale-[1.02] shadow-orange-400/80 ring-4 ring-orange-300' : ''
				].join(' ')}
				style={`grid-template-columns: repeat(${size}, minmax(0, 1fr));`}
			>
				{#each grid as row, rowIndex}
					{#each row as cell, colIndex}
						<button
							type="button"
							aria-label={`Toggle cell ${rowIndex + 1}, ${colIndex + 1}`}
							disabled={solved}
							class={[
								'aspect-square rounded-lg transition hover:scale-95 focus:outline-none focus:ring-2 focus:ring-white',
								getCellClass(cell),
								solved ? 'animate-pulse' : ''
							].join(' ')}
							onclick={() => toggleCell(rowIndex, colIndex)}
						></button>
					{/each}
				{/each}
			</div>

			{#if clearingGrid}
				<div
					class="pointer-events-none absolute inset-0 z-10 grid gap-2 p-3"
					style={`grid-template-columns: repeat(${size}, minmax(0, 1fr));`}
				>
					{#each clearingGrid as row, rowIndex}
						{#each row as cell, colIndex}
							<div
								class={[
									'aspect-square rounded-lg',
									getCellClass(cell),
									exploding ? 'explode-cell' : ''
								].join(' ')}
								style={`--tx:${(colIndex - (size - 1) / 2) * 150}px; --ty:${(rowIndex - (size - 1) / 2) * 150}px;`}
							></div>
						{/each}
					{/each}
				</div>
			{/if}

			{#if solved}
				<div class="pointer-events-none absolute inset-0 z-20 p-3">
					{#if showVerticalLine}
						<div class="absolute inset-3 flex justify-center">
							<div class="draw-vertical-line h-full w-1 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"></div>
						</div>
					{/if}

					{#if showHorizontalLine}
						<div class="absolute inset-3 flex items-center">
							<div class="draw-horizontal-line h-1 w-full rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"></div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</section>
</main>

<style>
	.draw-vertical-line {
		transform-origin: top;
		animation: draw-vertical-line 0.45s ease-out forwards;
	}

	.draw-horizontal-line {
		transform-origin: left;
		animation: draw-horizontal-line 0.45s ease-out forwards;
	}

	@keyframes draw-vertical-line {
		from {
			transform: scaleY(0);
			opacity: 0;
		}

		to {
			transform: scaleY(1);
			opacity: 1;
		}
	}

	@keyframes draw-horizontal-line {
		from {
			transform: scaleX(0);
			opacity: 0;
		}

		to {
			transform: scaleX(1);
			opacity: 1;
		}
	}

	.explode-cell {
		animation: explode-cell 0.7s ease-in forwards;
	}

	@keyframes explode-cell {
		to {
			transform:
				translate(var(--tx), var(--ty))
				rotate(220deg)
				scale(0.35);
			opacity: 0;
		}
	}

</style>