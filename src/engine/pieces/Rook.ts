import { Piece, type GameStateForPieces } from './Piece';
import type { Color } from '../types';
import { Bitboard } from '../Bitboard';
import { Coordinate, CoordinateUtils } from '../Coordinate';
import { FILES, RINGS } from '../types';

export class Rook extends Piece {
    constructor(color: Color) {
        super(color, 'rook');
    }

    getMoves(coord: Coordinate, gameState: GameStateForPieces): Bitboard {
        // Rooks only have attacks, no separate moves
        return Bitboard.empty();
    }

    getAttacks(coord: Coordinate, gameState: GameStateForPieces): Bitboard {
        const { ring, file } = coord;
        const { mode, allOccupancy } = gameState;

        let attacks = Bitboard.empty();

        // Clockwise along the ring
        for (let i = 1; i < FILES; i++) {
            const targetFile = CoordinateUtils.normalizeFile(file + i);
            if (targetFile === file) break;

            const targetCoord = new Coordinate(ring, targetFile);
            const targetIndex = targetCoord.toIndex();
            if (targetIndex === -1) break;

            attacks = attacks.or(Bitboard.fromIndex(targetIndex));
            if (allOccupancy.getBit(targetIndex)) break;
        }

        // Counter-clockwise along the ring
        for (let i = 1; i < FILES; i++) {
            const targetFile = CoordinateUtils.normalizeFile(file - i);
            if (targetFile === file) break;

            const targetCoord = new Coordinate(ring, targetFile);
            const targetIndex = targetCoord.toIndex();
            if (targetIndex === -1) break;

            attacks = attacks.or(Bitboard.fromIndex(targetIndex));
            if (allOccupancy.getBit(targetIndex)) break;
        }

        // Radial movement - reversed in citadel mode
        if (mode === 'citadel') {
            // Outward (toward center in reversed mode)
            for (let r = ring - 1; r >= 0; r--) {
                const targetCoord = new Coordinate(r, file);
                const targetIndex = targetCoord.toIndex();
                if (targetIndex === -1) break;

                attacks = attacks.or(Bitboard.fromIndex(targetIndex));
                if (allOccupancy.getBit(targetIndex)) break;
            }
            // Inward (away from center in reversed mode)
            for (let r = ring + 1; r < RINGS; r++) {
                const targetCoord = new Coordinate(r, file);
                const targetIndex = targetCoord.toIndex();
                if (targetIndex === -1) break;

                attacks = attacks.or(Bitboard.fromIndex(targetIndex));
                if (allOccupancy.getBit(targetIndex)) break;
            }
        } else {
            // Inward
            for (let r = ring - 1; r >= 0; r--) {
                const targetCoord = new Coordinate(r, file);
                const targetIndex = targetCoord.toIndex();
                if (targetIndex === -1) break;

                attacks = attacks.or(Bitboard.fromIndex(targetIndex));
                if (allOccupancy.getBit(targetIndex)) break;
            }
            // Outward
            for (let r = ring + 1; r < RINGS; r++) {
                const targetCoord = new Coordinate(r, file);
                const targetIndex = targetCoord.toIndex();
                if (targetIndex === -1) break;

                attacks = attacks.or(Bitboard.fromIndex(targetIndex));
                if (allOccupancy.getBit(targetIndex)) break;
            }
        }

        return attacks;
    }

    clone(): Piece {
        return new Rook(this.color);
    }
}

