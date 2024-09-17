import register, { type RegisterNameType, getRegName } from "./register";
import { type instructionPieceType, lookUpMnemonic, MNEMONIC_DATA_MOVE, MNEMONIC_IO, MNEMONIC_ARITHMETIC, MNEMONIC_BRANCHING, MNEMONIC_COMPARE } from "./instruction";


export const StatusCodes = {
    "C": 0b00000001, // Carry
    "N": 0b00000010, // Negative
    "O": 0b00000100, // Overflow
    "Z": 0b00001000, // Zero
};

export class machine {
    registers: Record<RegisterNameType, register>;
    private bits: number;
    private memory: Record<number, number> = {};
    private end: boolean = true;
    private inputDevice: () => Promise<number>
    private outputDevice: (value: number) => Promise<void>
    verbose: boolean = false
    private sp: {
        /** Carry */
        c: number,
        /** Negative */
        n: number,
        /** Overflow */
        o: number,
        /** Zero */
        z: number
    }
    /**
     * Creates a new machine with the given number of bits.
     * 
     * @param bits The number of bits to use for each register.
     * @throws If the number of bits is less than 8.
     */
    constructor(bits: number = 16) {
        if (bits < 8) {
            throw new Error("Bits must be greater than 8");
        }
        this.registers = {
            "ACC": new register("ACC", bits),
            "IX": new register("IX", bits),
            "CIR": new register("CIR", bits),
            "MAR": new register("MAR", bits),
            "MDR": new register("MDR", bits),
            "PC": new register("PC", bits),
        }
        this.bits = bits;

        this.sp = {
            c: 0,
            n: 0,
            o: 0,
            z: 0
        }

        this.inputDevice = async () => {
            throw new Error("No input device");
        }

        this.outputDevice = async (value: number) => {
            console.log("No output device", value);
        }
    }

    getBits() {
        return this.bits
    }

    /**
     * Adds an input device to the machine.
     * 
     * @param type The type of device to add
     * @param device The device to add (a function returning a Promise of a number).
     */
    addDevice(type: "input", device: () => Promise<number>): void
    /**
     * Adds an output device to the machine.
     * 
     * @param type The type of device to add
     * @param device The device to add (a function that takes a number and returns a Promise of void). 
     */
    addDevice(type: "output", device: (value: number) => Promise<void>): void
    addDevice(type: "input" | "output", device: any) {
        if (type === "input") {
            this.inputDevice = device;
        }
        if (type === "output") {
            this.outputDevice = device;
        }
    }


    /**
     * Sets the value at the given memory address.
     * 
     * Will deal with overflow by taking only the lowest {@link bits} bits of the given value.
     * @param address The address to set the value at.
     * @param value The value to set.
     */
    setMemory(address: number, value: number) {
        let bin = value.toString(2);
        bin = bin.length > this.bits ? bin.slice(-this.bits) : bin.padStart(this.bits, "0");
        value = parseInt(bin, 2); // deal with overflow
        this.memory[address] = value;
    }

    /**
     * Reads the value at the given memory address.
     * 
     * Will return 0 if the address is not in memory.
     * @param address The address to read the value from.
     * @returns The value at the given address, or 0 if it is not in memory.
     */
    readMemory(address: number) {
        return this.memory[address] || 0;
    }

    /**
     * Sets a field in the Status Register.
     * 
     * @param field The field to set.
     * @param value The value to set it to.
     */
    private setStatusRegister(field: keyof typeof this.sp, value: number) {
        this.sp[field] = value;
    }

    /**
     * Checks if the given CMP result is successful.
     *
     * CMP is considered successful if the carry flag is unset, the negative flag is unset, and the zero flag is set **(two given values are equal)**.
     * @returns True if the CMP result is successful.
     */
    private isCMPSuccessful() {
        return this.sp.c === 0 && this.sp.n === 0 && this.sp.z === 1;
    }

    /**
     * Sets the Status Register based on the given value.
     * 
     * Sets the `Carry`, `Negative`, and `Zero` flags based on the given value.
     * 
     * | Value | `Carry` | `Negative` | `Zero` |
     * | --- | --- | --- | --- |
     * | `= 0` | 0 | 0 | 1 |
     * | `< 0` | 1 | 1 | 0 |
     * | `> 0` | 0 | 0 | 0 |
     * 
     * @param value The value to base the Status Register on.
     */
    private setStatusRegisterWithNumber(value: number) {
        if (value === 0) {
            this.setStatusRegister("c", 0);
            this.setStatusRegister("n", 0);
            this.setStatusRegister("z", 1);
        } else if (value < 0) {
            this.setStatusRegister("c", 1);
            this.setStatusRegister("n", 1);
            this.setStatusRegister("z", 0);
        } else if (value > 0) {
            this.setStatusRegister("c", 0);
            this.setStatusRegister("n", 0);
            this.setStatusRegister("z", 0);
        }
    }

