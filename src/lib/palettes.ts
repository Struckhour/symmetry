export type PaletteName =
	| 'blueOrange'
	| 'purpleYellow'
	| 'emeraldPink'
	| 'cyanYellow'
	| 'grayTeal'
	| 'purpleOrange'
	| 'pinkLime';

export const palettes = {
	blueOrange: {
		blue: 'bg-blue-800',
		orange: 'bg-orange-400'
	},
	purpleYellow: {
		blue: 'bg-purple-800',
		orange: 'bg-yellow-400'
	},
	emeraldPink: {
		blue: 'bg-emerald-800',
		orange: 'bg-pink-400'
	},
	cyanYellow: {
		blue: 'bg-cyan-800',
		orange: 'bg-yellow-400'
	},
	grayTeal: {
		blue: 'bg-gray-900',
		orange: 'bg-teal-400'
	},
	purpleOrange: {
		blue: 'bg-purple-900',
		orange: 'bg-orange-300'
	},
	pinkLime: {
		blue: 'bg-pink-900',
		orange: 'bg-lime-200'
	}
} as const;

export const classToColor: Record<string, string> = {
	'bg-sky-800': '#075985',
	'bg-cyan-800': '#155e75',
	'bg-blue-800': '#1e40af',
	'bg-indigo-800': '#3730a3',

	'bg-violet-800': '#5b21b6',
	'bg-purple-800': '#6b21a8',
	'bg-purple-900': '#581c87',
	'bg-fuchsia-800': '#86198f',
	'bg-pink-800': '#9d174d',
	'bg-pink-900': '#831843',
	'bg-rose-800': '#9f1239',

	'bg-emerald-800': '#065f46',
	'bg-green-800': '#166534',
	'bg-teal-800': '#115e59',
	'bg-lime-800': '#3f6212',

	'bg-yellow-400': '#facc15',
	'bg-amber-400': '#fbbf24',
	'bg-orange-300': '#fdba74',
	'bg-orange-400': '#fb923c',
	'bg-red-400': '#f87171',
	'bg-red-500': '#ef4444',
	'bg-pink-400': '#f472b6',
	'bg-teal-400': '#2dd4bf',
	'bg-lime-200': '#d9f99d',

	'bg-slate-300': '#cbd5e1',
	'bg-slate-700': '#334155',
	'bg-slate-800': '#1e293b',
	'bg-gray-700': '#374151',
	'bg-gray-800': '#1f2937',
	'bg-gray-900': '#111827',
	'bg-zinc-800': '#27272a',
	'bg-stone-700': '#44403c'
};