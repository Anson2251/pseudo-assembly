import type * as stdType from "std"

/* THIS FILE SHOULD BE RUN IN THE QUICK-JS ENVIRONMENT */

/** **NOTE `std` lib should be EXPLICITLY imported**
 * 
 * - For running in the QuickJS environment, add a `--std` flag
 * 
 * - For compiling to an executable via `qjsc`, add a line "`import * as std from 'std';`" 
 *   at the beginning and mount the `std` lib to the `globalThis`
 * 
 * - To avoid tsc import std lib as a dependency, it assumes the `std` lib is already imported
 */
const std =  (globalThis as any).std as typeof stdType;

import interpreter from './interpreter';

// Function to read from stdin synchronously in QuickJS
const inputDevice = async () => {
    std.out.puts('Please enter your input: ');
    std.out.flush();
    const answer = std.in.getline();
    return parseInt(answer.trim());
};

// Function to print output in the specified format
const outputDevice = async (value: number) => {
    console.log(`(0x${value.toString(16).padStart(Math.ceil(bits / 4), "0")}, ${value.toString(10)}, 0b${value.toString(2).padStart(bits, "0")}, CHAR: "${String.fromCharCode(value)}")\n`);
};

const helpMsg = `
Usage: ${scriptArgs[0].replace("\\", "/").split('/').pop()} [options] -r <file>

Options:
  -r, --run <file>    The file to run
  -b, --bits <number> The number of bits to use for VM
  -v, --verbose       Enables verbose mode
  -h, --help          Prints this message
`.trim();

interface cliArgs {
    file: string;
    bits: number;
    verbose: boolean;
}

function parseArgs(args: string[]): cliArgs {
    if(args.length === 0){
        console.log(helpMsg);
        std.exit(0);
    }
    const parsed: cliArgs = {
        file : "",
        bits : 8,
        verbose : false
    }

    args.forEach((arg, i) => {
        if (arg === '-r' || arg === '--run') {
            parsed.file = args[i+1];
        } else if (arg === '-b' || arg === '--bits') {
            parsed.bits = parseInt(args[i+1]);
        } else if (arg === '-v' || arg === '--verbose') {
            parsed.verbose = true;
        } else if (arg === '-h' || arg === '--help') {
            console.log(helpMsg);
            std.exit(0);
        }
    });
    
    if (parsed.file === "") {
        console.log('Error: No file specified.\n');
        std.exit(1);
    }

    if (parsed.bits < 8){
        console.log('Error: Bits must be greater than 8.\n');
        std.exit(1);
    }

    return parsed;
}

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

const { file, bits, verbose } = parseArgs(scriptArgs.slice(1));

readFile(file)
    .then(async (code) => {
        const instance = new interpreter(bits);
        instance.setVerbose(verbose);
        instance.addHandler("input", inputDevice);
        instance.addHandler("output", outputDevice);

        const startTime = (new Date()).getTime();
        await instance.interpret(code);
        console.log(`Time taken: ${(new Date()).getTime() - startTime}ms`);
        std.exit(0);
    })
    .catch((err) => {
        console.log(`Error: ${err}\n`);
        std.exit(1);
    })