    /**
     * Executes the given instructions.
     * 
     * Will execute all instructions in the given array. (Simulate FDE cycle until an `END` instruction is reached.)
     * 
     * @param instructions The instructions to execute, as an array of {@link instructionPieceType} objects.
     */
    async execute(instructions: instructionPieceType[]) {
        let cursor = 0;
        instructions.forEach((instruction) => {
            if (instruction.opcode !== 0xFF) {
                this.storeInstructionInMemory(cursor, instruction);
                cursor += 2;
            }
            else {
                this.setMemory(cursor, instruction.operand)
                cursor += 1;
            }
        })

        this.registers.PC.setVal(0);
        this.end = false;

        while (!this.end) {
            await this.executeInstruction(this.registers.PC.getVal());
            this.logMemoryAndRegisters();
            if (this.verbose) console.log("");
        }
    }

    /**
     * Logs the current state of the memory and registers.
     * 
     * Only logs if {@link verbose} is true.
     */
    logMemoryAndRegisters() {
        if (!this.verbose) return;
        console.log("---MEMORY-BEGIN---")
        Object.keys(this.memory).map(i => parseInt(i)).sort((a, b) => a - b).forEach((index) => {
            console.log(`${index} | 0x${this.memory[index].toString(16).padStart(this.bits / 4, "0")}`);
        });
        console.log("----MEMORY-END----")

        console.log("--REGISTER-BEGIN--")
        Object.keys(this.registers).forEach((key) => {
            console.log(`${key.padStart(3, " ")}: (0x${this.registers[key as RegisterNameType].getVal().toString(16)}, ${this.registers[key as RegisterNameType].getVal().toString(10)}, 0b${this.registers[key as RegisterNameType].getVal().toString(2).padStart(this.bits, "0")})`);
        })
        console.log("---REGISTER-END---")
    }

    /**
     * Stores the given instruction in memory at the given address.
     * 
     * @param address The address to store the instruction at.
     * @param instruction The instruction to store.
     */
    storeInstructionInMemory(address: number, instruction: instructionPieceType) {
        this.memory[address] = instruction.opcode;
        this.memory[address + 1] = instruction.operand;
    }

    /**
     * Fetches the instruction from memory at the given address and decodes it.
     *
     * If {@link verbose} is true, logs the decoded instruction.
     * @param address The address of the instruction to fetch and decode.
     * @returns The decoded instruction.
     */
    private fetchDecodeInstruction(address: number): instructionPieceType {
        if (this.verbose) console.log("Fetching instruction at address", address)
        const decoded: instructionPieceType = {
            opcode: this.memory[address],
            operand: this.memory[address + 1]
        }
        if(decoded.opcode === undefined || decoded.operand === undefined) throw new Error("Fail to fetch instruction at address " + address);
        if (this.verbose) console.log(`Decoded: [OPCODE: ${lookUpMnemonic(decoded.opcode)}(0x${decoded.opcode.toString(16).padStart(2, "0")}), OPERAND:(0x${decoded.operand.toString(16).padStart(this.bits / 4, "0")}, ${decoded.operand.toString(10)}, 0b${decoded.operand.toString(2).padStart(this.bits, "0")})]`)
        return decoded
    }

