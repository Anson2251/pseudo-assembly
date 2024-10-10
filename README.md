# Assembly Interpreter (Core)

A toy project for running the assembly language examples shown in the *Cambridge International AS and A Levels Computer Science Coursebook (Hodder Education)*.

## Contents

- [Build Instructions](#build-instructions) 
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
- [Usage](#usage)
- [Machine Instruction Set Documentation](#machine-instruction-set-documentation)
    - [Number Representation](#number-representation)
    - [Register Representation](#register-representation)
    - [Label Representation](#label-representation)
    - [Machine Mnemonics](#mnemonics)
        - [Data Movement](#data-move-mnemonics)
        - [Input Output](#io-mnemonics)
        - [Arithmetic](#arithmetic-mnemonics)
        - [Branching](#branching-mnemonics)
        - [Comparison](#comparison-mnemonics)
        - [Binary Shift](#binary-shift-mnemonics)
        - [Bit Manipulation](#bit-manipulation-mnemonics)

## Build Instructions

### Prerequisites

- [`Node.js`](https://nodejs.org/)

- [`Make`](https://www.gnu.org/software/make/) (required for bundling & compiling, command `npm run build-only` does not depend on it)

- [`QuickJS`](https://bellard.org/quickjs/) (optional, but required for compiling into an executable)

    QuickJS is a lightweight JavaScript interpreter written in C, designed for minimal size and fast startup. You can find it in [Fabrice Bellard's repo](https://github.com/bellard/quickjs).

    Binary builds can be found at the [release page](https://bellard.org/quickjs/binary_releases/).

> [!TIP]
  Cosmopolitan binaries are recommended. (`quickjs-cosmo-YYYY-MM-DD.zip`).
  This type of build can run on `Linux`, `Mac`, `Windows`, `FreeBSD`, `OpenBSD` and `NetBSD` for both `ARM64` and `x86_64` architectures.

> [!WARNING]
   `qjsc` is not available in the cosmopolitan release, but is available in other releases with OS and architecture specifications. For `ARM64` users, the binary builds can be obtained from the [quickjs-build repo](https://github.com/napi-bindings/quickjs-build/releases).

### Steps

1. Install dependencies:

    ```bash
    npm install
    ```

2. Build the project:

    ```bash
    npm run build
    # or
    make build
    ```

    To create a single executable file, use:

    ```bash
    npm run compile
    # or
    make compile
    ```

    If you wish to build the TypeScript files only, you can use:

    ```bash
    npm run build-only
    ```

3. The bundled JavaScript file (or executable) can be found in the `dist/` folder. It should be run in the QuickJS environment.

## Usage

Usage: `interpreter [options] -r <file>`

Options:

| Options | Description |
|---------|-------------|
| `-i, --interpret <file>` | To interpret the file |
| `-a, --assemble <file>` | To assemble the given file into the binary version |
| `-r, --run <file>` | To run the given binary file |
| `-o, --out <file>` | To specify the output file |
| `-b, --bits <number>` | To specify the number of bits to use for VM |
| `-v, --verbose` | To enable verbose mode |

## Machine Instruction Set Documentation

### Number Representation

- Binary number: `B<binary number>`

    e.g. `B00000011` represents a 8-bit binary number `3`.

- Decimal number: `#<decimal number>`

    e.g. `#42` represents the number `42`.

- Hexadecimal number: `&<hexadecimal number>`

    e.g. `&2A` represents the number `42`.

### Register Representation

Register: `<code>`

| Register    | Code  |
|-------------|-------|
| Accumulator | `ACC` |
| Current instruction register | `CIR` |
| Index register | `IX` |
| Memory address register | `MAR` |
| Memory data register | `MDR` |
| Program counter | `PC` |

**Register codes are case-sensitive and reserved.**

### Label Representation

Labels: `<label>:`

e.g. `loop:`

**Labels are case-sensitive.**

### Mnemonics

**Mnemonics are case-sensitive.**

#### Data Move Mnemonics
| Mnemonic | Opcode | Operand  | Description |
|----------|--------|----------|-------------|
| `LDM`    | 0x00   | `<number>` | Load the number into ACC (immediate addressing) |
| `LDD`    | 0x01   | `<label>`  | Load the contents of the specified address into ACC (direct/absolute addressing) |
| `LDI`    | 0x02   | `<label>`  | Load the contents of the contents of the given address into ACC (indirect addressing) |
| `LDX`    | 0x03   | `<label>`  |Load the contents of the calculated address into ACC (indexed addressing) |
| `LDR`    | 0x04   | `<number>` | Load the number n into IX (immediate addressing is used) |
| `MOV`    | 0x05   | `<register>` | Move the contents of a register to IX |
| `STO`    | 0x06   | `<label>` | Store the contents of ACC into the specified address (direct/absolute addressing) |
| `LDR`    | 0x07   | `ACC` | (overload) Load the number in the accumulator into IX |

#### IO Mnemonics
| Mnemonic | Opcode | Operand | Description |
|----------|--------|---------|-------------|
| `IN`     | 0x10   |    -    | Key in a character and store its ASCII value in ACC |
| `OUT`    | 0x11   |    -    | Output to the screen the character whose ASCII value is stored in ACC |

#### Arithmetic Mnemonics
| Mnemonic          | Opcode | Operand | Description |
|-------------------|--------|---------|------------|
| `ADD`             | 0x20   | `<number>` | Add the contents of the specified address to ACC |
| `ADD`             | 0x21   | `<label>` | (overload) Add the denary number n to ACC (immediate addressing) |
| `SUB`             | 0x22   | `<number>` | Subtract the contents of the specified address from ACC |
| `SUB`             | 0x23   | `<label>` | (overload) Subtract the number n from ACC (immediate addressing) |
| `INC`             | 0x24   | `<register>` | Add 1 to the contents of a register |
| `DEC`             | 0x25   | `<register>` | Subtract 1 from the contents of a register |

#### Branching Mnemonics
| Mnemonic | Opcode | Operand | Description |
|----------|--------|---------|------------|
| `JMP`    | 0x30   | `<label>` | Jump to the specified address |
| `JPE`    | 0x31   | `<label>` | Jump to the specified address if comparison is True |
| `JPN`    | 0x32   | `<label>` | Jump to the specified address if comparison is False |
| `END`    | 0x33   |    -      | End the program. Return control to the operating system |
| `JMR`    | 0x34   | `<number>` | Jump to the address (relative, e.g. 3 ahead/behind) |

#### Comparison Mnemonics
| Mnemonic          | Opcode | Operand | Description |
|-------------------|--------|---------|------------|
| `CMP`             | 0x40   | `<label>` | Compare ACC with contents of the specified address (direct/absolute addressing) |
| `CMP`             | 0x41   | `<number>` | (overload) Compare ACC with the number n (immediate addressing) |
| `CMI`             | 0x42   | `<label>` | Compare ACC with contents of the contents of the specified address (indirect addressing) |

#### Binary Shift Mnemonics
| Mnemonic | Opcode | Operand | Description |
|----------|--------|---------|------------|
| `LSL`    | 0x50   | `<number>` | Logical left-shift the contents of ACC by n places |
| `LSR`    | 0x51   | `<number>` | Logical right-shift the contents of ACC by n places |
| `ASR`    | 0x52   | `<number>` | Arithmetic right-shift the contents of ACC by n places |
| `CSL`    | 0x53   | `<number>` | Circular left-shift the contents of ACC by n places |
| `CSR`    | 0x54   | `<number>` | Circular right-shift the contents of ACC by n places |

#### Bit Manipulation Mnemonics
| Mnemonic | Opcode | Operand | Description |
|----------|--------|---------|-----------|
| `AND`    | 0x60   | `<number>` | AND the contents of ACC with the number n |
| `AND`    | 0x61   | `<label>` | (overload) AND the contents of ACC with the contents of the specified address
| `OR`     | 0x62   | `<number>` | OR the contents of ACC with the number n |
| `OR`     | 0x63   | `<label>` | (overload) OR the contents of ACC with the contents of the specified address |
| `XOR`    | 0x64   | `<number>`   | XOR the contents of ACC with the number n |
| `XOR`    | 0x65   | `<label>`   | (overload) XOR the contents of ACC with contents of the specified address |
| `NOT`    | 0x66   |    -    | NOT the contents of the accumulator |

---

Last update: 2024-09-23
