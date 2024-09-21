export const RegisterTypes = ["ACC", "CIR", "IX", "MAR", "MDR", "PC"];
export type RegisterNameType = "ACC" | "CIR" | "IX" | "MAR" | "MDR" | "PC";

import { overflowToBinary, decimalToTwosComplement } from "./utils";

export const getRegID = (reg: RegisterNameType) => {
    const index = RegisterTypes.indexOf(reg);
    if(index < 0) throw new Error("Invalid register name");
    return RegisterTypes.indexOf(reg);
}

export const getRegName = (id: number) => {
    if(id < 0 || id > 5) throw new Error("Invalid register ID");
    return RegisterTypes[id];
}

export class register {
    private value: number;
    private type: RegisterNameType;
    private bits: number;
    /**
     * Creates a new register with the given name and bit size.
     *
     * Sets the initial value of the register to 0.
     * @param type The name of the register.
     * @param bits The size of the register in bits.
     */
    constructor(type: RegisterNameType, bits: number) {
        this.type = type;
        this.value = 0;
        this.bits = bits;
    }

    setValue(value: number) {
        this.value = overflowToBinary(value, this.bits);
    }

    getValue() {
        return this.value;
    }

    decreaseBy(value: number) {
        this.setValue(decimalToTwosComplement(overflowToBinary(this.value - value, this.bits), this.bits)); // use the previous implementation to handle the overflow
    }

    increaseBy(value: number) {
        this.setValue(decimalToTwosComplement(overflowToBinary(this.value + value, this.bits), this.bits)); // use the previous implementation to handle the overflow
    }

    /**
     * Returns the name of this register.
     */
    getType() {
        return this.type;
    }
}

export default register;