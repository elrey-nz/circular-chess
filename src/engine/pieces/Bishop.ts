import { Piece, type GameStateForPieces } from './Piece';
import type { Color } from '../types';
import { Bitboard } from '../Bitboard';
import { Coordinate, CoordinateUtils } from '../Coordinate';
import { FILES, RINGS, TOTAL_SQUARES } from '../types';

// Precalculated attack tables for Bishops
let bishopAttacks: Bitboard[] | null = null;

const initBishopAttacks = () => {
    if (bishopAttacks !== null) return;
    bishopAttacks = new Array(TOTAL_SQUARES).fill(Bitboard.empty());
    
    for (let r = 0; r < RINGS; r++) {
        for (let f = 0; f < FILES; f++) {
            const coord = new Coordinate(r, f);
            const sq = coord.toIndex();
            if (sq === -1) continue;

            let attacks = Bitboard.empty();

            // Alfil jumps exactly 2 squares diagonally: (r±2, f±2)
            const offsets = [
                { dr: 2, df: 2 }, { dr: 2, df: -2 },
                { dr: -2, df: 2 }, { dr: -2, df: -2 },
            ];

            for (const { dr, df } of offsets) {
                const nr = r + dr;
                const nf = CoordinateUtils.normalizeFile(f + df);
                if (CoordinateUtils.isValidRing(nr)) {
                    const targetCoord = new Coordinate(nr, nf);
                    const targetIndex = targetCoord.toIndex();
                    if (targetIndex !== -1) {
                        attacks = attacks.or(Bitboard.fromIndex(targetIndex));
                    }
                }
            }

            bishopAttacks[sq] = attacks;
        }
    }
};

export class Bishop extends Piece {
    constructor(color: Color) {
        super(color, 'bishop');
    }

    getMoves(_coord: Coordinate, _gameState: GameStateForPieces): Bitboard {
        // Bishops only have attacks, no separate moves
        return Bitboard.empty();
    }

    getAttacks(coord: Coordinate, gameState: GameStateForPieces): Bitboard {
        const { ring, file } = coord;
        const { mode } = gameState;

        // In citadel mode, reverse radial direction (swap +2/-2 for ring)
        if (mode === 'citadel') {
            let attacks = Bitboard.empty();
            const offsets = [
                { dr: -2, df: 2 }, { dr: -2, df: -2 }, // Reversed radial
                { dr: 2, df: 2 }, { dr: 2, df: -2 }, // Reversed radial
            ];
            for (const { dr, df } of offsets) {
                const nr = ring + dr;
                const nf = CoordinateUtils.normalizeFile(file + df);
                if (CoordinateUtils.isValidRing(nr)) {
                    const targetCoord = new Coordinate(nr, nf);
                    const targetIndex = targetCoord.toIndex();
                    if (targetIndex !== -1) {
                        attacks = attacks.or(Bitboard.fromIndex(targetIndex));
                    }
                }
            }
            return attacks;
        }

        const index = coord.toIndex();
        if (index === -1) return Bitboard.empty();
        initBishopAttacks();
        return bishopAttacks![index];
    }

    clone(): Piece {
        return new Bishop(this.color);
    }
}

