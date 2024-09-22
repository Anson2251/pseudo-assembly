const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/cli-qjs.ts'],
    bundle: true,
    outfile: 'dist/interpreter-qjs.mjs',
    format: 'esm',
    target: ['es2020'],
    external: ["std"],  // Add std to the external list
}).catch(() => process.exit(1));
