const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/cli-node.ts'],
    bundle: true,
    outfile: 'dist/interpreter-node.cjs',
    platform: 'node',
    target: ['node16'],
    external: ["readline/promises", "fs/promises"],  // Add std to the external list
}).catch(() => process.exit(1));
