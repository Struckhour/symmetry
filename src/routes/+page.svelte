<script lang="ts">
	import { onMount } from 'svelte';
	import SquareGame from '$lib/components/SquareGame.svelte';
	import TriangleGame from '$lib/components/TriangleGame.svelte';
	import type {
		LevelSettings
	} from '$lib/types';
	type ColorMode = 'theme' | 'greyscale';



	const startingTimeSeconds = 5;
	const maxTimeSeconds = 120;

	let score = $state(0);
	let timeLeft = $state(startingTimeSeconds);
	let gameOver = $state(false);
	let colorMode = $state<ColorMode>('theme');
	let currentLevelIndex = $state(0);
	let gameId = $state(0);

	let timerPercent = $derived(timeLeft / maxTimeSeconds);
	let timerDegrees = $derived(timerPercent * 360);

	const levels: LevelSettings[] = [
		{
			threshold: 0,
			levelText: 'Level 1: Vertical Symmetry',
			size: 4,
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
			scrambleFlips: 2,
			solveBonusSeconds: 12,
			creationModes: ['squareDiagonalDown', 'squareDiagonalUp'],
			colors: {
				blue: 'bg-emerald-800',
				orange: 'bg-pink-400'
			}
		}
	];

	let currentLevel = $derived(levels[currentLevelIndex]);

	onMount(() => {
		const interval = setInterval(() => {
			if (gameOver) return;

			timeLeft = Math.max(0, timeLeft - 0.05);

			if (timeLeft === 0) {
				gameOver = true;
			}
		}, 50);

		return () => clearInterval(interval);
	});

	function updateLevel() {
		const nextLevelIndex = levels.findLastIndex((level) => score >= level.threshold);

		if (nextLevelIndex === currentLevelIndex) return;

		currentLevelIndex = nextLevelIndex;
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

	function handleSolve(bonus: number) {
		timeLeft = Math.min(maxTimeSeconds, timeLeft + bonus);
		score += bonus;
		updateLevel();
	}

	function resetGame() {
		score = 0;
		timeLeft = startingTimeSeconds;
		gameOver = false;
		currentLevelIndex = 0;
		gameId += 1;
	}
</script>

<main class="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
	<section class="w-full max-w-180">
		<h1 class="mb-4 text-center text-3xl font-bold">Reflektions</h1>

		<div class="mb-4 flex justify-center gap-10 text-2xl font-bold">
			<div>Score: {score}</div>

			{#if gameOver}
				<div class="text-red-400">Game Over</div>
			{:else}
				<div>Time: {Math.ceil(timeLeft)}</div>
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
		</div>

		<div class="mb-3 text-center text-lg font-semibold text-slate-200">
			{currentLevel.levelText}
		</div>

		<div
			class="rounded-3xl p-2 transition-all"
			style={`background: conic-gradient(from 0deg, rgb(255 255 110) ${timerDegrees}deg, rgb(71 85 105) ${timerDegrees}deg 360deg);`}
		>
			<!-- <SquareGame
				{gameId}
				level={currentLevel}
				palette={getPalette()}
				{gameOver}
				onSolve={handleSolve}
			/> -->
			<TriangleGame size={4} palette={getPalette()} />
		</div>
	</section>
</main>