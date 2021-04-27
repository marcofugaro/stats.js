import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/Stats.js',
	output: [
		{
			format: 'umd',
			exports: 'named',
			name: 'Stats',
			file: 'build/stats.js',
			indent: '\t'
		},
		{
			format: 'umd',
			exports: 'named',
			name: 'Stats',
			plugins: [
				terser(),
			],
			file: 'build/stats.min.js',
		},
		{
			format: 'esm',
			exports: 'named',
			file: 'build/stats.module.js',
		}
	]
};
