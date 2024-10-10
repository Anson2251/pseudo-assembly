import fs from 'fs/promises';
import readline from 'readline/promises';
import { parseArgs, interpretFile, runFile, compileFile } from "./cli-utils";

// Function to read from stdin synchronously in QuickJS
const inputDevice = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return parseInt(await rl.question('Please enter a number > '));
};

// Function to print output in the specified format
const outputDevice = async (value: number) => {
    console.log(`(0x${value.toString(16).padStart(Math.ceil(args.args.bits / 4), "0")}, ${value.toString(10)}, 0b${value.toString(2).padStart(args.args.bits, "0")}, CHAR: "${String.fromCharCode(value)}")\n`);
};

function readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
}

async function readFileBin(path: string): Promise<Uint8Array> {
    return new Uint8Array(await fs.readFile(path));
}

const args = parseArgs(process.argv, "node");
if(!args.status) process.exit(1);
if(args.args.interpret) interpretFile(args, inputDevice, outputDevice, readFile, process.exit);
if(args.args.assemble) compileFile(args, readFile, fs.writeFile, process.exit);
if(args.args.run) runFile(args, inputDevice, outputDevice, readFileBin, process.exit);
