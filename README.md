# Assembly Interpreter (Core)

A toy project for running the Assembly language shown in *Cambridge International AS and A Levels Computer Science Coursebook (Hodder Education)*

## Build Instructions

### Prerequisite

- [`node.js`](https://nodejs.org/)

- [`make`](https://www.gnu.org/software/make/)

- [`QuickJS`](https://bellard.org/quickjs/) (Optional, runtime and needed by compiling into an executable)

    Binary builds can be found at [quickjs-build repo](https://github.com/napi-bindings/quickjs-build)

### Steps

- 1. `npm install`

- 2. `npm run build`

    To get the single executable file, run `npm run compile`.

- 3. The bundled js file (executable file) can be found in the folder `dist/`. It should be run in the QuickJS environment.

## Machine Instruction Set Documentation

### Data Move Mnemonics
| Mnemonic | Opcode | Description |
|----------|--------|-------------|
| `LDM`    | 0x00   | Load the number into ACC (immediate addressing) |
| `LDD`    | 0x01   | Load the contents of the specified address into ACC (direct/absolute addressing) |
| `LDI`    | 0x02   | Load the contents of the contents of the given address into ACC (indirect addressing) |
| `LDX`    | 0x03   | Load the contents of the calculated address into ACC (indexed addressing) |
| `LDR`    | 0x04   | Load the number n into IX (immediate addressing is used) |
| `MOV`    | 0x05   | Move the contents of a register to IX |
| `STO`    | 0x06   | Store the contents of ACC into the specified address (direct/absolute addressing) |
| `LDR`    | 0x07   | Operand "`ACC`", (overload) Load the number in the accumulator into IX |

### IO Mnemonics
| Mnemonic | Opcode | Description |
|----------|--------|-------------|
| `IN`     | 0x10   | Key in a character and store its ASCII value in ACC |
| `OUT`    | 0x11   | Output to the screen the character whose ASCII value is stored in ACC |

### Arithmetic Mnemonics
| Mnemonic          | Opcode | Description |
|-------------------|--------|-------------|
| `ADD`             | 0x20   | Add the contents of the specified address to ACC (direct/absolute addressing) |
| `ADD`             | 0x21   | (overload) Add the denary number n to ACC (immediate addressing) |
| `SUB`             | 0x22   | Subtract the contents of the specified address from ACC |
| `SUB`             | 0x23   | (overload) Subtract the number n from ACC (immediate addressing) |
| `INC`             | 0x24   | Add 1 to the contents of the register (ACC or IX) |
| `DEC`             | 0x25   | Subtract 1 from the contents of the register (ACC or IX) |

### Branching Mnemonics
| Mnemonic | Opcode | Description |
|----------|--------|-------------|
| `JMP`    | 0x30   | Jump to the specified address |
| `JPE`    | 0x31   | Jump to the specified address if comparison is True |
| `JPN`    | 0x32   | Jump to the specified address if comparison is False |
| `END`    | 0x33   | End the program. Return control to the operating system |
| `JMR`    | 0x34   | Jump to the address (relative, e.g. 3 ahead/behind) |

### Comparison Mnemonics
| Mnemonic          | Opcode | Description |
|-------------------|--------|-------------|
| `CMP`             | 0x40   | Compare ACC with contents of the specified address (direct/absolute addressing) |
| `CMP`             | 0x41   | (overload) Compare ACC with the number n (immediate addressing) |
| `CMI`             | 0x42   | Compare ACC with contents of the contents of the specified address (indirect addressing) |

Last update: 2024-09-18
