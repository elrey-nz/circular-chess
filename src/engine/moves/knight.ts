import { FILES, RINGS } from '../types';
import type { Bitboard, GameMode } from '../types';
import { toIndex, normalizeFile, isValidRing, toCoord } from '../topology';
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

export const getKnightAttacks = (square: number, mode: GameMode = 'standard'): Bitboard => {
    // In citadel mode, reverse radial direction
    if (mode === 'citadel') {
        const { ring, file } = toCoord(square);
        let attacks = 0n;
        const offsets = [
            { dr: -1, df: 2 }, { dr: -1, df: -2 }, // Reversed radial
            { dr: 1, df: 2 }, { dr: 1, df: -2 }, // Reversed radial
            { dr: -2, df: 1 }, { dr: -2, df: -1 }, // Reversed radial
            { dr: 2, df: 1 }, { dr: 2, df: -1 }, // Reversed radial
        ];
        for (const { dr, df } of offsets) {
            const nr = ring + dr;
            const nf = normalizeFile(file + df);
            if (isValidRing(nr)) {
                attacks = setBit(attacks, toIndex(nr, nf));
            }
        }
        return attacks;
    }
    return knightAttacks[square];
};
