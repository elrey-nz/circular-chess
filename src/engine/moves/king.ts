import { FILES, RINGS } from '../types';
import type { Bitboard } from '../types';
import { toIndex, normalizeFile, isValidRing } from '../topology';
import { setBit } from '../bitboard';

const kingAttacks: Bitboard[] = new Array(RINGS * FILES).fill(0n);

const initKingAttacks = () => {
    for (let r = 0; r < RINGS; r++) {
        for (let f = 0; f < FILES; f++) {
            const sq = toIndex(r, f);
            let attacks = 0n;

            // Shah moves 1 square in any direction (orthogonal + diagonal)
            const offsets = [
                { dr: 1, df: 0 }, { dr: -1, df: 0 }, // Radial
                { dr: 0, df: 1 }, { dr: 0, df: -1 }, // File
                { dr: 1, df: 1 }, { dr: 1, df: -1 }, // Diagonal Out
                { dr: -1, df: 1 }, { dr: -1, df: -1 }, // Diagonal In
            ];

            for (const { dr, df } of offsets) {
                const nr = r + dr;
                const nf = normalizeFile(f + df);
                if (isValidRing(nr)) {
                    attacks = setBit(attacks, toIndex(nr, nf));
                }
            }

            kingAttacks[sq] = attacks;
        }
    }
};

initKingAttacks();

export const getKingAttacks = (square: number): Bitboard => {
    return kingAttacks[square];
};
