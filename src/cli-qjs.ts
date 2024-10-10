import type * as stdType from "std"

/* THIS FILE SHOULD BE RUN IN THE QUICK-JS ENVIRONMENT */

/** **NOTE `std` lib should be EXPLICITLY imported**
 * 
 * - For running in the QuickJS environment, add a `--std` flag
 * 
 * - esbuild would not compile `import std from "std"` to the top of the file. qjsc cannot recognize this.
 */
const std = (globalThis as any).std as typeof stdType;

import { parseArgs, interpretFile, compileFile, runFile } from "./cli-utils";
import { TextDecoder, TextEncoder } from "./polyfill-text-encoding-api";

(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;

function readFile(path: string): Promise<string> {
    try {
        const fileHandle = std.open(path, 'r');
        if (!fileHandle) return Promise.reject(`Cannot open file "${path}" for reading`);

        const text = fileHandle.readAsString();
        fileHandle.close();
        return Promise.resolve(text);
    } catch (err) {
        return Promise.reject(String(err));
    }
}

function readFileBin(path: string): Promise<Uint8Array> {
    try {
        const fileHandle = std.open(path, 'r');
        if (!fileHandle) return Promise.reject(`Cannot open file "${path}" for reading`);
        fileHandle.seek(0, std.SEEK_END);
        const size = fileHandle.tell();

        const buffer = new ArrayBuffer(size);
        fileHandle.seek(0, std.SEEK_SET);
        fileHandle.read(buffer, 0, size);
        fileHandle.close();
        return Promise.resolve(new Uint8Array(buffer));
    } catch (err) {
        return Promise.reject(String(err));
    }
}

function writeFileBin(path: string, data: Uint8Array): Promise<void> {
    try {
        const fileHandle = std.open(path, 'w');
        if (!fileHandle) return Promise.reject(`Cannot open file "${path}" for writing`);

        fileHandle.seek(0, std.SEEK_SET);
        fileHandle.write(data.buffer, 0, data.byteLength);
        fileHandle.close();
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(String(err));
    }
}




if (!std) console.log("Error: stdin & stdout lib not found in QuickJS.\nPlease pass \"--std\" to qjs.");
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

    if (!args.status) std.exit(1);
    if (args.args.interpret) interpretFile(args, inputDevice, outputDevice, readFile, std.exit);
    if (args.args.assemble) compileFile(args, readFile, writeFileBin, std.exit);
    if (args.args.run) runFile(args, inputDevice, outputDevice, readFileBin, std.exit);
}
