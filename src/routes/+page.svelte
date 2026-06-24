<script lang="ts">
	import { onMount } from 'svelte';
	import SquareGame from '$lib/components/SquareGame.svelte';
	import TriangleGame from '$lib/components/TriangleGame.svelte';
	import type {
		LevelSettings
	} from '$lib/types';
	type ColorMode = 'theme' | 'greyscale';



	const startingTimeSeconds = 5;
	const secondsPerWrap = 60;

	const timerColors = [
		'rgb(255 255 110)', // yellow, final minute only
		'rgb(249 115 22)',  // orange
		'rgb(239 68 68)',   // red
		'rgb(236 72 153)',  // pink
		'rgb(168 85 247)',  // purple
		'rgb(59 130 246)',  // blue
		'rgb(20 184 166)',  // teal
		'rgb(34 197 94)',   // green
		'rgb(132 204 22)',  // lime
		'rgb(245 158 11)'   // amber
	];
	let timeLeft = $state(startingTimeSeconds);
	let currentWrapIndex = $derived(Math.max(0, Math.ceil(timeLeft / secondsPerWrap) - 1));
	let timerDegrees = $derived(((timeLeft % secondsPerWrap) / secondsPerWrap) * 360 || 360);

	let timerForeground = $derived(timerColors[currentWrapIndex % timerColors.length]);
	let timerBackground = $derived(
		currentWrapIndex === 0
			? 'rgb(71 85 105)'
			: timerColors[(currentWrapIndex - 1) % timerColors.length]
	);

	let highScore = $state(0);
	let score = $state(0);
	
	let gameOver = $state(false);
	let colorMode = $state<ColorMode>('theme');
	let currentLevelIndex = $state(0);
	let gameId = $state(0);
	let sfxEnabled = $state(true);

	const levels: LevelSettings[] = [
		{
			threshold: 0,
			levelText: 'Level 1: Vertical Symmetry',
			boardType: 'square',
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
			boardType: 'square',
			size: 4,
			scrambleFlips: 1,
			solveBonusSeconds: 10,
			creationModes: ['squareHorizontal'],
			colors: {
				blue: 'bg-purple-800',
				orange: 'bg-yellow-400'
			}
		},
		{
			threshold: 80,
			levelText: 'Level 3: Diagonal Symmetry',
			boardType: 'square',
			size: 4,
			scrambleFlips: 1,
			solveBonusSeconds: 12,
			creationModes: ['squareDiagonalDown', 'squareDiagonalUp'],
			colors: {
				blue: 'bg-emerald-800',
				orange: 'bg-pink-400'
			}
		},
		{
			threshold: 120,
			levelText: 'Level 4: Triangles!',
			boardType: 'triangle',
			size: 4,
			scrambleFlips: 1,
			solveBonusSeconds: 8,
			creationModes: [],
			colors: {
				blue: 'bg-cyan-800',
				orange: 'bg-yellow-400'
			}
		},

	];

	let currentLevel = $derived(levels[currentLevelIndex]);
	let solveSound: HTMLAudioElement;
	let levelUpSound: HTMLAudioElement;
	let gameOverSound: HTMLAudioElement;
	type ConcreteBoardType = 'square' | 'triangle';

	function getRandomBoardType(): ConcreteBoardType {
		return Math.random() < 0.5 ? 'square' : 'triangle';
	}

	let activeBoardType = $state<ConcreteBoardType>('square');

	function chooseBoardTypeForLevel() {
		activeBoardType =
			currentLevel.boardType === 'random'
				? getRandomBoardType()
				: currentLevel.boardType;
	}

	onMount(() => {
		chooseBoardTypeForLevel();
		solveSound = new Audio('/sounds/powerup.wav');
		levelUpSound = new Audio('/sounds/levelup.wav');
		gameOverSound = new Audio('/sounds/game_over.wav');
		gameOverSound.volume = 0.5;
		levelUpSound.volume = 0.5;
		solveSound.volume = 0.5;
		const savedSfx = localStorage.getItem('reflektions-sfx-enabled');
		if (savedSfx !== null) {
			sfxEnabled = savedSfx === 'true';
		}

		const savedHighScore = localStorage.getItem('reflektions-high-score');
		if (savedHighScore !== null) {
			highScore = Number(savedHighScore);
		}

		const savedColorMode = localStorage.getItem('reflektions-color-mode');
		if (savedColorMode === 'theme' || savedColorMode === 'greyscale') {
			colorMode = savedColorMode;
		}

		const interval = setInterval(() => {
			if (gameOver) return;

			timeLeft = Math.max(0, timeLeft - 0.05);

			if (timeLeft === 0) {
				gameOver = true;
				playSound(gameOverSound);
			}
		}, 50);

		return () => clearInterval(interval);
	});

	function getPalette() {
		if (colorMode === 'greyscale') {
			return {
				blue: 'bg-slate-700',
				orange: 'bg-slate-300'
			};
		}

		return currentLevel.colors;
	}

	function playSound(sound: HTMLAudioElement) {
		if (!sfxEnabled) return;
		if (!sound) return;

		sound.currentTime = 0;
		sound.play().catch(() => {});
	}

	function toggleSfx() {
		sfxEnabled = !sfxEnabled;
		localStorage.setItem(
			'reflektions-sfx-enabled',
			String(sfxEnabled)
		);
	}

	function handleSolve(bonus: number) {
		timeLeft = timeLeft + bonus;

		const nextScore = score + bonus;
		score = nextScore;

		const nextLevelIndex = levels.findLastIndex(
			(level) => nextScore >= level.threshold
		);

		const leveledUp = nextLevelIndex > currentLevelIndex;

		if (leveledUp) {
			playSound(levelUpSound);
			currentLevelIndex = nextLevelIndex;
			chooseBoardTypeForLevel();
		} else {
			playSound(solveSound);
		}

		if (nextScore > highScore) {
			highScore = nextScore;
			localStorage.setItem('reflektions-high-score', String(highScore));
		}
	}

	function toggleColorMode() {
		colorMode = colorMode === 'greyscale' ? 'theme' : 'greyscale';
		localStorage.setItem('reflektions-color-mode', colorMode);
	}

	
	function resetGame() {
		score = 0;
		timeLeft = startingTimeSeconds;
		gameOver = false;
		currentLevelIndex = 0;
		chooseBoardTypeForLevel();
		gameId += 1;
	}
