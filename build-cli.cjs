const esbuild = require('esbuild');
const argv = process.argv;

const helpMsg = `
Usage: node ${argv[1].replace("\\", "/").split("/").pop()} [options] -t <target>

Options:
  -t, --target <node|qjs>  The target to build.
  -h, --help               Prints this message.
`.trim();

if(argv.length < 3) {
    console.log(helpMsg);
    process.exit(0);
}

if(argv.includes("--help") || argv.includes("-h")) {
    console.log(helpMsg);
    process.exit(0);
}

let target = 0;

for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "-t" || argv[i] === "--target") {
        target = argv[i + 1];
    }
}

if (target === "qjs") {
    esbuild.build({
        entryPoints: ['src/cli-qjs.ts'],
        bundle: true,
        minify: true,
        outfile: 'dist/interpreter-qjs.mjs',
        format: 'esm',
        target: ['es2020'],
        external: ["std"],  // Add std to the external list
    }).catch(() => process.exit(1));
}
else if (target === "node") {
    const esbuild = require('esbuild');

    esbuild.build({
        entryPoints: ['src/cli-node.ts'],
        bundle: true,
        minify: true,
        outfile: 'dist/interpreter-node.cjs',
        platform: 'node',
        target: ['node16'],
        external: ["readline/promises", "fs/promises"],  // Add std to the external list
    }).catch(() => process.exit(1));
}
else {
    console.log("Error: Invalid target specified. (Must be 'qjs' or 'node')");
    process.exit(1);
}
