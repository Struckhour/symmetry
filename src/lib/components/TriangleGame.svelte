<script lang="ts">
	import type { Palette } from '$lib/types';
	import { onMount, untrack } from 'svelte';

	const CELL_STATES = {
		blue: 0,
		orange: 1
	} as const;

	type CellState = (typeof CELL_STATES)[keyof typeof CELL_STATES];

    type TriangleOrientation = 'up' | 'down';

    type TriangleCell = {
        id: string;
        row: number;
        col: number;
        orientation: TriangleOrientation;
        points: string;
        centerX: number;
        centerY: number;
        state: CellState;
    };

    type ConcreteTriangleSymmetryMode =
        | 'topToBase'
        | 'leftToRightSide'
        | 'rightToLeftSide';

    type TriangleSymmetryMode = ConcreteTriangleSymmetryMode | 'random';

    let solved = $state(false);
    let solvedModes = $state<ConcreteTriangleSymmetryMode[]>([]);
    let creationMode = $state<TriangleSymmetryMode>('random');

    let clearingSize = $state<number | null>(null);
    let clearingBoardWidth = $state<number | null>(null);
    let clearingBoardHeight = $state<number | null>(null);

    let clearingCells = $state<TriangleCell[] | null>(null);
    let exploding = $state(false);
    let clearingPalette = $state<Palette | null>(null);

    let currentPuzzleMode = $state<ConcreteTriangleSymmetryMode>('topToBase');
    type Point = {
        x: number;
        y: number;
    };

    let {
        gameId,
        level,
        palette,
        gameOver,
        onSolve,
    }: {
        gameId: number;
        level: {
            size: number;
            scrambleFlips: number;
            solveBonusSeconds: number;
        };
        palette: Palette;
        gameOver: boolean;
        onSolve: (bonus: number) => void;
    } = $props();

    let size = $derived(level.size);

    type TriangleMirrorPair = {
        aId: string;
        bId: string;
    };
    const side = 1;
    const height = Math.sqrt(3) / 2;
    const gap = 0.015;

    const boardWidth = $derived(size * side);
    const boardHeight = $derived(size * height);

	let cells = $state<TriangleCell[]>(createTriangleCells());

    function handleCellPointerUp(event: PointerEvent, id: string) {
        if (!event.isPrimary) return;

        event.preventDefault();
        toggleCell(id);
    }

    function getTrianglePairs(mode: TriangleSymmetryMode): TriangleMirrorPair[] {
        const pairs: TriangleMirrorPair[] = [];
        const usedIds = new Set<string>();
        const axis = getTriangleAxis(mode);

        for (const cell of cells) {
            if (usedIds.has(cell.id)) continue;

            const reflectedPoint = reflectPointAcrossLine(
                { x: cell.centerX, y: cell.centerY },
                axis.a,
                axis.b
            );

            const mirrorCell = findClosestCell(reflectedPoint, cells);

            if (mirrorCell.id === cell.id) {
                usedIds.add(cell.id);
                continue;
            }

            pairs.push({
                aId: cell.id,
                bId: mirrorCell.id
            });

            usedIds.add(cell.id);
            usedIds.add(mirrorCell.id);
        }

        return pairs;
    }

    const triangleSymmetryModes: ConcreteTriangleSymmetryMode[] = [
        'topToBase',
        'leftToRightSide',
        'rightToLeftSide'
    ];

    function getRandomTriangleSymmetryMode(): ConcreteTriangleSymmetryMode {
        return triangleSymmetryModes[
            Math.floor(Math.random() * triangleSymmetryModes.length)
        ];
    }

    function resolveTriangleSymmetryMode(
        mode: TriangleSymmetryMode
    ): ConcreteTriangleSymmetryMode {
        if (mode === 'random') return getRandomTriangleSymmetryMode();

        return mode;
    }

    function makeVerticalSymmetryTest() {
        const pairs = getTrianglePairs('topToBase');
        const newCells: TriangleCell[] = cells.map((cell) => ({
            ...cell,
            state: CELL_STATES.blue as CellState
        }));

        for (const pair of pairs) {
            const value = Math.random() < 0.5 ? CELL_STATES.blue : CELL_STATES.orange;

            newCells.find((cell) => cell.id === pair.aId)!.state = value;
            newCells.find((cell) => cell.id === pair.bId)!.state = value;
        }

        cells = newCells;
        for (const cell of newCells) {
            const isInPair = pairs.some(
                (pair) => pair.aId === cell.id || pair.bId === cell.id
            );

            if (!isInPair) {
                cell.state =
                    Math.random() < 0.5
                        ? CELL_STATES.blue
                        : CELL_STATES.orange;
            }
        }
    }

    function isTriangleVerticallySymmetrical(): boolean {
        const pairs = getTrianglePairs('topToBase');

        for (const pair of pairs) {
            const a = cells.find((cell) => cell.id === pair.aId);
            const b = cells.find((cell) => cell.id === pair.bId);

            if (!a || !b) {
                return false;
            }

            if (a.state !== b.state) {
                return false;
            }
        }

        return true;
    }

	function createTriangleCells(): TriangleCell[] {
		const newCells: TriangleCell[] = [];

		for (let row = 0; row < size; row++) {
			const y = row * height;
			const rowWidth = (row + 1) * side;
			const startX = (boardWidth - rowWidth) / 2;

			for (let col = 0; col < row * 2 + 1; col++) {
				const pairIndex = Math.floor(col / 2);
				const x = startX + pairIndex * side;

                const orientation: TriangleOrientation = col % 2 === 0 ? 'up' : 'down';

                const points =
                    orientation === 'up'
                        ? makeUpTrianglePoints(x, y)
                        : makeDownTrianglePoints(x + side / 2, y);

                const centerX =
                    orientation === 'up'
                        ? x + side / 2
                        : x + side;

                const centerY =
                    orientation === 'up'
                        ? y + (height * 2) / 3
                        : y + height / 3;

                newCells.push({
                    id: `${row}-${col}`,
                    row,
                    col,
                    orientation,
                    points,
                    centerX,
                    centerY,
                    state: CELL_STATES.blue
                });
			}
		}

		return newCells;
	}

	function makeUpTrianglePoints(x: number, y: number) {
		return [
			`${x + side / 2},${y + gap}`,
			`${x + gap},${y + height - gap}`,
			`${x + side - gap},${y + height - gap}`
		].join(' ');
	}

	function makeDownTrianglePoints(x: number, y: number) {
		return [
			`${x + gap},${y + gap}`,
			`${x + side - gap},${y + gap}`,
			`${x + side / 2},${y + height - gap}`
		].join(' ');
	}

    async function toggleCell(id: string) {
        if (solved || gameOver) return;

        cells = cells.map((cell) =>
            cell.id === id
                ? {
                        ...cell,
                        state:
                            cell.state === CELL_STATES.blue
                                ? CELL_STATES.orange
                                : CELL_STATES.blue
                    }
                : cell
        );

        const solvedSymmetries = checkTriangleSolvedSymmetries();

        solvedModes = Object.entries(solvedSymmetries)
            .filter(([, value]) => value)
            .map(([mode]) => mode) as ConcreteTriangleSymmetryMode[];

        if (solvedModes.length === 0) return;

        solved = true;

        clearingCells = cells.map((cell) => ({ ...cell }));
        clearingPalette = palette;
        clearingSize = size;
        clearingBoardWidth = boardWidth;
        clearingBoardHeight = boardHeight;

        onSolve(solvedModes.length);

        await new Promise((resolve) => setTimeout(resolve, 450));

        newTrianglePuzzle();
        exploding = true;

        await new Promise((resolve) => setTimeout(resolve, 700));

        clearingCells = null;
        clearingPalette = null;
        clearingSize = null;
        clearingBoardWidth = null;
        clearingBoardHeight = null;
        exploding = false;
        solved = false;
        solvedModes = [];
    }

    function getSvgFill(cell: CellState, activePalette = palette) {
        if (cell === CELL_STATES.blue) return classToColor(activePalette.blue);
        if (cell === CELL_STATES.orange) return classToColor(activePalette.orange);

        return '#64748b';
    }

	function classToColor(className: string) {
		const colors: Record<string, string> = {
			'bg-blue-800': '#1e40af',
			'bg-orange-400': '#fb923c',
			'bg-purple-800': '#6b21a8',
			'bg-yellow-400': '#facc15',
			'bg-emerald-800': '#065f46',
			'bg-pink-400': '#f472b6',
            'bg-cyan-800': '#155e75',
			'bg-slate-700': '#334155',
			'bg-slate-300': '#cbd5e1'
		};

		return colors[className] ?? '#64748b';
	}

    function randomTriangleState(): CellState {
        return Math.random() < 0.5 ? CELL_STATES.blue : CELL_STATES.orange;
    }

    function createTriangleSymmetryBoard(mode: TriangleSymmetryMode = creationMode) {
        const actualMode = resolveTriangleSymmetryMode(mode);
        const pairs = getTrianglePairs(actualMode);

        let newCells: TriangleCell[] = cells.map((cell) => ({
            ...cell,
            state: randomTriangleState()
        }));

        for (const pair of pairs) {
            const value = randomTriangleState();

            const a = newCells.find((cell) => cell.id === pair.aId);
            const b = newCells.find((cell) => cell.id === pair.bId);

            if (!a || !b) continue;

            a.state = value;
            b.state = value;
        }

        cells = newCells;
    }

    function scrambleTriangleBoard(
        flips = 1,
        mode: ConcreteTriangleSymmetryMode = 'topToBase'
    ) {
        const pairs = [...getTrianglePairs(mode)]
            .sort(() => Math.random() - 0.5);

        const newCells = cells.map((cell) => ({ ...cell }));

        const flipsToApply = Math.min(flips, pairs.length);

        for (let i = 0; i < flipsToApply; i++) {
            const pair = pairs[i];

            const targetId =
                Math.random() < 0.5
                    ? pair.aId
                    : pair.bId;

            const target = newCells.find(
                (cell) => cell.id === targetId
            );

            if (!target) continue;

            target.state =
                target.state === CELL_STATES.blue
                    ? CELL_STATES.orange
                    : CELL_STATES.blue;
        }

        cells = newCells;
    }

    function reflectPointAcrossLine(point: Point, lineA: Point, lineB: Point): Point {
        const dx = lineB.x - lineA.x;
        const dy = lineB.y - lineA.y;

        const t =
            ((point.x - lineA.x) * dx + (point.y - lineA.y) * dy) /
            (dx * dx + dy * dy);

        const projection = {
            x: lineA.x + t * dx,
            y: lineA.y + t * dy
        };

        return {
            x: 2 * projection.x - point.x,
            y: 2 * projection.y - point.y
        };
    }

    function distanceSquared(a: Point, b: Point): number {
        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    }

    function findClosestCell(point: Point, sourceCells: TriangleCell[]): TriangleCell {
        return sourceCells.reduce((closest, cell) => {
            const closestDistance = distanceSquared(point, {
                x: closest.centerX,
                y: closest.centerY
            });

            const cellDistance = distanceSquared(point, {
                x: cell.centerX,
                y: cell.centerY
            });

            return cellDistance < closestDistance ? cell : closest;
        });
    }

    function getTriangleAxis(mode: TriangleSymmetryMode): { a: Point; b: Point } {
        if (mode === 'topToBase') {
            return {
                a: { x: boardWidth / 2, y: 0 },
                b: { x: boardWidth / 2, y: boardHeight }
            };
        }

        if (mode === 'leftToRightSide') {
            return {
                a: { x: 0, y: boardHeight },
                b: { x: boardWidth * 0.75, y: boardHeight / 2 }
            };
        }

        return {
            a: { x: boardWidth, y: boardHeight },
            b: { x: boardWidth * 0.25, y: boardHeight / 2 }
        };
    }

    function isTriangleSymmetrical(
        mode: ConcreteTriangleSymmetryMode
    ): boolean {
        const pairs = getTrianglePairs(mode);

        for (const pair of pairs) {
            const a = cells.find((cell) => cell.id === pair.aId);
            const b = cells.find((cell) => cell.id === pair.bId);

            if (!a || !b) {
                return false;
            }

            if (a.state !== b.state) {
                return false;
            }
        }

        return true;
    }

    function checkTriangleSolvedSymmetries() {
        return {
            topToBase: isTriangleSymmetrical('topToBase'),
            leftToRightSide: isTriangleSymmetrical('leftToRightSide'),
            rightToLeftSide: isTriangleSymmetrical('rightToLeftSide')
        };
    }

    function hasAnySolvedTriangleSymmetry(): boolean {
        const solvedSymmetries = checkTriangleSolvedSymmetries();

        return triangleSymmetryModes.some((mode) => solvedSymmetries[mode]);
    }

    function newTrianglePuzzle() {
        const maxAttempts = 10;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            cells = createTriangleCells();

            currentPuzzleMode = resolveTriangleSymmetryMode(creationMode);

            createTriangleSymmetryBoard(currentPuzzleMode);
            scrambleTriangleBoard(level.scrambleFlips, currentPuzzleMode);

            if (!hasAnySolvedTriangleSymmetry()) {
                return;
            }
        }

        // fallback
        cells = createTriangleCells();

        currentPuzzleMode = resolveTriangleSymmetryMode(creationMode);

        createTriangleSymmetryBoard(currentPuzzleMode);
        scrambleTriangleBoard(level.scrambleFlips + 1, currentPuzzleMode);
    }

    function getTriangleAxisForBoard(
        mode: TriangleSymmetryMode,
        width: number,
        height: number
    ): { a: Point; b: Point } {
        if (mode === 'topToBase') {
            return {
                a: { x: width / 2, y: 0 },
                b: { x: width / 2, y: height }
            };
        }

        if (mode === 'leftToRightSide') {
            return {
                a: { x: 0, y: height },
                b: { x: width * 0.75, y: height / 2 }
            };
        }

        return {
            a: { x: width, y: height },
            b: { x: width * 0.25, y: height / 2 }
        };
    }

    function getTriangleLinePointsForBoard(
        mode: ConcreteTriangleSymmetryMode,
        width: number,
        height: number
    ): string {
        const axis = getTriangleAxisForBoard(mode, width, height);

        return `${axis.a.x},${axis.a.y} ${axis.b.x},${axis.b.y}`;
    }

    let initialized = false;

    $effect(() => {
        const id = gameId;

        if (!initialized) {
            initialized = true;
            return;
        }

        untrack(() => {
            resetBoard();
        });
    });

    function resetBoard() {
        solved = false;
        solvedModes = [];
        clearingCells = null;
        clearingPalette = null;
        clearingSize = null;
        clearingBoardWidth = null;
        clearingBoardHeight = null;
        exploding = false;

        newTrianglePuzzle();
    }

    onMount(() => {
        newTrianglePuzzle();
    });
