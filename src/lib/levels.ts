import type { LevelSettings } from '$lib/types';

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
        colors: {
            blue: 'bg-blue-800',
            orange: 'bg-orange-400'
        }
    },
    {
        threshold: 7,
        levelText: 'Level 2: 4 x 4 Triangles - 2 Moves From Symmetry',
        boardType: 'triangle',
        size: 4,
        scrambleFlips: 2,
        solveBonusSeconds: 2,
        solveScorePoints: 1,
        levelCompletionTimeBonus: 15,
        levelCompletionScoreBonus: 0,
        creationModes: [],
        colors: {
            blue: 'bg-purple-800',
            orange: 'bg-yellow-400'
        }
    },
    {
        threshold: 14,
        levelText: 'Level 3: 5 x 5 Triangles - 3 Moves From Symmetry',
        boardType: 'triangle',
        size: 5,
        scrambleFlips: 3,
        solveBonusSeconds: 2,
        solveScorePoints: 1,
        levelCompletionTimeBonus: 15,
        levelCompletionScoreBonus: 0,
        creationModes: [],
        colors: {
            blue: 'bg-emerald-800',
            orange: 'bg-pink-400'
        }
    },
    {
        threshold: 21,
        levelText: 'Level 4: 3 x 3 Squares - 1 Move From Symmetry',
        boardType: 'square',
        size: 3,
        scrambleFlips: 1,
        solveBonusSeconds: 2,
        solveScorePoints: 1,
        levelCompletionTimeBonus: 15,
        levelCompletionScoreBonus: 0,
        creationModes: ['squareDiagonalDown', 'squareDiagonalUp', 'squareHorizontal', 'squareVertical'],
        colors: {
            blue: 'bg-cyan-800',
            orange: 'bg-yellow-400'
        }
    },
    {
        threshold: 28,
        levelText: 'Level 5: 4 x 4 Squares - 2 Moves From Symmetry',
        boardType: 'square',
        size: 4,
        scrambleFlips: 2,
        solveBonusSeconds: 3,
        solveScorePoints: 1,
        levelCompletionTimeBonus: 15,
        levelCompletionScoreBonus: 0,
        creationModes: ['squareDiagonalDown', 'squareDiagonalUp', 'squareHorizontal', 'squareVertical'],
        colors: {
            blue: 'bg-gray-900',
            orange: 'bg-teal-400'
        }
    },
    {
        threshold: 35,
        levelText: 'Level 6: 5 x 5 Squares - 3 Moves From Symmetry',
        boardType: 'square',
        size: 5,
        scrambleFlips: 3,
        solveBonusSeconds: 3,
        solveScorePoints: 1,
        levelCompletionTimeBonus: 30,
        levelCompletionScoreBonus: 0,
        creationModes: ['squareDiagonalDown', 'squareDiagonalUp', 'squareHorizontal', 'squareVertical'],
        colors: {
            blue: 'bg-purple-900',
            orange: 'bg-orange-300'
        }
    },
    {
        threshold: 42,
        levelText: 'Level 7',
        boardType: 'square',
        size: 5,
        scrambleFlips: 2,
        solveBonusSeconds: 3,
        solveScorePoints: 1,
        levelCompletionTimeBonus: 30,
        levelCompletionScoreBonus: 0,
        creationModes: ['squareDiagonalDown', 'squareDiagonalUp', 'squareHorizontal', 'squareVertical'],
        colors: {
            blue: 'bg-pink-900',
            orange: 'bg-lime-200'
        }
    },
    {
        threshold: 49,
        levelText: 'Level 8',
        boardType: 'triangle',
        size: 4,
        scrambleFlips: 1,
        solveBonusSeconds: 1,
        solveScorePoints: 1,
        levelCompletionTimeBonus: 10,
        levelCompletionScoreBonus: 0,
        creationModes: [],
        colors: {
            blue: 'bg-blue-800',
            orange: 'bg-orange-400'
        }
    },

];