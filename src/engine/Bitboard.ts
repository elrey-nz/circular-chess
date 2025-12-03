/**
 * Immutable Bitboard class wrapping bigint for efficient piece position representation.
 * All operations return new Bitboard instances.
 */
export class Bitboard {
    private readonly value: bigint;

    private constructor(value: bigint) {
        this.value = value;
    }

    /**
     * Create an empty bitboard (all bits cleared)
     */
    static empty(): Bitboard {
        return new Bitboard(0n);
    }

    /**
     * Create a bitboard with a single bit set at the given index
     */
    static fromIndex(index: number): Bitboard {
        return new Bitboard(1n << BigInt(index));
    }

    /**
     * Create a bitboard from a bigint value
     */
    static fromValue(value: bigint): Bitboard {
        return new Bitboard(value);
    }

    /**
     * Get the underlying bigint value
     */
    getValue(): bigint {
        return this.value;
    }

    /**
     * Check if a bit is set at the given index
     */
    getBit(index: number): boolean {
        return (this.value & (1n << BigInt(index))) !== 0n;
    }

    /**
     * Set a bit at the given index, returning a new Bitboard
     */
    setBit(index: number): Bitboard {
        return new Bitboard(this.value | (1n << BigInt(index)));
    }

    /**
     * Clear a bit at the given index, returning a new Bitboard
     */
    clearBit(index: number): Bitboard {
        return new Bitboard(this.value & ~(1n << BigInt(index)));
    }

    /**
     * Toggle a bit at the given index, returning a new Bitboard
     */
    toggleBit(index: number): Bitboard {
        return new Bitboard(this.value ^ (1n << BigInt(index)));
    }

    /**
     * Bitwise OR operation, returning a new Bitboard
     */
    or(other: Bitboard): Bitboard {
        return new Bitboard(this.value | other.value);
    }

    /**
     * Bitwise AND operation, returning a new Bitboard
     */
    and(other: Bitboard): Bitboard {
        return new Bitboard(this.value & other.value);
    }

    /**
     * Bitwise XOR operation, returning a new Bitboard
     */
    xor(other: Bitboard): Bitboard {
        return new Bitboard(this.value ^ other.value);
    }

    /**
     * Bitwise NOT operation, returning a new Bitboard
     */
    not(): Bitboard {
        return new Bitboard(~this.value);
    }

    /**
     * Check if this bitboard equals another
     */
    equals(other: Bitboard): boolean {
        return this.value === other.value;
    }

    /**
     * Check if the bitboard is empty (all bits cleared)
     */
    isEmpty(): boolean {
        return this.value === 0n;
    }

    /**
     * Get an iterator over all set bit indices
     */
    *[Symbol.iterator](): Generator<number> {
        let value = this.value;
        let index = 0;
        while (value !== 0n) {
            if (value & 1n) {
                yield index;
            }
            value >>= 1n;
            index++;
        }
    }

    /**
     * Get all set bit indices as an array
     */
    getSetBits(): number[] {
        return Array.from(this);
    }

    /**
     * Count the number of set bits
     */
    popCount(): number {
        let count = 0;
        let value = this.value;
        while (value !== 0n) {
            if (value & 1n) {
                count++;
            }
            value >>= 1n;
        }
        return count;
    }

    /**
     * Debug utility to print a bitboard to the console.
     * Renders as a grid where rows are rings (outer ring at top) and columns are files.
     */
    print(rings: number = 4, files: number = 16): void {
        console.log('Bitboard:');
        // Print from outer ring (rings-1) down to inner ring (0)
        for (let r = rings - 1; r >= 0; r--) {
            let rowStr = `Ring ${r}: `;
            for (let f = 0; f < files; f++) {
                const index = r * files + f;
                rowStr += this.getBit(index) ? '1 ' : '. ';
            }
            console.log(rowStr);
        }
        console.log('       ' + Array.from({ length: files }, (_, i) => i.toString(16)).join(' '));
    }

    /**
     * Convert to string representation
     */
    toString(): string {
        return this.value.toString();
    }
}
