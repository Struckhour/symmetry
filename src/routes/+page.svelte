<script lang="ts">
	import { onMount } from 'svelte';
	import SquareGame from '$lib/components/SquareGame.svelte';
	import TriangleGame from '$lib/components/TriangleGame.svelte';
	import { levels } from '$lib/levels';
	import type { LevelSettings } from '$lib/types';
	type ColorMode = 'theme' | 'greyscale';



	const startingTimeSeconds = 30;
	const secondsPerWrap = 60;

	const timerColors = [
		'rgb(255 255 110)', // yellow, final minute only
		'rgb(168 85 247)',  // purple
		'rgb(249 115 22)',  // orange
		'rgb(59 130 246)',  // blue
		'rgb(239 68 68)',   // red
		'rgb(20 184 166)',  // teal
		'rgb(236 72 153)',  // pink
		'rgb(34 197 94)',   // green
		'rgb(245 158 11)',   // amber
		'rgb(132 204 22)',  // lime
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
	let boardFadeKey = $state(0);
	let highScore = $state(0);
	let score = $state(0);
	
	let gameOver = $state(false);
	let gameStarted = $state(false);
	let colorMode = $state<ColorMode>('theme');
	let currentLevelIndex = $state(0);
	let gameId = $state(0);


	let settingsOpen = $state(false);
	let sfxVolume = $state(0.5);
	let musicVolume = $state(0.4);


	

	let currentLevel = $derived(levels[currentLevelIndex]);
	let solveSound1: HTMLAudioElement;
	let solveSound2: HTMLAudioElement;
	let solveSound3: HTMLAudioElement;
	let multiSolveSound: HTMLAudioElement;
	let levelUpSound: HTMLAudioElement;
	let gameOverSound: HTMLAudioElement;
	let gameMusic: HTMLAudioElement;
	let cellClickSound: HTMLAudioElement;
	type ConcreteBoardType = 'square' | 'triangle';



	function getRandomBoardType(): ConcreteBoardType {
		return Math.random() < 0.5 ? 'square' : 'triangle';
	}

	let activeBoardType = $state<ConcreteBoardType>(
		levels[0].boardType === 'random' ? getRandomBoardType() : levels[0].boardType
	);

	function chooseBoardTypeForLevel(level: LevelSettings = levels[currentLevelIndex]) {
		activeBoardType =
			level.boardType === 'random'
				? getRandomBoardType()
				: level.boardType;
	}


	function setSfxVolume(value: number) {
		sfxVolume = value;
		localStorage.setItem('reflektions-sfx-volume', String(sfxVolume));

		solveSound1.volume = sfxVolume;
		solveSound2.volume = sfxVolume;
		solveSound3.volume = sfxVolume;
		multiSolveSound.volume = sfxVolume;
		levelUpSound.volume = sfxVolume;
		gameOverSound.volume = sfxVolume;
		cellClickSound.volume = sfxVolume * 0.5;
	}

	function setMusicVolume(value: number) {
		musicVolume = value;
		localStorage.setItem('reflektions-music-volume', String(musicVolume));

		if (gameMusic) {
			gameMusic.volume = musicVolume;
		}
	}

	onMount(() => {
		chooseBoardTypeForLevel();
		solveSound1 = new Audio('/sounds/symmetry_solve_1.mp3');
		solveSound2 = new Audio('/sounds/symmetry_solve_2.mp3');
		solveSound3 = new Audio('/sounds/symmetry_solve_3.mp3');
		multiSolveSound = new Audio('/sounds/powerup.wav');
		gameMusic = new Audio('/sounds/peaceful_symmetry.mp3');
		levelUpSound = new Audio('/sounds/levelup.wav');
		gameOverSound = new Audio('/sounds/game_over.wav');
		cellClickSound = new Audio('/sounds/symmetry_click_1.mp3');

		gameMusic.loop = true;
		gameMusic.volume = musicVolume;

		solveSound1.volume = sfxVolume;
		solveSound2.volume = sfxVolume;
		solveSound3.volume = sfxVolume;
		multiSolveSound.volume = sfxVolume;
		levelUpSound.volume = sfxVolume;
		gameOverSound.volume = sfxVolume;
		cellClickSound.volume = sfxVolume * 0.5;



		const savedHighScore = localStorage.getItem('reflektions-high-score');
			if (savedHighScore !== null) {
				highScore = Number(savedHighScore);
			}

		const savedColorMode = localStorage.getItem('reflektions-color-mode');
			if (savedColorMode === 'theme' || savedColorMode === 'greyscale') {
				colorMode = savedColorMode;
			}
		const savedSfxVolume = localStorage.getItem('reflektions-sfx-volume');
			if (savedSfxVolume !== null) {
				sfxVolume = Number(savedSfxVolume);
			}

		const savedMusicVolume = localStorage.getItem('reflektions-music-volume');
			if (savedMusicVolume !== null) {
				musicVolume = Number(savedMusicVolume);
			}
		const interval = setInterval(() => {
			if (!gameStarted) return;
			if (!gameStarted || gameOver) return;

			timeLeft = Math.max(0, timeLeft - 0.05);

			if (timeLeft === 0) {
				gameOver = true;
				stopMusic();
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
		if (sfxVolume <= 0) return;
		if (!sound) return;

		sound.currentTime = 0;
		sound.play().catch(() => {});
	}

	let pendingBoardSwitch = $state(false);

	function handleCellChange() {
		playSound(cellClickSound);
	}

	function handleSolve(solvedModes: string[]) {
		const symmetryCount = solvedModes.length;
		const solveTimeBonus = symmetryCount * currentLevel.solveBonusSeconds;
		const solvePoints = symmetryCount * currentLevel.solveScorePoints;

		timeLeft += solveTimeBonus;

		let nextScore = score + solvePoints;

		const nextLevelIndex = levels.findLastIndex(
			(level) => nextScore >= level.threshold
		);

		const leveledUp = nextLevelIndex > currentLevelIndex;

		if (leveledUp) {
			const completedLevel = currentLevel;

			nextScore += completedLevel.levelCompletionScoreBonus;
			timeLeft += completedLevel.levelCompletionTimeBonus;

			playSound(levelUpSound);

			pendingBoardSwitch = true;

			setTimeout(() => {
				currentLevelIndex = nextLevelIndex;
				chooseBoardTypeForLevel();

				pendingBoardSwitch = false;
				gameId += 1;
				boardFadeKey += 1;
			}, 1150);
		} else {
			playSound(getSolveSound(solvedModes));
		}

		score = nextScore;

		if (nextScore > highScore) {
			highScore = nextScore;
			localStorage.setItem('reflektions-high-score', String(highScore));
		}
	}

	function getSolveSound(solvedModes: string[]) {
		// Multiple symmetries = special sound
		if (solvedModes.length > 1) {
			return multiSolveSound;
		}

		if (
			solvedModes.includes('squareVertical') ||
			solvedModes.includes('topToBase')
		) {
			return solveSound1;
		}

		if (
			solvedModes.includes('squareHorizontal') ||
			solvedModes.includes('leftToRightSide')
		) {
			return solveSound2;
		}

		return solveSound3;
	}

	function toggleColorMode() {
		colorMode = colorMode === 'greyscale' ? 'theme' : 'greyscale';
		localStorage.setItem('reflektions-color-mode', colorMode);
	}

	function startMusic() {
		if (!gameMusic) return;
		if (musicVolume <= 0) return;

		gameMusic.loop = true;
		gameMusic.volume = musicVolume;
		gameMusic.currentTime = 0;
		gameMusic.play().catch(() => {});
	}

	function stopMusic() {
		if (!gameMusic) return;

		gameMusic.pause();
		gameMusic.currentTime = 0;
	}

	function startGame() {
		gameStarted = true;
		resetGame();
	}
	
	function resetGame() {
		score = 0;
		timeLeft = startingTimeSeconds;
		gameOver = false;
		currentLevelIndex = 0;
		chooseBoardTypeForLevel();
		gameId += 1;

		if (gameStarted) {
			startMusic();
		}
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
				class="min-h-11 rounded-xl bg-slate-700 px-4 py-2 touch-manipulation select-none hover:bg-slate-600 active:bg-slate-500"
				onclick={gameStarted ? resetGame : startGame}
			>
				{gameStarted ? 'New Game' : 'Start Game'}
			</button>
			<button
				type="button"
				class="min-h-11 rounded bg-slate-700 px-4 py-2 text-xl touch-manipulation select-none hover:bg-slate-600 active:bg-slate-500"
				aria-label="Open settings"
				onclick={() => (settingsOpen = !settingsOpen)}
			>
				⚙
			</button>
			

		</div>



		<div class="mb-3 text-center text-lg font-semibold text-slate-200">
			{currentLevel.levelText}
		</div>

		<div
			class="relative rounded-3xl p-2 transition-all"
			style={`background: conic-gradient(from 0deg, ${timerForeground} ${timerDegrees}deg, ${timerBackground} ${timerDegrees}deg 360deg);`}
		>
			{#key boardFadeKey}
				<div class="animate-board-fade-in">
					{#if activeBoardType === 'square'}
						<SquareGame
							{gameId}
							level={currentLevel}
							palette={getPalette()}
							gameOver={gameOver || !gameStarted}
							showGameOver={gameOver}
							onSolve={handleSolve}
							onCellChange={handleCellChange}
							onTryAgain={resetGame}
							hideNextBoard={pendingBoardSwitch}
						/>
					{:else}
						<TriangleGame
							{gameId}
							level={currentLevel}
							palette={getPalette()}
							gameOver={gameOver || !gameStarted}
							showGameOver={gameOver}
							onSolve={handleSolve}
							onCellChange={handleCellChange}
							onTryAgain={resetGame}
							hideNextBoard={pendingBoardSwitch}
						/>
					{/if}
				</div>
			{/key}

			{#if settingsOpen}
				<button
					type="button"
					class="absolute inset-0 z-40 rounded-3xl bg-slate-950/60 backdrop-blur-sm"
					aria-label="Close settings"
					onclick={() => (settingsOpen = false)}
				></button>

				<div class="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
					<div class="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl pointer-events-auto">
						<div class="mb-3 text-center text-lg font-bold">Settings</div>

						<label class="mb-4 block">
							<div class="mb-1 flex justify-between text-sm font-medium">
								<span>SFX Volume</span>
								<span>{Math.round(sfxVolume * 100)}%</span>
							</div>

							<input
								type="range"
								min="0"
								max="1"
								step="0.05"
								value={sfxVolume}
								oninput={(event) => setSfxVolume(Number(event.currentTarget.value))}
								class="w-full"
							/>
						</label>

						<label class="mb-4 block">
							<div class="mb-1 flex justify-between text-sm font-medium">
								<span>Music Volume</span>
								<span>{Math.round(musicVolume * 100)}%</span>
							</div>

							<input
								type="range"
								min="0"
								max="1"
								step="0.05"
								value={musicVolume}
								oninput={(event) => setMusicVolume(Number(event.currentTarget.value))}
								class="w-full"
							/>
						</label>

						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">Colour</span>

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
						</div>
					</div>
				</div>
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

	.animate-board-fade-in {
		animation: board-fade-in 0.3s ease-out both;
	}

	@keyframes board-fade-in {
		from {
			opacity: 0;
			transform: scale(0.98);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>