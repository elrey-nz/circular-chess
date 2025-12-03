import { FILES, RINGS } from './types';
import type { Bitboard } from './types';

export const setBit = (bb: Bitboard, index: number): Bitboard => {
    return bb | (1n << BigInt(index));
};

export const clearBit = (bb: Bitboard, index: number): Bitboard => {
    return bb & ~(1n << BigInt(index));
};

export const toggleBit = (bb: Bitboard, index: number): Bitboard => {
    return bb ^ (1n << BigInt(index));
};

export const getBit = (bb: Bitboard, index: number): boolean => {
    return (bb & (1n << BigInt(index))) !== 0n;
};

/**
 * Debug utility to print a bitboard to the console.
 * Renders as a grid where rows are rings (outer ring at top) and columns are files.
 */
export const printBitboard = (bb: Bitboard): void => {
    console.log('Bitboard:');
    // Print from outer ring (RINGS-1) down to inner ring (0)
    for (let r = RINGS - 1; r >= 0; r--) {
        let rowStr = `Ring ${r}: `;
        for (let f = 0; f < FILES; f++) {
            // Calculate index for (r, f) manually to avoid circular dependency if possible,
            // but using topology is cleaner. Assuming standard mapping: index = r * FILES + f
            const index = r * FILES + f;
            rowStr += getBit(bb, index) ? '1 ' : '. ';
        }
        console.log(rowStr);
    }
    console.log('       ' + Array.from({ length: FILES }, (_, i) => i.toString(16)).join(' '));
};
