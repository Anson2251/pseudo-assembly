import { suite, it, expect } from 'vitest'
import machine from "../../src/machine"

suite('Interpreter-Core-Machine', () => {
  it('test run', async () => {
    const vm = new machine(8);

    let output = 0;

    const outputDevice = async (value: number) => {
        output = value;
    }
    
    const instructions = [
        { opcode: 0b00000000, operand: 0b01100001 },  // LDM #97 (Load ASCII 'a' into ACC)
        { opcode: 0b00010001, operand: 0b00000000 },  // OUT (Output the value in ACC)
        { opcode: 0b00110011, operand: 0b00000000 }
    ]

    vm.verbose = true;
    vm.addDevice("output", outputDevice);

    await vm.execute(instructions);
    expect(output).toBe(97);
  })
})
