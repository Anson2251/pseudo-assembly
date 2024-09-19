import { suite, it, expect } from 'vitest';
import machine from "../../src/machine"

suite('Interpreter-Core-Machine - Data Movement Instructions', () => {
  it('should load immediate value into ACC (LDM)', async () => {
    const vm = new machine(16);

    const instructions = [
      { opcode: 0b00000000, operand: 0b00001010 }, // LDM #10
      { opcode: 0b00110011, operand: 0b00000000 }  // END
    ];

    await vm.execute(instructions);
    const accValue = vm.registers.ACC.getValue(); // Access ACC register
    expect(accValue).toBe(10);
  });

  it('should move contents of ACC to IX (MOV)', async () => {
    const vm = new machine(16);

    const instructions = [
      { opcode: 0b00000000, operand: 0b00001010 }, // LDM #10
      { opcode: 0b00000101, operand: 0b00000000 }, // MOV ACC to IX
      { opcode: 0b00110011, operand: 0b00000000 }  // END
    ];

    await vm.execute(instructions);
    const ixValue = vm.registers.IX.getValue(); // Access IX register
    expect(ixValue).toBe(10);
  });

  it('should store contents of ACC into memory (STO)', async () => {
    const vm = new machine(16);

    const instructions = [
      { opcode: 0b00000000, operand: 0b00001111 }, // LDM #15
      { opcode: 0b00000110, operand: 0b00000001 }, // STO ACC at memory address 1
      { opcode: 0b00110011, operand: 0b00000000 }  // END
    ];

    await vm.execute(instructions);
    const memoryValue = vm.readMemory(1); // Check memory at address 1
    expect(memoryValue).toBe(15);
  });
});
