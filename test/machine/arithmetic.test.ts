import { suite, it, expect } from 'vitest'
import machine from "../../src/machine"

suite('Interpreter-Core-Machine - Arithmetic Instructions', () => {
    it('should add immediate value to ACC (ADD #n)', async () => {
      const vm = new machine(16);

      vm.verbose = false;
  
      const instructions = [
        { opcode: 0x00, operand: 2 }, // LDM #2
        { opcode: 0x21, operand: 3 }, // ADD #3
        { opcode: 0x33, operand: 0 }  // END
      ];
  
      await vm.execute(instructions);
      const accValue = vm.registers.ACC.getValue();
      expect(accValue).toBe(5); // 2 + 3 = 5
    });
  
    it('should subtract immediate value from ACC (SUB #n)', async () => {
      const vm = new machine(16);
  
      const instructions = [
        { opcode: 0x00, operand: 4 }, // LDM #4
        { opcode: 0x23, operand: 1 }, // SUB #1
        { opcode: 0x33, operand: 0 }  // END
      ];
  
      await vm.execute(instructions);
      const accValue = vm.registers.ACC.getValue();
      expect(accValue).toBe(3); // 4 - 1 = 3
    });
  });
  