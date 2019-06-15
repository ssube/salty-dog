
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/index.ts',
	output: {
		file: 'out/bundle.js',
		format: 'cjs',
		sourcemap: true,
	},
	plugins: [
		resolve({
			preferBuiltins: true,
		}),
		commonjs({
			namedExports: {
				'node_modules/lodash/lodash.js': ['isNil', 'isString'],
				'node_modules/noicejs/out/main-bundle.js': ['BaseError'],
				'node_modules/js-yaml/index.js': ['DEFAULT_SAFE_SCHEMA', 'SAFE_SCHEMA', 'safeLoad', 'Schema', 'Type'],
				'node_modules/yargs-parser/index.js': ['detailed'],
			},
		}),
    typescript({
			cacheRoot: 'out/cache/rts2',
			rollupCommonJSResolveHack: true,
		}),
	],
};