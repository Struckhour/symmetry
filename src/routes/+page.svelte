

<script lang="ts">
	const size = 4;

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

		for (let row = 0; row < size; row++) {
			for (let col = 0; col < size / 2; col++) {
				const value = randomCell();
				const mirrorCol = size - 1 - col;

				newGrid[row][col] = value;
				newGrid[row][mirrorCol] = value;
			}
		}

		return newGrid;
	}

	function scrambleGrid(source: CellState[][], flips = 2): CellState[][] {
		const scrambled = cloneGrid(source);

		for (let i = 0; i < flips; i++) {
			const row = Math.floor(Math.random() * size);
			const col = Math.floor(Math.random() * size);

			scrambled[row][col] =
				scrambled[row][col] === CELL_STATES.blue
					? CELL_STATES.orange
					: CELL_STATES.blue;
		}

		return scrambled;
	}

	function newPuzzle() {
		const solution = createVerticalSymmetryGrid();

		solutionGrid = solution;
		grid = scrambleGrid(solution, 2);
	}

	function toggleCell(row: number, col: number) {
		grid[row][col] =
			grid[row][col] === CELL_STATES.blue
				? CELL_STATES.orange
				: CELL_STATES.blue;
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
        <div class="mb-4 flex justify-center">
            <button
                type="button"
                class="rounded bg-slate-700 px-4 py-2 hover:bg-slate-600"
                onclick={newPuzzle}
            >
                New Puzzle
            </button>
        </div>
		<div
			class="grid aspect-square w-full gap-2 rounded-2xl bg-slate-800 p-3 shadow-xl"
			style={`grid-template-columns: repeat(${size}, minmax(0, 1fr));`}
		>
			{#each grid as row, rowIndex}
				{#each row as cell, colIndex}
					<button
						type="button"
						aria-label={`Toggle cell ${rowIndex + 1}, ${colIndex + 1}`}
						class={[
                            'aspect-square rounded-lg transition hover:scale-95 focus:outline-none focus:ring-2 focus:ring-white',
                            getCellClass(cell)
                        ].join(' ')}
						onclick={() => toggleCell(rowIndex, colIndex)}
					></button>
				{/each}
			{/each}
		</div>
	</section>
</main>