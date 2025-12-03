import { Piece, type GameStateForPieces } from './Piece';
import type { Color } from '../types';
import { Bitboard } from '../Bitboard';
import { Coordinate, CoordinateUtils } from '../Coordinate';
import { FILES, RINGS, TOTAL_SQUARES } from '../types';

// Precalculated attack tables for Kings
let kingAttacks: Bitboard[] | null = null;

const initKingAttacks = () => {
    if (kingAttacks !== null) return;
    kingAttacks = new Array(TOTAL_SQUARES).fill(Bitboard.empty());
    
    for (let r = 0; r < RINGS; r++) {
        for (let f = 0; f < FILES; f++) {
            const coord = new Coordinate(r, f);
            const sq = coord.toIndex();
            if (sq === -1) continue;

            let attacks = Bitboard.empty();

            // Shah moves 1 square in any direction (orthogonal + diagonal)
            const offsets = [
                { dr: 1, df: 0 }, { dr: -1, df: 0 }, // Radial
                { dr: 0, df: 1 }, { dr: 0, df: -1 }, // File
                { dr: 1, df: 1 }, { dr: 1, df: -1 }, // Diagonal Out
                { dr: -1, df: 1 }, { dr: -1, df: -1 }, // Diagonal In
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

            kingAttacks[sq] = attacks;
        }
    }
};

export class King extends Piece {
    constructor(color: Color) {
        super(color, 'king');
    }

    getMoves(_coord: Coordinate, _gameState: GameStateForPieces): Bitboard {
        // Kings only have attacks, no separate moves
        return Bitboard.empty();
    }

    getAttacks(coord: Coordinate, gameState: GameStateForPieces): Bitboard {
        const { ring, file } = coord;
        const { mode } = gameState;

        // In citadel mode, reverse radial direction
        if (mode === 'citadel') {
            let attacks = Bitboard.empty();
            const offsets = [
                { dr: -1, df: 0 }, { dr: 1, df: 0 }, // Reversed radial
                { dr: 0, df: 1 }, { dr: 0, df: -1 }, // File (unchanged)
                { dr: -1, df: 1 }, { dr: -1, df: -1 }, // Reversed radial diagonal
                { dr: 1, df: 1 }, { dr: 1, df: -1 }, // Reversed radial diagonal
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
        initKingAttacks();
        return kingAttacks![index];
    }

    clone(): Piece {
        return new King(this.color);
    }
}