    /**
     * Executes the instruction at the given address. PC will be incremented by two unless JMP (related) is used
     * 
     * This function is an implementation detail, and should not be used directly.
     * Instead, use the {@link execute} method of the {@link Interpreter} class.
     * 
     * @param address The address of the instruction to execute.
     */
    async executeInstruction(address: number) {
        this.end = false;
        const instruction = this.fetchDecodeInstruction(address);
        let flagJumped = false;
        switch (instruction.opcode) {
            // Data Move
            case MNEMONIC_DATA_MOVE.LDM: {
                // Load the number into ACC (immediate addressing)
                this.registers.ACC.setVal(instruction.operand);
                break;
            }
            case MNEMONIC_DATA_MOVE.LDD: {
                // Load the contents of the specified address into ACC (direct/absolute addressing)
                this.registers.ACC.setVal(this.readMemory(instruction.operand));
                break;
            }
            case MNEMONIC_DATA_MOVE.LDI: {
                // Load the contents of the contents of the given address into ACC (indirect addressing)
                const location = this.readMemory(instruction.operand);
                this.registers.ACC.setVal(this.readMemory(location));
                break;
            }
            case MNEMONIC_DATA_MOVE.LDX: {
                // Load the contents of the calculated address into ACC (indexed addressing)
                const calculatedAddress = instruction.operand + this.registers.IX.getVal();
                this.registers.ACC.setVal(this.readMemory(calculatedAddress));
                break;
            }
            case MNEMONIC_DATA_MOVE.LDR: {
                // Load the number n into IX (immediate addressing is used)
                this.registers.IX.setVal(instruction.operand);
                break;
            }
            // I DO NOT KNOW WHY HODDER EDUCATION'S BOOK USES `LDR ACC` COMMAND EVEN IF `MOV ACC` IS ALSO USED
            case MNEMONIC_DATA_MOVE.LDR_ACC: {
                // Load the contents of ACC into IX
                this.registers.IX.setVal(this.registers.ACC.getVal());
                break;
            }
            case MNEMONIC_DATA_MOVE.MOV: {
                // Move the contents of a register to IX
                const registerName = getRegName(instruction.operand);
                this.registers.IX.setVal((this.registers as any)[registerName].getVal());
                break;
            }
            case MNEMONIC_DATA_MOVE.STO: {
                // Store the contents of ACC into the specified address (direct/absolute addressing)
                this.setMemory(instruction.operand, this.registers.ACC.getVal());
                break;
            }

            // Input/Output
            case MNEMONIC_IO.IN: {
                // Key in a character and store its ASCII value in ACC
                this.registers.ACC.setVal(await this.inputDevice());
                break;
            }
            case MNEMONIC_IO.OUT: {
                // Output to the screen the character whose ASCII value is stored in ACC
                this.outputDevice(this.registers.ACC.getVal());
                break;
            }

            // Arithmetic
            case MNEMONIC_ARITHMETIC.ADD_ADDRESS: {
                // Add the contents of the specified address to ACC (direct/absolute addressing)
                this.registers.ACC.setVal(this.registers.ACC.getVal() + this.readMemory(instruction.operand));
                break;
            }
            case MNEMONIC_ARITHMETIC.ADD_IMMEDIATE: {
                // Add the denary number n to ACC (immediate addressing)
                this.registers.ACC.setVal(this.registers.ACC.getVal() + instruction.operand);
                break;
            }
            case MNEMONIC_ARITHMETIC.SUB_ADDRESS: {
                // Subtract the contents of the specified address from ACC
                this.registers.ACC.setVal(this.registers.ACC.getVal() - this.readMemory(instruction.operand));
                break;
            }
            case MNEMONIC_ARITHMETIC.SUB_IMMEDIATE: {
                // Subtract the number n from ACC (immediate addressing)
                this.registers.ACC.setVal(this.registers.ACC.getVal() - instruction.operand);
                break;
            }
            case MNEMONIC_ARITHMETIC.DEC: {
                // Decrement the contents of ACC
                this.registers.ACC.setVal(this.registers.ACC.getVal() - 1);
                break;
            }
            case MNEMONIC_ARITHMETIC.INC: {
                // Increment the contents of ACC
                const register = getRegName(instruction.operand);
                (this.registers as any)[register].setVal((this.registers as any)[register].getVal() + 1);
                break;
            }

            // Branching
            case MNEMONIC_BRANCHING.JMP: {
                // Jump to the specified address
                flagJumped = true;
                this.registers.PC.setVal(instruction.operand);
                break;
            }

            case MNEMONIC_BRANCHING.JPE: {
                // Jump to the specified address if comparison is True
                if (this.isCMPSuccessful()) {
                    flagJumped = true;
                    this.registers.PC.setVal(instruction.operand);
                }
                break;
            }
            case MNEMONIC_BRANCHING.JPN: {
                // Jump to the specified address if comparison is False
                if (!this.isCMPSuccessful()) {
                    flagJumped = true;
                    this.registers.PC.setVal(instruction.operand);
                }
                break;
            }
            case MNEMONIC_BRANCHING.JMR: {
                // Jump to the specified address (relative) if comparison is True

                if (this.isCMPSuccessful()) {
                    flagJumped = true;
                    this.registers.PC.setVal(this.registers.PC.getVal() + instruction.operand);
                }
                break;
            }



            case MNEMONIC_BRANCHING.END: {
                // Return control to the operating system
                this.end = true;
                break;
            }

            // Comparison
            case MNEMONIC_COMPARE.CMP_ADDRESS: {
                // Compare ACC with contents of the specified address (direct/absolute addressing)
                const val = this.registers.ACC.getVal() - this.readMemory(instruction.operand);
                this.setStatusRegisterWithNumber(val);
                if(this.verbose) console.log("Compare result: " + this.isCMPSuccessful());
                break;
            }
            case MNEMONIC_COMPARE.CMP_IMMEDIATE: {
                // Compare ACC with the number n (immediate addressing)
                const val = this.registers.ACC.getVal() - instruction.operand;
                this.setStatusRegisterWithNumber(val);
                if(this.verbose) console.log("Compare result: " + this.isCMPSuccessful());
                break;
            }
            case MNEMONIC_COMPARE.CMI: {
                // Compare ACC with contents of the contents of the specified address (indirect addressing)
                const val = this.registers.ACC.getVal() - this.readMemory(this.readMemory(instruction.operand));
                this.setStatusRegisterWithNumber(val);
                if(this.verbose) console.log("Compare result: " + this.isCMPSuccessful());
                break;
            }

            case 0xFF: {
                throw new Error("Cannot treat a data type as an instruction: " + instruction.opcode.toString(16));
            }

            default: {
                throw new Error("Invalid instruction opcode: 0x" + instruction.opcode.toString(16));
            }
        }

        if (!flagJumped) {
            this.registers.PC.setVal(this.registers.PC.getVal() + 2);
        }
    }
}

export default machine;
