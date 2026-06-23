

<script lang="ts">
	import { onMount } from 'svelte';

	let solved = $state(false);
	let clearingGrid = $state<CellState[][] | null>(null);
	let clearingSize = $state<number | null>(null);
	let exploding = $state(false);
	let score = $state(0);
	type ColorMode = 'theme' | 'greyscale';
	let colorMode = $state<ColorMode>('theme');


	let solvedLineModes = $state<ConcreteSymmetryMode[]>([]);
	type ShapeMode = 'square' | 'triangle' | 'hexagon' | 'pentagon';

	type ShapeDefinition = {
		createEmptyGrid: () => CellState[][];
	};

	const shapes: Partial<Record<ShapeMode, ShapeDefinition>> = {
		square: {
			createEmptyGrid
		}
	};

	type LineStyle = 'vertical' | 'horizontal' | 'diagonalDown' | 'diagonalUp';
	type SymmetryMode =
		| 'squareVertical'
		| 'squareHorizontal'
		| 'squareDiagonalDown'
		| 'squareDiagonalUp'
		| 'random';

	type ConcreteSymmetryMode = Exclude<SymmetryMode, 'random'>;

	let generationMode = $state<SymmetryMode>('random');
	let validSolutionModes: ConcreteSymmetryMode[] = [
		'squareVertical',
		'squareHorizontal',
		'squareDiagonalDown',
		'squareDiagonalUp'
	];

	const startingTimeSeconds = 5;

	let gameOver = $state(false);

	const maxTimeSeconds = 120;


	let timeLeft = $state(startingTimeSeconds);

	let timerPercent = $derived(timeLeft / maxTimeSeconds);
	let timerDegrees = $derived(timerPercent * 360);

	let clearingPalette = $state<ReturnType<typeof getPalette> | null>(null);
	type LevelSettings = {
		threshold: number;
		levelText: string;
		shape: ShapeMode;
		size: number;
		scrambleFlips: number;
		solveBonusSeconds: number;
		creationModes: ConcreteSymmetryMode[];
		colors: {
			blue: string;
			orange: string;
		};
	};

	const levels: LevelSettings[] = [
		{
			threshold: 0,
			levelText: 'Level 1: Vertical Symmetry',
			size: 4,
			shape: 'square',
			scrambleFlips: 1,
			solveBonusSeconds: 8,
			creationModes: ['squareVertical'],
			colors: {
				blue: 'bg-blue-800',
				orange: 'bg-orange-400'
			}
		},
		{
			threshold: 40,
			levelText: 'Level 2: Horizontal Symmetry',
			size: 5,
			shape: 'square',
			scrambleFlips: 1,
			solveBonusSeconds: 10,
			creationModes: ['squareHorizontal'],
			colors: {
				blue: 'bg-purple-800',
				orange: 'bg-yellow-400'
			}
		},
		{
			threshold: 100,
			levelText: 'Level 3: Diagonal Symmetry',
			size: 5,
			shape: 'square',
			scrambleFlips: 2,
			solveBonusSeconds: 12,
			creationModes: ['squareDiagonalDown', 'squareDiagonalUp'],
			colors: {
				blue: 'bg-emerald-800',
				orange: 'bg-pink-400'
			}
		}
	];

	type CellCoord = {
		row: number;
		col: number;
	};

	type MirrorPair = {
		a: CellCoord;
		b: CellCoord;
	};

	let currentShape = $state<ShapeMode>(levels[0].shape);
	let currentLevelIndex = $state(0);
	let size = $state(levels[0].size);

	let currentLevel = $derived(levels[currentLevelIndex]);

	onMount(() => {
		const interval = setInterval(() => {
			if (solved || gameOver) return;

			timeLeft = Math.max(0, timeLeft - 0.05);

			if (timeLeft === 0) {
				gameOver = true;
			}
		}, 50);

		return () => clearInterval(interval);
	});

	function isSymmetrical(source: CellState[][], pairs: MirrorPair[]) {
		for (const pair of pairs) {
			if (
				source[pair.a.row][pair.a.col] !==
				source[pair.b.row][pair.b.col]
			) {
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

	function getRandomCreationMode(): ConcreteSymmetryMode {
		const modes = currentLevel.creationModes;

		return modes[Math.floor(Math.random() * modes.length)];
	}

	function updateLevel() {
		const nextLevelIndex = levels.findLastIndex((level) => score >= level.threshold);

		if (nextLevelIndex === currentLevelIndex) return;

		currentLevelIndex = nextLevelIndex;
		size = currentLevel.size;
		currentShape = currentLevel.shape;
	}

	function getPalette() {
		if (colorMode === 'greyscale') {
			return {
				blue: 'bg-slate-700',
				orange: 'bg-slate-300'
			};
		}

		return currentLevel.colors;
	}

	function changeGenerationMode(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		generationMode = select.value as SymmetryMode;
		newPuzzle();
	}

	function countSolvedSymmetries(solvedSymmetries: Record<ConcreteSymmetryMode, boolean>) {
		return validSolutionModes.filter((mode) => solvedSymmetries[mode]).length;
	}

	function checkSolvedSymmetries(source: CellState[][]) {
		return Object.fromEntries(
			validSolutionModes.map((mode) => [
				mode,
				isSymmetrical(source, getPairsForMode(mode))
			])
		) as Record<ConcreteSymmetryMode, boolean>;
	}
	const CELL_STATES = {
		blue: 0,
		orange: 1
	} as const;

	type CellState = ((typeof CELL_STATES)[keyof typeof CELL_STATES]) | null;

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

	function createGridFromPairs(pairs: MirrorPair[]): CellState[][] {
		const shapeDefinition = shapes[currentShape];

		if (!shapeDefinition) {
			throw new Error(`No shape definition found for ${currentShape}`);
		}

		const newGrid = shapeDefinition.createEmptyGrid();

		for (let row = 0; row < newGrid.length; row++) {
			for (let col = 0; col < newGrid[row].length; col++) {
				newGrid[row][col] = randomCell();
			}
		}

		for (const pair of pairs) {
			const value = randomCell();

			newGrid[pair.a.row][pair.a.col] = value;
			newGrid[pair.b.row][pair.b.col] = value;
		}

		return newGrid;
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
	} satisfies Record<ConcreteSymmetryMode, {
		label: string;
		getPairs: () => MirrorPair[];
		lineStyle: LineStyle;
	}>;

	function getLineStyleForMode(mode: ConcreteSymmetryMode): LineStyle {
		return symmetryModes[mode].lineStyle;
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

	function createSymmetryGrid(mode: SymmetryMode): CellState[][] {
		if (mode === 'random') {
			const randomMode = getRandomConcreteMode();
			return createSymmetryGrid(randomMode);
		}

		return createGridFromPairs(getPairsForMode(mode));
	}

	function getPairsForMode(mode: ConcreteSymmetryMode): MirrorPair[] {
		return symmetryModes[mode].getPairs();
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

		const actualGenerationMode = getRandomCreationMode();

		const solution = createSymmetryGrid(actualGenerationMode);

		solutionGrid = solution;
		grid = scrambleGrid(solution, currentLevel.scrambleFlips, actualGenerationMode);
	}

	function resetGame() {
		score = 0;
		timeLeft = startingTimeSeconds;
		gameOver = false;
		solved = false;
		clearingGrid = null;
		exploding = false;
		solvedLineModes = [];
		currentLevelIndex = 0;
		size = levels[0].size;
		currentShape = levels[0].shape;

		newPuzzle();
	}

	async function toggleCell(row: number, col: number) {
		if (solved || gameOver) return;

		grid[row][col] =
			grid[row][col] === CELL_STATES.blue
				? CELL_STATES.orange
				: CELL_STATES.blue;

		const solvedSymmetries = checkSolvedSymmetries(grid);

		const validSolved = validSolutionModes.some((mode) => solvedSymmetries[mode]);

		if (!validSolved) return;

		solvedLineModes = validSolutionModes.filter((mode) => solvedSymmetries[mode]);

		solved = true;
		const symmetryCount = countSolvedSymmetries(solvedSymmetries);

		const bonus = symmetryCount * currentLevel.solveBonusSeconds;

		timeLeft = Math.min(
			maxTimeSeconds,
			timeLeft + bonus
		);
		clearingGrid = cloneGrid(grid);
		clearingPalette = getPalette();
		clearingSize = size;

		score += bonus;
		updateLevel();

		await new Promise((resolve) => setTimeout(resolve, 450));

		newPuzzle();
		exploding = true;

		await new Promise((resolve) => setTimeout(resolve, 700));

		clearingGrid = null;
		clearingPalette = null;
		clearingSize = null;
		exploding = false;
		solved = false;
		solvedLineModes = [];
	}

	function getCellClass(cell: CellState, palette = getPalette()) {
		if (cell === null) {
			return 'invisible pointer-events-none';
		}
		if (gameOver) {
			if (cell === CELL_STATES.blue) return `${palette.blue} opacity-35 saturate-50`;
			if (cell === CELL_STATES.orange) return `${palette.orange} opacity-35 saturate-50`;
		}

		if (cell === CELL_STATES.blue) return palette.blue;
		if (cell === CELL_STATES.orange) return palette.orange;

		return 'bg-slate-500';
	}

	newPuzzle();
</script>

<main class="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

	<section class="w-full max-w-180">
		<h1 class="mb-4 text-3xl font-bold text-center">Reflektions</h1>
		<!-- Set Right, Just So, Symmetrix, Accord, There, Aligned, Flipped, Fold, Folded, Foldy/Foldie, Symfold  -->
		<div class="mb-4 flex justify-center gap-10 text-2xl font-bold">
			<div>
				Score: {score}
			</div>

			{#if gameOver}
				<div class="text-red-400">
					Game Over
				</div>
			{:else}
				<div>
					Time: {Math.ceil(timeLeft)}
				</div>
			{/if}
		</div>
		<div class="mb-4 flex justify-center gap-3">
			<button
				type="button"
				class="rounded bg-slate-700 px-4 py-2 hover:bg-slate-600"
				onclick={resetGame}
			>
				New Game
			</button>
			<label class="flex items-center gap-3 text-sm font-medium">
				<span>Colour</span>

				<button
					type="button"
					role="switch"
					aria-checked={colorMode !== 'greyscale'}
					aria-label="Toggle colour mode"
					class={[
						'relative h-7 w-14 rounded-full transition-colors',
						colorMode !== 'greyscale' ? 'bg-green-500' : 'bg-slate-600'
					].join(' ')}
					onclick={() => (colorMode = colorMode === 'greyscale' ? 'theme' : 'greyscale')}
				>
					<div
						class={[
							'absolute top-1 h-5 w-5 rounded-full bg-white transition-all',
							colorMode !== 'greyscale' ? 'left-8' : 'left-1'
						].join(' ')}
					></div>
				</button>

				<span>{colorMode !== 'greyscale' ? 'On' : 'Off'}</span>
			</label>
			<!-- <select
				class="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
				value={generationMode}
				onchange={changeGenerationMode}
			>
				<option value="random">Random</option>
				<option value="vertical">Vertical</option>
				<option value="horizontal">Horizontal</option>
			</select> -->
		</div>
		<div class="mb-3 text-center text-lg font-semibold text-slate-200">
			{currentLevel.levelText}
		</div>
		<div
			class="rounded-3xl p-2 transition-all"
			style={`background: conic-gradient(from 0deg, rgb(255 255 110) ${timerDegrees}deg, rgb(71 85 105) ${timerDegrees}deg 360deg);`}
		>
			<div class="relative overflow-hidden rounded-2xl bg-slate-950">
				{#if gameOver}
					<div class="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
						<div class="rounded-lg border border-slate-500 bg-slate-950/90 px-5 py-2 text-xl font-bold tracking-wider text-red-300">
							GAME OVER
						</div>
					</div>
				{/if}
				<div
					class={[
						'board board-square aspect-square w-full gap-2 rounded-2xl bg-slate-800 p-3 shadow-xl transition-all duration-500',
						solved ? 'scale-[1.02] shadow-orange-400/80 ring-4 ring-orange-300' : ''
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
									'aspect-square rounded-lg transition-all duration-700 hover:scale-95 focus:outline-none focus:ring-2 focus:ring-white',
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
						class="pointer-events-none absolute inset-0 z-10 board board-square gap-2 p-3"
						style={`--size:${clearingSize ?? size};`}
					>
						{#each clearingGrid as row, rowIndex}
							{#each row as cell, colIndex}
								<div
									class={[
										'aspect-square rounded-lg',
										getCellClass(cell, clearingPalette ?? getPalette()),
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
									<div class="draw-vertical-line h-full w-1 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"></div>
								</div>
							{:else if lineStyle === 'horizontal'}
								<div class="absolute inset-3 flex items-center">
									<div class="draw-horizontal-line h-1 w-full rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"></div>
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
			transform:
				translate(var(--tx), var(--ty))
				rotate(220deg)
				scale(0.35);
			opacity: 0;
		}
	}

	.board-square {
		display: grid;
		grid-template-columns: repeat(var(--size), minmax(0, 1fr));
	}
</style>