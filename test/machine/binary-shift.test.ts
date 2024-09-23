import { suite, it, expect } from 'vitest'
import machine from "../../src/machine"
import { MNEMONIC_BINARY_SHIFT } from '../../src/instruction';

suite('binary shift', () => {
    it('logic left shift', async () => {
      const vm = new machine(8);
  
      const instructions = [
        { opcode: 0x00, operand: 0b11000000 }, // LDM #3
        { opcode: MNEMONIC_BINARY_SHIFT.LSL, operand: 1 }, // logic left shift 7 bits
        { opcode: 0x33, operand: 0b00000000 }  // END
      ];
  
      await vm.execute(instructions);
      const accValue = vm.registers.ACC.getValue();
      expect(accValue).toBe(0b10000000);
    });
  
    it('logic right shift', async () => {
      const vm = new machine(8);

      vm.verbose = true;
  
      const instructions = [
        { opcode: 0x00, operand: 0b11000000 }, // LDM #3
        { opcode: MNEMONIC_BINARY_SHIFT.LSR, operand: 7 }, // logic right shift 7 bits
        { opcode: 0x33, operand: 0 }  // END
      ];
  
      await vm.execute(instructions);
      const accValue = vm.registers.ACC.getValue();
      expect(accValue).toBe(0b00000001);
    });

    it('arithmetic right shift (negative)', async () => {
      const vm = new machine(8);
  
      const instructions = [
        { opcode: 0x00, operand: 0b11000000 }, // LDM #3
        { opcode: MNEMONIC_BINARY_SHIFT.ASR, operand: 2 }, // arithmetic right shift 7 bits
        { opcode: 0x33, operand: 0 }  // END
      ];
  
      await vm.execute(instructions);
      const accValue = vm.registers.ACC.getValue();
      expect(accValue).toBe(0b10110000);
    });

    it('arithmetic right shift (positive)', async () => {
      const vm = new machine(8);
  
      const instructions = [
        { opcode: 0x00, operand: 0b01100000 }, // LDM #3
        { opcode: MNEMONIC_BINARY_SHIFT.ASR, operand: 2 }, // arithmetic right shift 7 bits
        { opcode: 0x33, operand: 0 }  // END
      ];
  
      await vm.execute(instructions);
      const accValue = vm.registers.ACC.getValue();
      expect(accValue).toBe(0b00011000);
    });

    it('rotate left', async () => {
      const vm = new machine(8);
  
      const instructions = [
        { opcode: 0x00, operand: 0b11000000 }, // LDM #3
        { opcode: MNEMONIC_BINARY_SHIFT.CSL, operand: 2 }, // rotate left 7 bits
        { opcode: 0x33, operand: 0 }  // END
      ];
  
      await vm.execute(instructions);
      const accValue = vm.registers.ACC.getValue();
      expect(accValue).toBe(0b00000011);
    });

    it('rotate right', async () => {
      const vm = new machine(8);
  
      const instructions = [
        { opcode: 0x00, operand: 0b0000000011 }, // LDM #3
        { opcode: MNEMONIC_BINARY_SHIFT.CSR, operand: 2 }, // rotate right 7 bits
        { opcode: 0x33, operand: 0 }  // END
      ];
  
      await vm.execute(instructions);
      const accValue = vm.registers.ACC.getValue();
      expect(accValue).toBe(0b11000000);
    });
  });
  