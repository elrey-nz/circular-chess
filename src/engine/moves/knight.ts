import { FILES, RINGS } from '../types';
import type { Bitboard } from '../types';
import { toIndex, normalizeFile, isValidRing } from '../topology';
import { setBit } from '../bitboard';

const knightAttacks: Bitboard[] = new Array(RINGS * FILES).fill(0n);

const initKnightAttacks = () => {
    for (let r = 0; r < RINGS; r++) {
        for (let f = 0; f < FILES; f++) {
            const sq = toIndex(r, f);
            let attacks = 0n;

            // 8 possible knight moves: (r±1, f±2), (r±2, f±1)
            const offsets = [
                { dr: 1, df: 2 }, { dr: 1, df: -2 },
                { dr: -1, df: 2 }, { dr: -1, df: -2 },
                { dr: 2, df: 1 }, { dr: 2, df: -1 },
                { dr: -2, df: 1 }, { dr: -2, df: -1 },
            ];

            for (const { dr, df } of offsets) {
                const nr = r + dr;
                const nf = normalizeFile(f + df);
                if (isValidRing(nr)) {
                    attacks = setBit(attacks, toIndex(nr, nf));
                }
            }

            knightAttacks[sq] = attacks;
        }
    }
};

initKnightAttacks();

export const getKnightAttacks = (square: number): Bitboard => {
    return knightAttacks[square];
};
