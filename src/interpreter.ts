import machine from "./machine";
import assembler from "./assembler";
import { type InstructionPieceType } from "./instruction";

type handler = {
    id: number,
    type: "input" | "output",
    handler: (...args: any[]) => Promise<number | void>
}

export class interpreter {
    private handlers: handler[] = [];
    private vm: machine;
    constructor(bits: number = 8) {
        this.vm = this.initVM(bits);
    }

    setVerbose(verbose: boolean) {
        this.vm.verbose = verbose;
    }

    assemble(code: string) {
        return new Promise<InstructionPieceType[]>((resolve, reject) => {
            try {
                resolve(assembler(code));
            }
            catch (err) {
                reject(err);
            }
        })
    }

    interpret(code: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const instructions = assembler(code);
                this.vm.execute(instructions)
                    .then(() => {
                        resolve();
                    }).catch(err => {
                        reject(err);
                    });
            }
            catch (err) {
                reject(err);
            }
        });
    }

    execute(instructions: InstructionPieceType[]) {
        return this.vm.execute(instructions);
    }

    changeBits(bits: number) {
        this.vm = this.initVM(bits);
    }

    getBits() {
        return this.vm.getBits();
    }

    initVM(bits: number) {
        const vm = new machine(bits);
        vm.addDevice("input", this.onInput.bind(this));
        vm.addDevice("output", this.onOutput.bind(this));
        return vm;
    }

    addHandler(type: "input", handler: () => Promise<number>): number
    addHandler(type: "output", handler: (arg: number) => Promise<void>): number
    addHandler(type: "input" | "output", handler: (arg: number) => Promise<void> | Promise<number>): number {
        const id = this.handlers.length > 0 ? this.handlers[this.handlers.length - 1].id + 1 : 0;
        this.handlers.push({ id: id, type, handler });
        return id;
    }

    private async onInput(): Promise<number> {
        return await this.handlers.filter(handler => handler.type === "input")[0].handler() as number;
    }

    private async onOutput(value: number) {
        this.handlers.filter(handler => handler.type === "output").forEach(handler => handler.handler(value));
    }
}

export default interpreter;
