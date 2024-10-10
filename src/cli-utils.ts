import interpreter from "./interpreter";
import { Executable } from "./executable";

(globalThis as any).compiledEnvironment = (globalThis as any).compiledEnvironment ? true : false;

interface cliArgs {
    status: boolean;
    args: {
        file: string;
        bits: number;
        verbose: boolean;
        run: boolean;
        interpret: boolean;
        assemble: boolean;
        outFile: string;
    }
}

const executedCommand = (argv: string[], platform: string) => {
    const name = lastName(argv[0]);
    if ((globalThis as any).compiledEnvironment) return lastName(argv[0]);
    if (name === "node") return `node ${lastName(argv[1])}`;
    if (name === "qjs" || name === "quickjs") return `${name} --std ${lastName(argv[1])}`;

    return platform;
}

export const helpMsg = (argv: string[], platform: string) => `
Usage: ${executedCommand(argv, platform)} [options] -r <file>

Options:
  -i, --interpret <file>  To interpret the file
  -a, --assemble <file>   To assemble the given file into the binary version (only 8-bit & 16-bit is supported)
  -r, --run <file>        To run the given binary file
  -o, --out <file>        To specify the output file
  -b, --bits <number>     To specify the number of bits to use for VM (integer, default: 8, and should be greater or equal to 8)
  -v, --verbose           To enable verbose mode
  -h, --help              To print this message
`.trim();

function lastName(str: string) {
    return str.replace(/.*\//, "").split('/').pop() || "";
}

export function parseArgs(args: string[], platform: string): cliArgs {
    const help = helpMsg(args, platform)
    args = (platform === "node" ? args.slice(1) : args).slice(1);
    const parsed: cliArgs = {
        status: false,
        args: {
            file: "",
            bits: 8,
            verbose: false,
            run: false,
            interpret: false,
            assemble: false,
            outFile: ""
        }
    }

    if (args.length === 0) {
        console.log(help);
        return parsed;
    }


    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-r' || arg === '--run') {
            parsed.args.file = (!args[i + 1].startsWith("-") ? args[i + 1] : "");
            parsed.args.run = true;
        } else if (arg === '-a' || arg === '--assemble') {
            parsed.args.file = (!args[i + 1].startsWith("-") ? args[i + 1] : "");
            parsed.args.assemble = true;
        } else if (arg === '-i' || arg === '--interpret') {
            parsed.args.file = (!args[i + 1].startsWith("-") ? args[i + 1] : "");
            parsed.args.interpret = true;
        } else if (arg === '-b' || arg === '--bits') {
            parsed.args.bits = (!args[i + 1].startsWith("-") ? parseInt(args[i + 1]) : 0);
        } else if (arg === '-v' || arg === '--verbose') {
            parsed.args.verbose = true;
        } else if(arg === '-o' || arg === '--out') {
            parsed.args.outFile = (!args[i + 1].startsWith("-") ? args[i + 1] : "");
        } else if (arg === '-h' || arg === '--help') {
            console.log(help);
            return parsed;
        }
    };

    let processCount = 0
    processCount += parsed.args.run ? 1 : 0;
    processCount += parsed.args.assemble ? 1 : 0;
    processCount += parsed.args.interpret ? 1 : 0;

    if(processCount > 1) {
        console.log("Only one of the following can be specified: (-r, --run), (-a, --assemble), (-i, --interpret)");
        return parsed;
    }

    if(processCount === 0) {
        console.log("One of the following must be specified: (-r, --run), (-a, --assemble), (-i, --interpret)");
        return parsed;
    }

    if ((parsed.args.file || "") === "") {
        console.log('Error: No input file specified.\n');
        return parsed;
    }

    if(parsed.args.assemble && (parsed.args.outFile || "") === "") {
        console.log('Error: No output file specified.\n');
        return parsed;
    }

    if (parsed.args.bits < 8) {
        console.log('Error: Bits must be set with flag and be greater or equal to 8.\n');
        return parsed;
    }

    parsed.status = true;

    return parsed;
}

export async function interpretFile(args: cliArgs, inputDevice: () => Promise<number>, outputDevice: (value: number) => Promise<void>, readFile: (file: string) => Promise<string>, quit: (code: number) => void) {
    readFile(args.args.file).then(async (code) => {
        try {
            const instance = new interpreter(args.args.bits);
            instance.setVerbose(args.args.verbose);
            instance.addHandler("input", inputDevice);
            instance.addHandler("output", outputDevice);

            const startTime = (new Date()).getTime();
            await instance.interpret(code);
            console.log(`Time taken: ${(new Date()).getTime() - startTime}ms`);

            quit(0);
        }
        catch (err) {
            console.log(`Error: ${err}`);
            quit(1);
        }
    })
        .catch((err) => {
            console.log(`Error: ${err}`);
            quit(1);
        });
}

export async function runFile(args: cliArgs, inputDevice: () => Promise<number>, outputDevice: (value: number) => Promise<void>, readFile: (file: string) => Promise<Uint8Array>, quit: (code: number) => void) {
    const executable = new Executable();
    try {
        await executable.load(args.args.file, readFile);
        const startTime = (new Date()).getTime();
        await executable.execute(inputDevice, outputDevice);
        console.log(`Time taken: ${(new Date()).getTime() - startTime}ms`);
        quit(0);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        quit(1);
    }
}

export async function compileFile(args: cliArgs, readFile: (file: string) => Promise<string>, writeFile: (file: string, data: Uint8Array) => Promise<void>, quit: (code: number) => void) {
    try{
        const code = await readFile(args.args.file);
        await (new Executable()).assemble(code).store(args.args.outFile, args.args.bits, writeFile);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        quit(1);
    }
    quit(0);
}