</script>

<main class="flex min-h-screen items-center justify-center bg-slate-950 p-3 text-white sm:p-6">
	<section class="w-full max-w-180">
		<h1 class="mb-4 text-center text-3xl font-bold">Reflektions</h1>

		<div class="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xl font-bold sm:gap-10 sm:text-2xl">
			<div>Score: {score}</div>
			<div>Best: {highScore}</div>

			{#if gameOver}
				<div class="text-red-400">Game Over</div>
			{:else}
				<div>Time: {Math.ceil(timeLeft)}</div>
			{/if}
		</div>

		<div class="mb-4 flex flex-wrap items-center justify-center gap-3">
			<button
				type="button"
				class="min-h-11 rounded bg-slate-700 px-4 py-2 touch-manipulation select-none hover:bg-slate-600"
				onclick={resetGame}
			>
				New Game
			</button>

			<label class="flex flex-col items-center gap-1 text-sm font-medium">
				<span>Colour</span>

				<button
					type="button"
					role="switch"
					aria-checked={colorMode !== 'greyscale'}
					aria-label="Toggle colour mode"
					class={[
						'relative h-8 w-16 rounded-full transition-colors touch-manipulation select-none',
						colorMode !== 'greyscale' ? 'bg-green-500' : 'bg-slate-600'
					].join(' ')}
					onclick={toggleColorMode}
				>
					<div
						class={[
							'absolute top-1 h-6 w-6 rounded-full bg-white transition-all',
							colorMode !== 'greyscale' ? 'left-9' : 'left-1'
						].join(' ')}
					></div>
				</button>
			</label>
			<label class="flex flex-col items-center gap-1 text-sm font-medium">
				<span>SFX</span>

				<button
					type="button"
					role="switch"
					aria-checked={sfxEnabled}
					aria-label="Toggle sound effects"
					class={[
						'relative h-8 w-16 rounded-full transition-colors touch-manipulation select-none',
						sfxEnabled ? 'bg-green-500' : 'bg-slate-600'
					].join(' ')}
					onclick={toggleSfx}
				>
					<div
						class={[
							'absolute top-1 h-6 w-6 rounded-full bg-white transition-all',
							sfxEnabled ? 'left-9' : 'left-1'
						].join(' ')}
					></div>
				</button>
			</label>
		</div>

		<div class="mb-3 text-center text-lg font-semibold text-slate-200">
			{currentLevel.levelText}
		</div>

		<div
			class="rounded-3xl p-2 transition-all"
			style={`background: conic-gradient(from 0deg, ${timerForeground} ${timerDegrees}deg, ${timerBackground} ${timerDegrees}deg 360deg);`}
		>
			
			{#if activeBoardType === 'square'}
				<SquareGame
					{gameId}
					level={currentLevel}
					palette={getPalette()}
					{gameOver}
					onSolve={handleSolve}
				/>
			{:else}
				<TriangleGame
					{gameId}
					level={currentLevel}
					palette={getPalette()}
					{gameOver}
					onSolve={handleSolve}
				/>
			{/if}
		
		</div>
	</section>
</main>

<style>
	.slow-board-rotate {
		animation: slow-board-rotate 180s linear infinite;
	}

	@keyframes slow-board-rotate {
		to {
			transform: rotate(360deg);
		}
	}
</style>