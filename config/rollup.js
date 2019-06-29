import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import multiEntry from "rollup-plugin-multi-entry";
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const metadata = require('../package.json');

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const bundle = {
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
				APP_VERSION: metadata.version,
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
				'node_modules/chai/index.js': [
					'expect',
				],
				'node_modules/deep-diff/index.js': [
					'applyDiff',
					'diff',
				],
				'node_modules/lodash/lodash.js': [
					'cloneDeep',
					'intersection',
					'isNil',
					'isString',
				],
				'node_modules/noicejs/out/main-bundle.js': [
					'BaseError',
				],
				'node_modules/js-yaml/index.js': [
					'DEFAULT_SAFE_SCHEMA',
					'SAFE_SCHEMA',
					'safeDump',
					'safeLoad',
					'safeLoadAll',
					'Schema',
					'Type',
				],
				'node_modules/yargs/index.js': [
					'usage',
				],
			},
		}),
    typescript({
			cacheRoot: 'out/cache/rts2',
			rollupCommonJSResolveHack: true,
		}),
	],
};

export default [
	bundle,
	{
		...bundle,
		input: [
      'test/harness.ts',
      'test/**/Test*.ts',
    ],
		output: {
			file: 'out/test.js',
			format: 'cjs',
			sourcemap: true,
		},
		plugins: [
			multiEntry(),
			...bundle.plugins,
		]
	},
];
