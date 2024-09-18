import { suite, it, expect } from 'vitest';
import { assembler, extractLabels, preprocessCode } from '../../src/assembler';
import machine from '../../src/machine';

const sampleCode = `
        LDM     #0              ; Load 0 into ACC
        STO     total           ; Store 0 in total
        STO     counter         ; Store 0 in counter
        LDR     #0              ; Set IX to 0

loop:   LDX     number          ; Load the number indexed by IX into ACC
        ADD     total           ; Add total to ACC
        STO     total           ; Store result in total
        INC     IX              ; Add 1 to the contents of IX
        LDD     counter         ; Load counter into ACC
        INC     ACC             ; Add 1 to ACC
        STO     counter         ; Store result in counter
        CMP     #3              ; Compare with 3
        JPN     loop            ; If ACC not equal to 3 then return to start of loop
        LDD     total           ; Load total into ACC
        OUT
        END                     ; End of program

number: #5                      ; List of three numbers
        #7
        #3
counter:
total:
`

suite("Intreperter - Assembler", () => {
  it("should extract labels", () => {
    const result = extractLabels(preprocessCode(sampleCode));
    expect(result).toEqual(["loop", "number", "counter", "total"]);
  });

  it("should assemble", async () => {
    const byteCode = assembler(sampleCode);

    let result = -1;
    const vm = new machine(16);
    vm.verbose = false;
    vm.addDevice("output", async (x) => {
      result = x;
    });
    
    await vm.execute(byteCode);
    expect(result).toBe(15);
  })
});
