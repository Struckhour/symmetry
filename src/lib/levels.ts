import type { LevelSettings, ConcreteSymmetryMode } from '$lib/types';
import { palettes } from '$lib/palettes';


const squareModes: ConcreteSymmetryMode[] = [
	'squareDiagonalDown',
	'squareDiagonalUp',
	'squareHorizontal',
	'squareVertical'
];

export const levels: LevelSettings[] = [
	{
		threshold: 0,
		levelText: 'Level 1: 3x3 Triangles - 1 Move From Symmetry',
		boardType: 'triangle',
		size: 3,
		scrambleFlips: 1,
		solveBonusSeconds: 2,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 15,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.blueOrange
	},
	{
		threshold: 7,
		levelText: 'Level 2: 4x4 Triangles - 2 Moves From Symmetry',
		boardType: 'triangle',
		size: 4,
		scrambleFlips: 2,
		solveBonusSeconds: 2,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 15,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.purpleYellow
	},
	{
		threshold: 14,
		levelText: 'Level 3: 5x5 Triangles - 3 Moves From Symmetry',
		boardType: 'triangle',
		size: 5,
		scrambleFlips: 3,
		solveBonusSeconds: 2,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 15,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.emeraldPink
	},
	{
		threshold: 21,
		levelText: 'Level 4: 3x3 Squares - 1 Move From Symmetry',
		boardType: 'square',
		size: 3,
		scrambleFlips: 1,
		solveBonusSeconds: 2,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 15,
		levelCompletionScoreBonus: 0,
		creationModes: squareModes,
		colors: palettes.cyanYellow
	},
	{
		threshold: 28,
		levelText: 'Level 5: 4x4 Squares - 2 Moves From Symmetry',
		boardType: 'square',
		size: 4,
		scrambleFlips: 2,
		solveBonusSeconds: 3,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 15,
		levelCompletionScoreBonus: 0,
		creationModes: squareModes,
		colors: palettes.grayTeal
	},
	{
		threshold: 35,
		levelText: 'Level 6: 5x5 Squares - 3 Moves From Symmetry',
		boardType: 'square',
		size: 5,
		scrambleFlips: 3,
		solveBonusSeconds: 3,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: squareModes,
		colors: palettes.purpleOrange
	},

	{
		threshold: 42,
		levelText: 'Level 7: 5x5 Triangles - 4 Moves From Symmetry',
		boardType: 'triangle',
		size: 5,
		scrambleFlips: 4,
		solveBonusSeconds: 3,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.pinkLime
	},
	{
		threshold: 49,
		levelText: 'Level 8: 6x6 Triangles - 4 Moves From Symmetry',
		boardType: 'triangle',
		size: 6,
		scrambleFlips: 4,
		solveBonusSeconds: 3,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.blueOrange
	},
	{
		threshold: 56,
		levelText: 'Level 9: 7x7 Triangles - 4 Moves From Symmetry',
		boardType: 'triangle',
		size: 7,
		scrambleFlips: 4,
		solveBonusSeconds: 3,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.purpleYellow
	},

	{
		threshold: 63,
		levelText: 'Level 10: 5x5 Squares - 4 Moves From Symmetry',
		boardType: 'square',
		size: 5,
		scrambleFlips: 4,
		solveBonusSeconds: 3,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: squareModes,
		colors: palettes.emeraldPink
	},
	{
		threshold: 70,
		levelText: 'Level 11: 6x6 Squares - 4 Moves From Symmetry',
		boardType: 'square',
		size: 6,
		scrambleFlips: 4,
		solveBonusSeconds: 4,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: squareModes,
		colors: palettes.cyanYellow
	},
	{
		threshold: 77,
		levelText: 'Level 12: 7x7 Squares - 4 Moves From Symmetry',
		boardType: 'square',
		size: 7,
		scrambleFlips: 4,
		solveBonusSeconds: 4,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: squareModes,
		colors: palettes.blueOrange
	},

	{
		threshold: 84,
		levelText: 'Level 13: 6x6 Triangles - 5 Moves From Symmetry',
		boardType: 'triangle',
		size: 6,
		scrambleFlips: 5,
		solveBonusSeconds: 4,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.purpleOrange
	},
	{
		threshold: 91,
		levelText: 'Level 14: 7x7 Triangles - 5 Moves From Symmetry',
		boardType: 'triangle',
		size: 7,
		scrambleFlips: 5,
		solveBonusSeconds: 4,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.purpleYellow
	},
	{
		threshold: 98,
		levelText: 'Level 15: 8x8 Triangles - 5 Moves From Symmetry',
		boardType: 'triangle',
		size: 8,
		scrambleFlips: 5,
		solveBonusSeconds: 4,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.blueOrange
	},

	{
		threshold: 105,
		levelText: 'Level 16: 6x6 Squares - 5 Moves From Symmetry',
		boardType: 'square',
		size: 6,
		scrambleFlips: 5,
		solveBonusSeconds: 4,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: squareModes,
		colors: palettes.pinkLime
	},
	{
		threshold: 112,
		levelText: 'Level 17: 7x7 Squares - 5 Moves From Symmetry',
		boardType: 'square',
		size: 7,
		scrambleFlips: 5,
		solveBonusSeconds: 5,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: squareModes,
		colors: palettes.emeraldPink
	},
	{
		threshold: 119,
		levelText: 'Level 18: 8x8 Squares - 5 Moves From Symmetry',
		boardType: 'square',
		size: 8,
		scrambleFlips: 5,
		solveBonusSeconds: 5,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: squareModes,
		colors: palettes.cyanYellow
	},

	{
		threshold: 126,
		levelText: 'Level 19: 7x7 Triangles - 6 Moves From Symmetry',
		boardType: 'triangle',
		size: 7,
		scrambleFlips: 6,
		solveBonusSeconds: 5,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.blueOrange
	},
	{
		threshold: 133,
		levelText: 'Level 20: 8x8 Triangles - 6 Moves From Symmetry',
		boardType: 'triangle',
		size: 8,
		scrambleFlips: 6,
		solveBonusSeconds: 5,
		solveScorePoints: 1,
		levelCompletionTimeBonus: 30,
		levelCompletionScoreBonus: 0,
		creationModes: [],
		colors: palettes.purpleOrange
	}
];