import { RegisterTypes } from "./register";

import { type intermediateInstructionType, type instructionPieceType, ALL_MNEMONICS} from "./instruction";

/**
 * Assembles the given assembly language code into machine code.
 * 
 * @param code The assembly language code to assemble.
 * @returns The assembled machine code.
 */
export function assembler(code: string) {
    const lines = preprocessCode(code);
    const labels = extractLabels(lines);
    const intermediateCode = parseIntermediateCode(lines);
    const finalCode = generateMachineCode(intermediateCode, labels);

    return finalCode;
}

/**
 * Preprocesses the given assembly language code.
 * 
 * @param code The assembly language code to preprocess.
 * @returns The preprocessed code, split into lines and with comments and excess whitespace removed.
 */
export function preprocessCode(code: string): string[][] {
    return code.trim().replace("\r", "").split("\n")
        .filter(line => line !== "" && line[0] !== ";")  // Ignore empty lines & comment lines
        .map((line) => line.split(";")[0].trim().replace(/\s+/g, " "))  // Remove comments and excess whitespace     
        .map((line) => tokenizeLine(line))
}

/**
 * Tokenizes the given line of assembly language code into an array of at most 3 strings.
 * 
 * @param line The line of assembly language code to tokenize.
 * @returns An array of strings, where the first element is the mnemonic, the second element is the operand, and the third element is the comment. If the line does not contain a comment, the third element is an empty string. If the line does not contain an operand, the second element is an empty string.
 */
export function tokenizeLine(line: string): string[] {
    const tokens = line.split(" ").map(token => token.trim());
    return tokens.length > 3 ? tokens.slice(0, 3) : tokens.concat(Array(3 - tokens.length).fill(""));
}

/**
 * Extracts labels from the given assembly language code.
 * 
 * @param lines The preprocessed assembly language code.
 * @returns An array of labels extracted from the code.
 */
export function extractLabels(lines: string[][]): string[] {
    const labels: string[] = [];

    lines.forEach((line) => {
        if (isLabel(line[0])) {
            const label = line[0].slice(0, -1);
            labels.push(label); // Each instruction is 2 bytes (opcode & operand)
        }
    });

    return labels;
}

/**
 * Checks if the given token is a label.
 * 
 * A label is a token that consists only of letters (a-z or A-Z), and is followed by a colon (:).
 * 
 * @param token The token to check.
 * @returns True if the token is a label, false otherwise.
 */
function isLabel(token: string): boolean {
    return /^[a-zA-Z]+:$/.test(token);
}

/**
 * Parses the given assembly language code into an array of intermediate instructions.
 * 
 * Each intermediate instruction is an object with three properties: "label", "opcode", and "operand".
 * 
 * - `label` property is the label associated with the instruction
 * - `opcode` property is the opcode of the instruction
 * - `operand` property is the operand of the instruction
 * 
 * @param lines The preprocessed assembly language code.
 * @returns An array of intermediate instructions.
 */
function parseIntermediateCode(lines: string[][]): intermediateInstructionType[] {
    const intermediateCode: intermediateInstructionType[] = [];

    let haveEnd = false;

    for (const line of lines) {
        if (!isLabel(line[0])) {
            line.unshift("");  // If no label, add an empty string to keep line structure consistent
        }

        if(line[1][0] === "#" || line[1][0] === "&" || line[1][0] === "B"){ // handle values appearing alone
            line[2] = line[1]
            line[1] = "";
        }

        const instruction: intermediateInstructionType = {
            label: line[0],
            opcode: resolveOpcode(line[1], line[2]),
            operand: parseOperand(line[2])
        };

        intermediateCode.push(instruction);

        if(line[1] === "END") {
            haveEnd = true;
        }
    }

    if(!haveEnd) {
        throw new Error("Missing END instruction");
    }

    return intermediateCode;
}

    /**
     * Retrieves the address of the given label in the intermediate code.
     *
     * The address is the number of bytes from the start of the program to the label.
     * 
     * An error will be thrown if the label is not found in the intermediate code.
     *
     * @throws Error if the label is not found in the intermediate code.
     * @param intermediateCode The intermediate code to search for the label in.
     * @param label The label to search for.
     * @returns The address of the label in the intermediate code.
     */
function getLabelAddress(intermediateCode: intermediateInstructionType[], label: string): number {
    let addr = 0;
    
    for(let i = 0; i < intermediateCode.length; i++) {
        if(intermediateCode[i].label.slice(0, -1) === label) {
            return addr;
        }

        // for a value, add 1; for an instruction, add 2
        if(intermediateCode[i].opcode === "") { 
            addr += 1;
        } else {
            addr += 2;
        }
    }

    throw new Error(`Cannot retrieve the address of label ${label}`);
}

