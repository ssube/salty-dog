import { build } from 'esbuild';
import IgnorePlugin from 'esbuild-plugin-ignore';
import { join } from 'path';

const root = process.cwd();

build({
    bundle: true,
    entryPoints: [
        join(root, 'out/src/index.js'),
    ],
    format: 'cjs',
    keepNames: true,
    outdir: 'out/bundle/',
    outExtension: {
        '.js': '.cjs',
    },
    platform: 'node',
    plugins: [
        IgnorePlugin([{
            resourceRegExp: /(dtrace-provider|ink|mv|node-fetch)/,
            contextRegExp: /node_modules/,
        }]),
    ],
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
