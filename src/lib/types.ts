export type ConcreteSymmetryMode =
	| 'squareVertical'
	| 'squareHorizontal'
	| 'squareDiagonalDown'
	| 'squareDiagonalUp';

export type Palette = {
	blue: string;
	orange: string;
};

export type BoardType = 'square' | 'triangle' | 'random';

export type LevelSettings = {
	threshold: number;
	levelText: string;
	size: number;
	scrambleFlips: number;
	creationModes: ConcreteSymmetryMode[];
	boardType: BoardType;
	colors: {
		blue: string;
		orange: string;
	};
	solveBonusSeconds: number;
	solveScorePoints: number;
	levelCompletionTimeBonus: number;
	levelCompletionScoreBonus: number;
};