</script>








<div class="relative overflow-hidden rounded-2xl bg-slate-950">
    {#if gameOver}
        <div class="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <div class="rounded-lg border border-slate-500 bg-slate-950/90 px-5 py-2 text-xl font-bold tracking-wider text-red-300">
                GAME OVER
            </div>
        </div>
    {/if}
    
    <div class="triangle-board">
        <svg
            class={[
                'triangle-svg',
                clearingCells && !exploding ? 'opacity-0' : ''
            ].join(' ')}
            viewBox={`0 0 ${boardWidth} ${boardHeight}`}
            preserveAspectRatio="xMidYMid meet"
            role="grid"
            aria-label="Triangle board"
        >
            {#each cells as cell}
                <polygon
                    points={cell.points}
                    fill={getSvgFill(cell.state)}
                    class="triangle-cell"
                    role="button"
                    tabindex="0"
                    aria-label={`Toggle triangle ${cell.row + 1}, ${cell.col + 1}`}
                    onpointerup={(event) => handleCellPointerUp(event, cell.id)}
                    onkeydown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            toggleCell(cell.id);
                        }
                    }}
                />
            {/each}
        </svg>
        {#if clearingCells && clearingBoardWidth && clearingBoardHeight}
            <svg
                class="triangle-svg clearing-svg"
                viewBox={`0 0 ${clearingBoardWidth} ${clearingBoardHeight}`}
                preserveAspectRatio="xMidYMid meet"
            >
                {#each clearingCells as cell}
                    <polygon
                        points={cell.points}
                        fill={getSvgFill(cell.state, clearingPalette ?? palette)}
                        class={['triangle-cell clearing-cell', exploding ? 'explode-triangle-cell' : ''].join(' ')}
                        style={`--tx:${(cell.centerX - clearingBoardWidth / 2) * 0.9}px; --ty:${(cell.centerY - clearingBoardHeight / 2) * 0.9}px;`}
                    />
                {/each}
                {#if solved && !exploding}
                    {#each solvedModes as mode}
                        <polyline
                            points={getTriangleLinePointsForBoard(
                                mode,
                                clearingBoardWidth,
                                clearingBoardHeight
                            )}
                            class="solved-line draw-solved-line"
                        />
                    {/each}
                {/if}
            </svg>
        {/if}
    </div>
</div>


<style>
    .triangle-board {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 1rem;
        background: rgb(30 41 59);
        padding: 0.5rem;
    }

    .triangle-svg {
        position: absolute;
        inset: 0.5rem;
        width: calc(100% - 1rem);
        height: calc(100% - 1rem);
        overflow: visible;
    }

    .clearing-svg {
        pointer-events: none;
        z-index: 10;
    }

    .triangle-cell {
        cursor: pointer;
        transition: opacity 0.15s ease;
        stroke: rgba(15, 23, 42, 0.45);
        stroke-width: 0.025;
        pointer-events: auto;
    }

    .triangle-cell:hover {
        opacity: 0.85;
    }

    .triangle-cell:focus,
    .triangle-cell:focus-visible {
        outline: none;
    }

    .solved-line {
        fill: none;
        stroke: white;
        stroke-width: 0.035;
        stroke-linecap: round;
        filter: drop-shadow(0 0 0.05px white);
        pointer-events: none;
        stroke-dasharray: 10;
        stroke-dashoffset: 10;
    }

    .draw-solved-line {
        animation: draw-solved-line 0.45s ease-out forwards;
    }

    @keyframes draw-solved-line {
        to {
            stroke-dashoffset: 0;
        }
    }

    .clearing-cell {
        pointer-events: none;
        transform-box: fill-box;
        transform-origin: center;
    }

    .explode-triangle-cell {
        animation: explode-triangle-cell 0.7s ease-in forwards;
    }

    @keyframes explode-triangle-cell {
        to {
            transform:
                translate(var(--tx), var(--ty))
                rotate(220deg)
                scale(0.35);
            opacity: 0;
        }
    }

    .clearing-svg {
        pointer-events: none;
        z-index: 10;
    }

    .triangle-board,
    .triangle-svg,
    .triangle-cell {
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
    }

</style>