/**
 * Resolves the given opcode into its full form.
 * 
 * Abbreviated opcodes (CMP, ADD, SUB) are resolved based on the presence of a value prefix
 * in the operand. If the operand contains a value prefix (B, #, &), the opcode is in its
 * immediate form. Otherwise, it is in its address form.
 * 
 * `LDR ACC` instructions are also resolved to `LDR_ACC` command. 
 * 
 * All other opcodes are returned unchanged.
 * 
 * @param opcode The opcode to resolve.
 * @param operand The operand associated with the opcode.
 * @returns The resolved opcode.
 */
function resolveOpcode(opcode: string, operand: string): string {
    if(opcode === "LDR" && operand === "ACC") return "LDR_ACC"
    const abbreviated = ["CMP", "ADD", "SUB", "AND", "OR", "XOR"];
    const valuePrefix = ["B", "#", "&"];

    if (abbreviated.includes(opcode)) {
        return valuePrefix.includes(operand[0]) ? `${opcode}_IMMEDIATE` : `${opcode}_ADDRESS`;
    }

    return opcode;
}

/**
 * Parses the given operand string into a number or label.
 * 
 * If the operand string contains a value prefix (B, #, &), the operand is interpreted
 * as a number in the given base.
 * 
 * If the operand string is a register name, the register's index is returned.
 * 
 * Otherwise, the operand is returned as a string, which may be a label that will be
 * resolved later.
 * 
 * @param operand The operand string to parse.
 * @returns The parsed operand, which may be a number or a string.
 */
function parseOperand(operand: string): number | string {
    if (RegisterTypes.includes(operand)) {
        return RegisterTypes.indexOf(operand);
    }

    const valuePrefix = { "#": 10, "&": 16, "B": 2 };

    if (!operand) return 0;  // Default operand is 0

    const prefix = operand[0];
    if (Object.keys(valuePrefix).includes(prefix)) {
        return parseInt((operand.slice(1) || "0"), valuePrefix[prefix as keyof typeof valuePrefix]);
    }

    return operand;  // Operand could be a label, which will be resolved later
}

/**
 * Generates machine code from the given intermediate code and labels.
 * 
 * Replaces opcodes with their full form, and resolves any labels in the operand.
 * 
 * @param intermediateCode The intermediate code to generate machine code for.
 * @param labels The labels and their corresponding instruction indices.
 * @returns The generated machine code.
 */
function generateMachineCode(intermediateCode: intermediateInstructionType[], labels: string[]): instructionPieceType[] {
    const labelMap = labels.map(label => ({ label, index: getLabelAddress(intermediateCode, label) }))
        .reduce((acc, label) => {
            acc[label.label] = label.index;
            return acc;
        }, {} as Record<string, number>);
    
    return intermediateCode.map(instruction => {
        const newInstruction: instructionPieceType = {
            opcode: resolveMnemonic(instruction.opcode),
            operand: resolveOperand(instruction.operand, labelMap)
        };
        return newInstruction;
    });
}

/**
 * Resolves the given opcode string into its corresponding machine code value.
 * 
 * If the opcode is found in the ALL_MNEMONICS object, its corresponding machine code value is returned.
 * Otherwise, `0xFF` is returned to indicate an invalid opcode.
 * 
 * @param opcode The opcode string to resolve.
 * @returns The resolved machine code value.
 */
function resolveMnemonic(opcode: string): number {
    if(opcode === "") return 0xFF;
    const code = ALL_MNEMONICS[opcode as keyof typeof ALL_MNEMONICS];
    if(code !== undefined) return code;
    else throw new Error(`Invalid opcode ${opcode}`);
}

/**
 * Resolves the given operand, which may be a string or a number, into a machine code value.
 * 
 * @param operand The operand to resolve, which may be a string or a number.
 * @param labelMap The label map to look up string operands in.
 * @returns The resolved machine code value.
 */
function resolveOperand(operand: string | number, labelMap: Record<string, number>): number {
    if (typeof operand === "string") {
        if (labelMap[operand] !== undefined) {
            return labelMap[operand];
        } else {
            throw new Error(`Label ${operand} not found`);
        }
    }

    if (typeof operand === "number") {
        return operand;
    }

    throw new Error(`Invalid operand ${operand}`);
}


export default assembler;
