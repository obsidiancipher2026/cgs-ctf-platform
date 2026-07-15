# VM Architecture

## Opcodes
| Op | Name | Operand | Description |
|----|------|---------|-------------|
| 0x01 | HALT | - | Stop |
| 0x02 | PUSH | imm8 | Push byte |
| 0x0E | XOR | - | a^b |
| 0x12 | ROL | n | Rotate left |
| 0x1A | HASH | - | Hash |
| 0x1B | ROTATE | n | Rotate right |
| 0x1C | DERIVE | - | Key derive |
| 0x20 | PRINTCHAR | - | Print char |
| 0x22 | ISTORE | addr | Store to state |
| 0x24 | DUP | - | Duplicate |

## Key Derivation
Push 8 seed bytes -> 16 mixing rounds -> Store 32 key bytes
