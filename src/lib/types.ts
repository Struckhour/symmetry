export type ConcreteSymmetryMode =
	| 'squareVertical'
	| 'squareHorizontal'
	| 'squareDiagonalDown'
	| 'squareDiagonalUp';

export type Palette = {
	blue: string;
	orange: string;
};

export type LevelSettings = {
	threshold: number;
	levelText: string;
	size: number;
	scrambleFlips: number;
	solveBonusSeconds: number;
	creationModes: ConcreteSymmetryMode[];
	colors: Palette;
};