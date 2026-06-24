<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
    import type {
        ConcreteSymmetryMode,
        Palette,
        LevelSettings
    } from '$lib/types';

	type LineStyle = 'vertical' | 'horizontal' | 'diagonalDown' | 'diagonalUp';

	type SymmetryMode =
		| 'squareVertical'
		| 'squareHorizontal'
		| 'squareDiagonalDown'
		| 'squareDiagonalUp'
		| 'random';



	type CellCoord = {
		row: number;
		col: number;
	};

	type MirrorPair = {
		a: CellCoord;
		b: CellCoord;
	};

	const CELL_STATES = {
		blue: 0,
		orange: 1
	} as const;

	type CellState = (typeof CELL_STATES)[keyof typeof CELL_STATES];

	let {
		gameId,
		level,
		palette,
		gameOver,
		onSolve,
		hideNextBoard = false
	}: {
		gameId: number;
		level: LevelSettings;
		palette: Palette;
		gameOver: boolean;
		onSolve: (bonus: number) => void;
		hideNextBoard: boolean;
	} = $props();

	let size = $derived(level.size);

	let solved = $state(false);
	let clearingGrid = $state<CellState[][] | null>(null);
	let clearingSize = $state<number | null>(null);
	let clearingPalette = $state<Palette | null>(null);
	let exploding = $state(false);
	let solvedLineModes = $state<ConcreteSymmetryMode[]>([]);
	let solutionGrid = $state<CellState[][]>([]);
	let grid = $state<CellState[][]>([]);
	let previousGameId = $state(gameId);

	const validSolutionModes: ConcreteSymmetryMode[] = [
		'squareVertical',
		'squareHorizontal',
		'squareDiagonalDown',
		'squareDiagonalUp'
	];

    let mounted = true;

    onDestroy(() => {
        mounted = false;
    });

	onMount(() => {
		newPuzzle();
	});

	$effect(() => {
		if (gameId !== previousGameId) {
			previousGameId = gameId;
			resetBoard();
		}
	});

	function resetBoard() {
		solved = false;
		clearingGrid = null;
		clearingPalette = null;
		clearingSize = null;
		exploding = false;
		solvedLineModes = [];
		newPuzzle();
	}

	function handleCellPointerUp(event: PointerEvent, row: number, col: number) {
		if (!event.isPrimary) return;

		event.preventDefault();
		toggleCell(row, col);
	}

	function isSymmetrical(source: CellState[][], pairs: MirrorPair[]) {
		for (const pair of pairs) {
			if (source[pair.a.row][pair.a.col] !== source[pair.b.row][pair.b.col]) {
				return false;
			}
		}

		return true;
	}

	function getSquareVerticalPairs(): MirrorPair[] {
		const pairs: MirrorPair[] = [];
		const half = Math.floor(size / 2);

		for (let row = 0; row < size; row++) {
			for (let col = 0; col < half; col++) {
				pairs.push({
					a: { row, col },
					b: { row, col: size - 1 - col }
				});
			}
		}

		return pairs;
	}

	function getSquareHorizontalPairs(): MirrorPair[] {
		const pairs: MirrorPair[] = [];
		const half = Math.floor(size / 2);

		for (let row = 0; row < half; row++) {
			for (let col = 0; col < size; col++) {
				pairs.push({
					a: { row, col },
					b: { row: size - 1 - row, col }
				});
			}
		}

		return pairs;
	}

	function getSquareDiagonalDownPairs(): MirrorPair[] {
		const pairs: MirrorPair[] = [];

		for (let row = 0; row < size; row++) {
			for (let col = row + 1; col < size; col++) {
				pairs.push({
					a: { row, col },
					b: { row: col, col: row }
				});
			}
		}

		return pairs;
	}

	function getSquareDiagonalUpPairs(): MirrorPair[] {
		const pairs: MirrorPair[] = [];

		for (let row = 0; row < size; row++) {
			for (let col = 0; col < size - 1 - row; col++) {
				pairs.push({
					a: { row, col },
					b: {
						row: size - 1 - col,
						col: size - 1 - row
					}
				});
			}
		}

		return pairs;
	}

	const symmetryModes = {
		squareVertical: {
			label: 'Vertical',
			getPairs: getSquareVerticalPairs,
			lineStyle: 'vertical'
		},
		squareHorizontal: {
			label: 'Horizontal',
			getPairs: getSquareHorizontalPairs,
			lineStyle: 'horizontal'
		},
		squareDiagonalDown: {
			label: 'Diagonal Down',
			getPairs: getSquareDiagonalDownPairs,
			lineStyle: 'diagonalDown'
		},
		squareDiagonalUp: {
			label: 'Diagonal Up',
			getPairs: getSquareDiagonalUpPairs,
			lineStyle: 'diagonalUp'
		}
	} satisfies Record<
		ConcreteSymmetryMode,
		{
			label: string;
			getPairs: () => MirrorPair[];
			lineStyle: LineStyle;
		}
	>;

	function getLineStyleForMode(mode: ConcreteSymmetryMode): LineStyle {
		return symmetryModes[mode].lineStyle;
	}

	function getPairsForMode(mode: ConcreteSymmetryMode): MirrorPair[] {
		return symmetryModes[mode].getPairs();
	}

	function getRandomCreationMode(): ConcreteSymmetryMode {
		const modes = level.creationModes;
		return modes[Math.floor(Math.random() * modes.length)];
	}

	function getRandomConcreteMode(): ConcreteSymmetryMode {
		const modes: ConcreteSymmetryMode[] = [
			'squareVertical',
			'squareHorizontal',
			'squareDiagonalDown',
			'squareDiagonalUp'
		];

		return modes[Math.floor(Math.random() * modes.length)];
	}

	function checkSolvedSymmetries(source: CellState[][]) {
		return Object.fromEntries(
			validSolutionModes.map((mode) => [mode, isSymmetrical(source, getPairsForMode(mode))])
		) as Record<ConcreteSymmetryMode, boolean>;
	}

	function countSolvedSymmetries(solvedSymmetries: Record<ConcreteSymmetryMode, boolean>) {
		return validSolutionModes.filter((mode) => solvedSymmetries[mode]).length;
	}

	function randomCell(): CellState {
		return Math.random() < 0.5 ? CELL_STATES.blue : CELL_STATES.orange;
	}

	function cloneGrid(source: CellState[][]): CellState[][] {
		return source.map((row) => [...row]);
	}

	function createGridFromPairs(pairs: MirrorPair[]): CellState[][] {
		const newGrid = Array.from({ length: size }, () =>
			Array.from({ length: size }, () => randomCell())
		);

		for (const pair of pairs) {
			const value = randomCell();

			newGrid[pair.a.row][pair.a.col] = value;
			newGrid[pair.b.row][pair.b.col] = value;
		}

		return newGrid;
	}

	function createSymmetryGrid(mode: SymmetryMode): CellState[][] {
		if (mode === 'random') {
			const randomMode = getRandomConcreteMode();
			return createSymmetryGrid(randomMode);
		}

		return createGridFromPairs(getPairsForMode(mode));
	}

	function scrambleGrid(
		source: CellState[][],
		flips = 8,
		mode: ConcreteSymmetryMode = 'squareVertical'
	): CellState[][] {
		const scrambled = cloneGrid(source);
		const pairs = [...getPairsForMode(mode)].sort(() => Math.random() - 0.5);
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
        if (gameOver) return;

        const maxAttempts = 10;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const actualGenerationMode = getRandomCreationMode();
            const solution = createSymmetryGrid(actualGenerationMode);
            const scrambled = scrambleGrid(
                solution,
                level.scrambleFlips,
                actualGenerationMode
            );

            const solvedSymmetries = checkSolvedSymmetries(scrambled);

            const isAlreadySolved =
                validSolutionModes.some((mode) => solvedSymmetries[mode]);

            if (!isAlreadySolved) {
                solutionGrid = solution;
                grid = scrambled;
                return;
            }
        }

        // fallback
        const actualGenerationMode = getRandomCreationMode();
        const solution = createSymmetryGrid(actualGenerationMode);

        solutionGrid = solution;
        grid = scrambleGrid(solution, level.scrambleFlips + 1, actualGenerationMode);
    }

	async function toggleCell(row: number, col: number) {
		if (solved || gameOver) return;

		grid[row][col] =
			grid[row][col] === CELL_STATES.blue ? CELL_STATES.orange : CELL_STATES.blue;

		const solvedSymmetries = checkSolvedSymmetries(grid);
		const validSolved = validSolutionModes.some((mode) => solvedSymmetries[mode]);

		if (!validSolved) return;

		solvedLineModes = validSolutionModes.filter((mode) => solvedSymmetries[mode]);
		solved = true;

		const symmetryCount = countSolvedSymmetries(solvedSymmetries);

		clearingGrid = cloneGrid(grid);
		clearingPalette = palette;
		clearingSize = size;

		onSolve(symmetryCount);

		await new Promise((resolve) => setTimeout(resolve, 450));
        if (!mounted) return;
		if (!hideNextBoard) {
			newPuzzle();
		}

		exploding = true;

		await new Promise((resolve) => setTimeout(resolve, 700));
        if (!mounted) return;
		clearingGrid = null;
		clearingPalette = null;
		clearingSize = null;
		exploding = false;
		solved = false;
		solvedLineModes = [];
	}

	function getCellClass(cell: CellState, activePalette = palette) {
		if (gameOver) {
			if (cell === CELL_STATES.blue) return `${activePalette.blue} opacity-35 saturate-50`;
			if (cell === CELL_STATES.orange) return `${activePalette.orange} opacity-35 saturate-50`;
		}

		if (cell === CELL_STATES.blue) return activePalette.blue;
		if (cell === CELL_STATES.orange) return activePalette.orange;

		return 'bg-slate-500';
	}
