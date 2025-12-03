import { Piece, type GameStateForPieces } from './Piece';
import type { Color } from '../types';
import { Bitboard } from '../Bitboard';
import { Coordinate, CoordinateUtils } from '../Coordinate';
import { FILES, RINGS, TOTAL_SQUARES } from '../types';

// Precalculated attack tables for Queens
let queenAttacks: Bitboard[] | null = null;

const initQueenAttacks = () => {
    if (queenAttacks !== null) return;
    queenAttacks = new Array(TOTAL_SQUARES).fill(Bitboard.empty());
    
    for (let r = 0; r < RINGS; r++) {
        for (let f = 0; f < FILES; f++) {
            const coord = new Coordinate(r, f);
            const sq = coord.toIndex();
            if (sq === -1) continue;

            let attacks = Bitboard.empty();

            // Fers moves 1 square diagonally: (r±1, f±1)
            const offsets = [
                { dr: 1, df: 1 }, { dr: 1, df: -1 },
                { dr: -1, df: 1 }, { dr: -1, df: -1 },
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

            queenAttacks[sq] = attacks;
        }
    }
};

export class Queen extends Piece {
    constructor(color: Color) {
        super(color, 'queen');
    }

    getMoves(_coord: Coordinate, _gameState: GameStateForPieces): Bitboard {
        // Queens only have attacks, no separate moves
        return Bitboard.empty();
    }

    getAttacks(coord: Coordinate, gameState: GameStateForPieces): Bitboard {
        const { ring, file } = coord;
        const { mode } = gameState;

        // In citadel mode, reverse radial direction
        if (mode === 'citadel') {
            let attacks = Bitboard.empty();
            const offsets = [
                { dr: -1, df: 1 }, { dr: -1, df: -1 }, // Reversed radial
                { dr: 1, df: 1 }, { dr: 1, df: -1 }, // Reversed radial
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
        initQueenAttacks();
        return queenAttacks![index];
    }

    clone(): Piece {
        return new Queen(this.color);
    }
}

