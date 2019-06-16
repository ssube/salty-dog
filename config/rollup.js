import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const metadata = require('../package.json');

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
		json(),
		replace({
			delimiters: ['{{ ', ' }}'],
			values: {
				APP_NAME: metadata.name,
				BUILD_JOB: process.env['CI_JOB_ID'],
				BUILD_RUNNER: process.env['CI_ENVIRONMENT_SLUG'],
				GIT_BRANCH: process.env['CI_COMMIT_REF_SLUG'],
				GIT_COMMIT: process.env['CI_COMMIT_SHA'],
				NODE_VERSION: process.env['NODE_VERSION'],
			},
		}),
		resolve({
			preferBuiltins: true,
		}),
		commonjs({
			namedExports: {
				'node_modules/lodash/lodash.js': ['intersection', 'isNil', 'isString'],
				'node_modules/noicejs/out/main-bundle.js': ['BaseError'],
				'node_modules/js-yaml/index.js': [
					'DEFAULT_SAFE_SCHEMA',
					'SAFE_SCHEMA',
					'safeDump',
					'safeLoad',
					'Schema',
					'Type',
				],
				'node_modules/yargs-parser/index.js': ['detailed'],
			},
		}),
    typescript({
			cacheRoot: 'out/cache/rts2',
			rollupCommonJSResolveHack: true,
		}),
	],
};