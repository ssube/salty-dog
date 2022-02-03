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
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
