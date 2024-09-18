import { suite, it, expect } from 'vitest';
import machine from "../../src/machine"

suite('Interpreter-Core-Machine - Jump Instructions', () => {
  it('should jump to a give address (JMP)', async () => {
    const vm = new machine(8);

    const instructions = [
      { opcode: 0x00, operand: 0 }, // LDM #0
      { opcode: 0x21, operand: 1 }, // ADD #1
      { opcode: 0x30, operand: 8 }, // JMP #0
      { opcode: 0x21, operand: 1 }, // ADD #1 (should be jumped over)
      { opcode: 0x21, operand: 1 }, // ADD #1
      { opcode: 0x33, operand: 0 }  // END
    ];

    vm.verbose = false;

    await vm.execute(instructions);
    expect(vm.registers.ACC.getVal()).toBe(2); // if it didn't jump, it would be 3
  });

  it('should jump to a give address (JPE)', async () => {
    const vm = new machine(8);

    const instructions = [
      { opcode: 0x00, operand: 5 }, // LDM #0
      { opcode: 0x41, operand: 5 }, // CMI #0
      { opcode: 0x31, operand: 8 }, // JPE #0
      { opcode: 0x21, operand: 1 }, // ADD #1
      { opcode: 0x33, operand: 0 }  // END
    ];

    vm.verbose = false;

    await vm.execute(instructions);
    expect(vm.registers.ACC.getVal()).toBe(5); // if it didn't jump, it would be 6
  });
});
