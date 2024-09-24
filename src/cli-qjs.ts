import type * as stdType from "std"

/* THIS FILE SHOULD BE RUN IN THE QUICK-JS ENVIRONMENT */

/** **NOTE `std` lib should be EXPLICITLY imported**
 * 
 * - For running in the QuickJS environment, add a `--std` flag
 * 
 * - esbuild would not compile `import std from "std"` to the top of the file. qjsc cannot recognize this.
 */
const std =  (globalThis as any).std as typeof stdType;

import { parseArgs, executeFile } from "./cli-utils";

function readFile(path: string): Promise<string> {
    try {
        const fileHandle = std.open(path, 'r');
        if(!fileHandle) return Promise.reject(`Cannot open file "${path}" for reading`);

        const text = fileHandle.readAsString();
        fileHandle.close();
        return Promise.resolve(text);
    } catch (err) {
        return Promise.reject(String(err));
    }
}

if(!std) console.log("Error: stdin & stdout lib not found in QuickJS.\nPlease pass \"--std\" to qjs.");
else {
    const args = parseArgs(scriptArgs, "qjs");

    // Function to read from stdin synchronously in QuickJS
    const inputDevice = async () => {
        std.out.puts('Please enter a number > ');
        std.out.flush();
        const answer = std.in.getline();
        return parseInt(answer.trim());
    };

    // Function to print output in the specified format
    const outputDevice = async (value: number) => {
        console.log(`(0x${value.toString(16).padStart(Math.ceil(args.args.bits / 4), "0")}, ${value.toString(10)}, 0b${value.toString(2).padStart(args.args.bits, "0")}, CHAR: "${String.fromCharCode(value)}")\n`);
    };

    if(!args.status) std.exit(1);
    executeFile(args, inputDevice, outputDevice, readFile, std.exit);
}