</script>

<div class="relative overflow-hidden rounded-2xl bg-slate-950">
	{#if gameOver}
		<div class="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
			<div
				class="rounded-lg border border-slate-500 bg-slate-950/90 px-5 py-2 text-xl font-bold tracking-wider text-red-300"
			>
				GAME OVER
			</div>
		</div>
	{/if}

		<div
			class={[
				'board board-square aspect-square w-full gap-2 rounded-2xl bg-slate-800 p-3 shadow-xl transition-all duration-500',
				solved ? 'scale-[1.02] shadow-orange-400/80 ring-4 ring-orange-300' : '',
				hideNextBoard && exploding ? 'opacity-0' : ''
			].join(' ')}
			style={`--size:${size};`}
		>
		{#each grid as row, rowIndex}
			{#each row as cell, colIndex}
				<button
					type="button"
					aria-label={`Toggle cell ${rowIndex + 1}, ${colIndex + 1}`}
					disabled={solved || gameOver}
					class={[
						'aspect-square rounded-lg touch-manipulation select-none transition-all duration-700 hover:scale-95 focus:outline-none focus:ring-2 focus:ring-white active:scale-95',
						getCellClass(cell),
						solved ? 'animate-pulse' : ''
					].join(' ')}
					onpointerup={(event) => handleCellPointerUp(event, rowIndex, colIndex)}
				></button>
			{/each}
		{/each}
	</div>

	{#if clearingGrid}
		<div
			class="pointer-events-none absolute inset-0 z-10 board board-square gap-2 p-3"
			style={`--size:${clearingSize ?? size};`}
		>
			{#each clearingGrid as row, rowIndex}
				{#each row as cell, colIndex}
					<div
						class={[
							'aspect-square rounded-lg',
							getCellClass(cell, clearingPalette ?? palette),
							exploding ? 'explode-cell' : ''
						].join(' ')}
						style={`--tx:${(colIndex - ((clearingSize ?? size) - 1) / 2) * 150}px; --ty:${(rowIndex - ((clearingSize ?? size) - 1) / 2) * 150}px;`}
					></div>
				{/each}
			{/each}
		</div>
	{/if}

	{#if solved}
		<div class="pointer-events-none absolute inset-0 z-20 p-3">
			{#each solvedLineModes as mode}
				{@const lineStyle = getLineStyleForMode(mode)}

				{#if lineStyle === 'vertical'}
					<div class="absolute inset-3 flex justify-center">
						<div
							class="draw-vertical-line h-full w-1 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"
						></div>
					</div>
				{:else if lineStyle === 'horizontal'}
					<div class="absolute inset-3 flex items-center">
						<div
							class="draw-horizontal-line h-1 w-full rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"
						></div>
					</div>
				{:else if lineStyle === 'diagonalDown'}
					<div class="absolute inset-3">
						<div class="draw-diagonal-down-line"></div>
					</div>
				{:else if lineStyle === 'diagonalUp'}
					<div class="absolute inset-3">
						<div class="draw-diagonal-up-line"></div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.board-square {
		display: grid;
		grid-template-columns: repeat(var(--size), minmax(0, 1fr));
	}

	.board-square,
	.board-square button {
		touch-action: manipulation;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

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

	.draw-diagonal-down-line,
	.draw-diagonal-up-line {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 141.42%;
		height: 0.25rem;
		border-radius: 9999px;
		background: white;
		box-shadow: 0 0 20px rgba(255, 255, 255, 0.9);
		opacity: 0;
	}

	.draw-diagonal-down-line {
		transform-origin: left;
		animation: draw-diagonal-down-line 0.45s ease-out forwards;
	}

	.draw-diagonal-up-line {
		transform-origin: left;
		animation: draw-diagonal-up-line 0.45s ease-out forwards;
	}

	@keyframes draw-diagonal-down-line {
		from {
			transform: rotate(45deg) translateX(-50%) scaleX(0);
			opacity: 0;
		}

		to {
			transform: rotate(45deg) translateX(-50%) scaleX(1);
			opacity: 1;
		}
	}

	@keyframes draw-diagonal-up-line {
		from {
			transform: rotate(-45deg) translateX(-50%) scaleX(0);
			opacity: 0;
		}

		to {
			transform: rotate(-45deg) translateX(-50%) scaleX(1);
			opacity: 1;
		}
	}

	.explode-cell {
		animation: explode-cell 0.7s ease-in forwards;
	}

	@keyframes explode-cell {
		to {
			transform: translate(var(--tx), var(--ty)) rotate(220deg) scale(0.35);
			opacity: 0;
		}
	}

	
</style>