import { suite, it, expect } from 'vitest'
import machine from "../../src/machine"
import { MNEMONIC_BIT_MANIPULATION } from '../../src/instruction';

suite('bit-manipulation', () => {
  it('and immediate', async () => {
    const vm = new machine(8);

    vm.verbose = false;

    const instructions = [
      { opcode: 0x00, operand: 0b00000011 }, // LDM #3
      { opcode: MNEMONIC_BIT_MANIPULATION.AND_IMMEDIATE, operand: 0b00000101 }, // LDM #2
      { opcode: 0x33, operand: 0 }
    ];

    await vm.execute(instructions);
    const accValue = vm.registers.ACC.getValue();
    expect(accValue).toBe(0b00000001);
  });

  it('and address', async () => {
    const vm = new machine(8);

    const instructions = [
      { opcode: 0x00, operand: 0b00000011 }, // LDM #3
      { opcode : 0x06, operand: 0 }, // sto 3 to address 16
      { opcode: MNEMONIC_BIT_MANIPULATION.AND_ADDRESS, operand: 0b00000101 }, // LDM #2
      { opcode: 0x33, operand: 0 }
    ];

    await vm.execute(instructions);
    const accValue = vm.registers.ACC.getValue();
    expect(accValue).toBe(0b00000001);
  });

  it('or immediate', async () => {
    const vm = new machine(8);

    const instructions = [
      { opcode: 0x00, operand: 0b00000011 }, // LDM #3
      { opcode: MNEMONIC_BIT_MANIPULATION.OR_IMMEDIATE, operand: 0b00000101 }, // LDM #5
      { opcode: 0x33, operand: 0 }
    ];

    await vm.execute(instructions);
    const accValue = vm.registers.ACC.getValue();
    expect(accValue).toBe(0b00000111);
  });

  it('or address', async () => {
    const vm = new machine(8);

    const instructions = [
      { opcode: 0x00, operand: 0b00000011 }, // LDM #3
      { opcode : 0x06, operand: 0 }, // sto 3 to address 16
      { opcode: MNEMONIC_BIT_MANIPULATION.OR_ADDRESS, operand: 0b00000101 }, // LDM #5
      { opcode: 0x33, operand: 0 }
    ];

    await vm.execute(instructions);
    const accValue = vm.registers.ACC.getValue();
    expect(accValue).toBe(0b00000111);
  });

  it('xor immediate', async () => {
    const vm = new machine(8);

    const instructions = [
      { opcode: 0x00, operand: 0b00000011 }, // LDM #3
      { opcode: MNEMONIC_BIT_MANIPULATION.XOR_IMMEDIATE, operand: 0b00000101 }, // LDM #5
      { opcode: 0x33, operand: 0 }
    ];

    await vm.execute(instructions);
    const accValue = vm.registers.ACC.getValue();
    expect(accValue).toBe(0b00000110);
  });

  it('xor address', async () => {
    const vm = new machine(8);

    const instructions = [
      { opcode: 0x00, operand: 0b00000011 }, // LDM #3
      { opcode : 0x06, operand: 0 }, // sto 3 to address 16
      { opcode: MNEMONIC_BIT_MANIPULATION.XOR_ADDRESS, operand: 0b00000101 }, // LDM #5
      { opcode: 0x33, operand: 0 }
    ];

    await vm.execute(instructions);
    const accValue = vm.registers.ACC.getValue();
    expect(accValue).toBe(0b00000110);
  });

  it('not', async () => {
    const vm = new machine(8);

    const instructions = [
      { opcode: 0x00, operand: 0b00000011 }, // LDM #3
      { opcode: MNEMONIC_BIT_MANIPULATION.NOT, operand: 0 },
      { opcode: 0x33, operand: 0 }
    ];

    await vm.execute(instructions);
    const accValue = vm.registers.ACC.getValue();
    expect(accValue).toBe(0b11111100);
  });
});
