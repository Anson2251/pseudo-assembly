import assembler from "./assembler";
import interpreter from "./interpreter";
import { type InstructionPieceType } from "./instruction";

export const FILE_FORMAT_VERSION = "1.0.1";
const VERSION_FIELD_SIZE = 8;
const DATE_FIELD_SIZE = 24;
const BITS_FIELD_SIZE = 2;
const NAME_FIELD_SIZE = 64;

function generateFile(
    instructions: InstructionPieceType[],
    originalName: string,
    bits: 8 | 16,
): Uint8Array {
    if (bits !== 8 && bits !== 16) throw new Error("Unsupported bit size, must be 8 or 16");
    const encoder = new TextEncoder();

    const dateBytes = encoder.encode(new Date().toISOString().substring(0, DATE_FIELD_SIZE));
    const versionBytes = encoder.encode(FILE_FORMAT_VERSION);
    const bitBytes = encoder.encode(bits.toString().substring(0, BITS_FIELD_SIZE));
    const nameBytes = encoder.encode(originalName.substring(0, NAME_FIELD_SIZE));

    const headerSize = NAME_FIELD_SIZE + DATE_FIELD_SIZE + BITS_FIELD_SIZE + VERSION_FIELD_SIZE + 4;

    const headerBuffer = new Uint8Array(headerSize);
    headerBuffer.set(versionBytes, 0);
    headerBuffer.set(bitBytes, VERSION_FIELD_SIZE);
    headerBuffer.set(dateBytes, VERSION_FIELD_SIZE + BITS_FIELD_SIZE);
    headerBuffer.set(nameBytes, VERSION_FIELD_SIZE + DATE_FIELD_SIZE + BITS_FIELD_SIZE);

    // Prepare the body for the instructions
    const byteNumber = bits / 8;  // Number of bytes to store the instruction
    const bodyBuffer = new Uint8Array(instructions.length * byteNumber * 2);
    const view = new DataView(bodyBuffer.buffer)

    const operator = bits === 8 ? "setUint8" : "setUint16";

    instructions.forEach((instruction, i) => {
        const offset = i * byteNumber * 2;
        view[operator](offset, instruction.opcode, false);
        view[operator](offset + byteNumber, instruction.operand, false);
    });
    
    const fileBuffer = new Uint8Array(headerBuffer.length + bodyBuffer.length);
    fileBuffer.set(headerBuffer, 0);
    fileBuffer.set(bodyBuffer, headerBuffer.length);

    return fileBuffer;
}


function parseFile(fileBuffer: Uint8Array): {
    originalName: string;
    date: string;
    bits: 8 | 16;
    instructions: InstructionPieceType[];
} {
    const decoder = new TextDecoder();

    const version = String(decoder.decode(fileBuffer.slice(0, VERSION_FIELD_SIZE).slice(0, FILE_FORMAT_VERSION.length)).trim());
    if (version !== FILE_FORMAT_VERSION) {
        throw new Error(`Unsupported file format version: "${version}". Expected: "${FILE_FORMAT_VERSION}"`);
    }

    const bits = parseInt(decoder.decode(fileBuffer.slice(VERSION_FIELD_SIZE, VERSION_FIELD_SIZE + BITS_FIELD_SIZE)).trim()) as 8 | 16;
    const date = decoder.decode(fileBuffer.slice(VERSION_FIELD_SIZE + DATE_FIELD_SIZE + BITS_FIELD_SIZE, VERSION_FIELD_SIZE + DATE_FIELD_SIZE + BITS_FIELD_SIZE + NAME_FIELD_SIZE)).trim();
    const name = decoder.decode(fileBuffer.slice(VERSION_FIELD_SIZE + DATE_FIELD_SIZE + BITS_FIELD_SIZE + NAME_FIELD_SIZE, fileBuffer.length)).trim();

    const byteSize = bits / 8;
    const instructions: InstructionPieceType[] = [];

    // Body starts after the header
    const bodyStart = VERSION_FIELD_SIZE + DATE_FIELD_SIZE + BITS_FIELD_SIZE + NAME_FIELD_SIZE + 4;  // Account for header fields

    const operator = bits === 8 ? "getUint8" : "getUint16";
    const view = new DataView(fileBuffer.buffer);
    for (let i = bodyStart; i < fileBuffer.length; i += byteSize * 2) {
        const opcode = view[operator](i, false);
        const operand = view[operator](i + byteSize, false);
        instructions.push({ opcode, operand });
    }

    return { originalName: name, date, bits, instructions };
}

export class Executable {
    instructions: InstructionPieceType[];
    bits: number;
    originalName: string;
    generationDate: string;
    constructor() {
        this.instructions = [];
        this.bits = 8;
        this.originalName = "";
        this.generationDate = "";
    }

    async load(path: string, readFile: (path: string) => Promise<Uint8Array>) {
        const data = parseFile(await readFile(path));
        this.bits = data.bits;
        this.generationDate = data.date;
        this.originalName = data.originalName;
        this.instructions = data.instructions;

        return this;
    }

    assemble(code: string) {
        this.instructions = assembler(code);
        return this;
    }

    async store(path: string, bits: number, writeFile: (path: string, data: Uint8Array) => Promise<void>) {
        if(bits !== 8 && bits !== 16) throw new Error(`Unsupported bits: ${bits}`);
        await writeFile(path, generateFile(this.instructions, path.replace("\\", "/").split('/').pop() || "", bits));
    }

    async execute(inputDevice: () => Promise<number>, outputDevice: (value: number) => Promise<void>) {
        const instance = new interpreter(this.bits);
        instance.setVerbose(false);
        instance.addHandler("input", inputDevice);
        instance.addHandler("output", outputDevice);
        await instance.execute(this.instructions);
    }
}