import { FILES, RINGS } from '../types';
import type { Bitboard, GameMode } from '../types';
import { toIndex, normalizeFile, isValidRing, toCoord } from '../topology';
import { setBit } from '../bitboard';

const bishopAttacks: Bitboard[] = new Array(RINGS * FILES).fill(0n);

const initBishopAttacks = () => {
    for (let r = 0; r < RINGS; r++) {
        for (let f = 0; f < FILES; f++) {
            const sq = toIndex(r, f);
            let attacks = 0n;

            // Alfil jumps exactly 2 squares diagonally: (r±2, f±2)
            const offsets = [
                { dr: 2, df: 2 }, { dr: 2, df: -2 },
                { dr: -2, df: 2 }, { dr: -2, df: -2 },
            ];

            for (const { dr, df } of offsets) {
                const nr = r + dr;
                const nf = normalizeFile(f + df);
                if (isValidRing(nr)) {
                    attacks = setBit(attacks, toIndex(nr, nf));
                }
            }

            bishopAttacks[sq] = attacks;
        }
    }
};

initBishopAttacks();

export const getBishopAttacks = (square: number, mode: GameMode = 'standard'): Bitboard => {
    // In citadel mode, reverse radial direction (swap +2/-2 for ring)
    if (mode === 'citadel') {
        const { ring, file } = toCoord(square);
        let attacks = 0n;
        const offsets = [
            { dr: -2, df: 2 }, { dr: -2, df: -2 }, // Reversed radial
            { dr: 2, df: 2 }, { dr: 2, df: -2 }, // Reversed radial
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
    return bishopAttacks[square];
};
