import interpreter from "./interpreter";

(globalThis as any).compiledEnvironment = (globalThis as any).compiledEnvironment ? true : false;

interface cliArgs {
    status: boolean;
    args: {
        file: string;
        bits: number;
        verbose: boolean;
    }
}

const executedCommand = (argv: string[], platform: string) => {
    const name = lastName(argv[0]);
    if((globalThis as any).compiledEnvironment) return lastName(argv[0]);
    if(name === "node") return `node ${lastName(argv[1])}`;
    if(name === "qjs" || name === "quickjs") return `${name} --std ${lastName(argv[1])}`;

    return platform;
}

export const helpMsg = (argv: string[], platform: string) => `
Usage: ${executedCommand(argv, platform)} [options] -r <file>

Options:
  -r, --run <file>    The file to run
  -b, --bits <number> The number of bits to use for VM
  -v, --verbose       Enables verbose mode
  -h, --help          Prints this message
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
            verbose: false
        }
    }

    if (args.length === 0) {
        console.log(help);
        return parsed;
    }


    for(let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-r' || arg === '--run') {
            parsed.args.file = args[i + 1];
        } else if (arg === '-b' || arg === '--bits') {
            parsed.args.bits = parseInt(args[i + 1]);
        } else if (arg === '-v' || arg === '--verbose') {
            parsed.args.verbose = true;
        } else if (arg === '-h' || arg === '--help') {
            console.log(help);
            return parsed;
        }
    };

    if (parsed.args.file === "") {
        console.log('Error: No file specified.\n');
        return parsed;
    }

    if (parsed.args.bits < 8) {
        console.log('Error: Bits must be greater than 8.\n');
        return parsed;
    }

    parsed.status = true;

    return parsed;
}

export async function executeFile(args: cliArgs, inputDevice: () => Promise<number>, outputDevice: (value: number) => Promise<void>, readFile: (file: string) => Promise<string>, quit: (code: number) => void) {
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