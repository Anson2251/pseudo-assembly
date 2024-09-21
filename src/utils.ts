/**
 * Converts a two's complement binary number to its decimal representation.
 *
 * @param binary The binary number to convert, represented as a number.
 * @param bitSize The size of the binary number in bits.
 * @returns The decimal representation of the given binary number.
 */
export function twosComplementToDecimal(binary: number, bitSize: number) {
    const mask = 1 << (bitSize - 1); // Sign bit mask (e.g., for 8 bits: 0b10000000)
    // If the sign bit is set (negative number), subtract 2^bitSize
    return (binary & mask) ? binary - (1 << bitSize) : binary;
}

/**
 * Converts a decimal number to its two's complement binary representation.
 *
 * @param decimal The decimal number to convert.
 * @param bitSize The size of the binary number in bits.
 * @returns The two's complement binary representation of the given decimal number.
 */
export function decimalToTwosComplement(decimal: number, bitSize: number) {
    const mask = (1 << bitSize) - 1; // Mask to fit within bit size
    // Apply the mask to ensure the value fits within the specified bit size
    return decimal & mask;
}

/**
 * Converts a number to its binary string representation and takes the lowest
 * {@link bits} bits of the result.
 *
 * @param value The number to convert.
 * @param bits The number of bits to take from the binary string representation.
 * @returns The lowest {@link bits} bits of the binary string representation of
 *   the given number.
 */
export function overflowToBinary(value: number, bits: number): number {
    return value & ((1 << bits) - 1);
}

/**
 * Adds two numbers and takes the lowest {@link bits} bits of the result.
 *
 * @param a The first number to add.
 * @param b The second number to add.
 * @param bits The number of bits to take from the binary string representation.
 * @returns The lowest {@link bits} bits of the sum of the two given numbers.
 */
export function overflowAdd(a: number, b: number, bits: number): number {
    return overflowToBinary(a + b, bits);
}

/**
 * Subtracts two numbers and takes the lowest {@link bits} bits of the result.
 *
 * @param a The first number to subtract.
 * @param b The second number to subtract.
 * @param bits The number of bits to take from the binary string representation.
 * @returns The lowest {@link bits} bits of the difference of the two given numbers.
 */
export function overflowSubtract(a: number, b: number, bits: number): number {
    return overflowToBinary(a - b, bits);
}

/**
 * Converts a number to its binary string representation and takes the lowest
 * {@link bits} bits of the result, padding with leading zeros as needed.
 *
 * @param number The number to convert.
 * @param bits The number of bits to take from the binary string representation.
 * @returns The string representation of the lowest {@link bits} bits of the given number, 
 * prefix added
 */
export function binaryToString(number: number, bits: number) {
    return `0b${overflowToBinary(number, bits).toString(2).padStart(bits, "0")}`
}
