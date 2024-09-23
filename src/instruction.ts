export type instructionPieceType = {
    opcode: number,
    operand: number
}

export type intermediateInstructionType = {
    label: string,
    opcode: string,
    operand: string | number
}


// instruction codes <4-bit classification code><4-bit instruction code>
// Mnemonic for data move 
export const MNEMONIC_DATA_MOVE = {
    "LDM": 0x00,  // Load the number into ACC (immediate addressing)
    "LDD": 0x01,  // Load the contents of the specified address into ACC (direct/absolute addressing)
    "LDI": 0x02,  // Load the contents of the contents of the given address into ACC (indirect addressing)
    "LDX": 0x03,  // Load the contents of the calculated address into ACC (indexed addressing)
    "LDR": 0x04,  // Load the number n into IX (immediate addressing is used)
    "MOV": 0x05,  // Move the contents of a register to IX
    "STO": 0x06,  // Store the contents of ACC into the specified address (direct/absolute addressing)
    "LDR_ACC": 0x07   // Load the number in the accumulator into IX
};

// Mnemonic for IO
export const MNEMONIC_IO = {
    "IN": 0x10,   // Key in a character and store its ASCII value in ACC
    "OUT": 0x11   // Output to the screen the character whose ASCII value is stored in ACC
};

// Mnemonic for arithmetic
export const MNEMONIC_ARITHMETIC = {
    "ADD_ADDRESS": 0x20,    // Add the contents of the specified address to ACC (direct/absolute addressing)
    "ADD_IMMEDIATE": 0x21,  // Add the denary number n to ACC (immediate addressing)
    "SUB_ADDRESS": 0x22,    // Subtract the contents of the specified address from ACC
    "SUB_IMMEDIATE": 0x23,  // Subtract the number n from ACC (immediate addressing)
    "INC": 0x24,            // Add 1 to the contents of the register (ACC or IX)
    "DEC": 0x25             // Subtract 1 from the contents of the register (ACC or IX)
};

// Mnemonic for branching
export const MNEMONIC_BRANCHING = {
    "JMP": 0x30,  // Jump to the specified address
    "JPE": 0x31,  // Jump to the specified address if comparison is True
    "JPN": 0x32,  // Jump to the specified address if comparison is False
    "END": 0x33,  // Return control to the operating system
    "JMR": 0x34   // Jump to the address (relative)
};

// Mnemonic for comparison
export const MNEMONIC_COMPARE = {
    "CMP_ADDRESS": 0x40,    // Compare ACC with contents of the specified address (direct/absolute addressing)
    "CMP_IMMEDIATE": 0x41,  // Compare ACC with the number n (immediate addressing)
    "CMI": 0x42             // Compare ACC with contents of the contents of the specified address (indirect addressing)
};

export const MNEMONIC_BINARY_SHIFT = {
    "LSL": 0x51, // Logical left-shift the contents of ACC by n places
    "LSR": 0x52, // Logical right-shift the contents of ACC by n places
    "ASR": 0x53,  // Arithmetic right-shift the contents of ACC by n places
    "CSL": 0x54, // Circular left-shift the contents of ACC by n places
    "CSR": 0x55  // Circular right-shift the contents of ACC by n places
}

export const MNEMONIC_BIT_MANIPULATION = {
    "AND_IMMEDIATE": 0x60,  // AND the contents of ACC with the number n
    "AND_ADDRESS": 0x61,    // AND the contents of ACC with the contents of the specified address
    "OR_IMMEDIATE": 0x62,   // OR the contents of ACC with the number n
    "OR_ADDRESS": 0x63,     // OR the contents of ACC with the contents of the specified address
    "XOR_IMMEDIATE": 0x64,  // XOR the contents of ACC with the number n
    "XOR_ADDRESS": 0x65,    // XOR the contents of ACC with the contents of the specified address
    "NOT": 0x66             // NOT the contents of ACC
}

export const ALL_MNEMONICS = {
    ...MNEMONIC_DATA_MOVE,
    ...MNEMONIC_IO,
    ...MNEMONIC_ARITHMETIC,
    ...MNEMONIC_BRANCHING,
    ...MNEMONIC_COMPARE,
    ...MNEMONIC_BINARY_SHIFT,
    ...MNEMONIC_BIT_MANIPULATION
}

export function lookUpMnemonic(opcode: number) {
    return Object.keys(ALL_MNEMONICS).find((key) => (ALL_MNEMONICS as any)[key] === opcode) || "UNKNOWN";
}

export default ALL_MNEMONICS;
