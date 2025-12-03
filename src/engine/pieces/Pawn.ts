import { Piece, type GameStateForPieces } from './Piece';
import type { Color } from '../types';
import { Bitboard } from '../Bitboard';
import { Coordinate, CoordinateUtils } from '../Coordinate';
import { FILES } from '../types';

export class Pawn extends Piece {
    constructor(color: Color) {
        super(color, 'pawn');
    }

    getMoves(coord: Coordinate, gameState: GameStateForPieces): Bitboard {
        const { ring, file } = coord;
        const { color } = this;
        const { mode, allOccupancy } = gameState;

        // Direction based on board side: left side (files 8-15) moves CCW (-1), right side (files 0-7) moves CW (+1)
        // Black right-hand side pawns move anticlockwise (-1)
        // In citadel mode, direction is based on color: white moves toward black, black moves toward white
        let df: number;
        if (mode === 'citadel') {
            // In citadel mode, white pawns move toward black side (files 7-10), black pawns move toward white side (files 15,0,1,2)
            // White pawns: from files 14,1 toward files 7-10 -> file 14 goes CCW (-1), file 1 goes CW (+1)
            // Black pawns: from files 6,9 toward files 15,0,1,2 -> file 6 goes CCW (-1), file 9 goes CW (+1)
            // So white and black move in opposite directions based on their color
            df = color === 'white' ? -1 : 1; // White moves CCW, black moves CW
        } else {
            const isLeftSide = file >= FILES / 2; // Files 8-15 are left side
            if (isLeftSide) {
                df = -1; // Left side: counterclockwise (-1)
            } else {
                // Right side: white moves clockwise (+1), black moves anticlockwise (-1)
                df = color === 'white' ? 1 : -1;
            }
        }
        const targetFile = CoordinateUtils.normalizeFile(file + df);

        // 1. Normal Move (forward along the ring)
        const forwardCoord = new Coordinate(ring, targetFile);
        const forwardIndex = forwardCoord.toIndex();
        if (forwardIndex !== -1 && !allOccupancy.getBit(forwardIndex)) {
            return Bitboard.fromIndex(forwardIndex);
        }

        // Shatranj pawns don't have a double initial move.
        return Bitboard.empty();
    }

    getAttacks(coord: Coordinate, gameState: GameStateForPieces): Bitboard {
        const { ring, file } = coord;
        const { color } = this;
        const { mode } = gameState;

        // Direction based on board side: left side (files 8-15) moves CCW (-1), right side (files 0-7) moves CW (+1)
        // Black right-hand side pawns move anticlockwise (-1)
        // In citadel mode, directions are reversed
        const isLeftSide = file >= FILES / 2; // Files 8-15 are left side
        let df: number;
        if (mode === 'citadel') {
            df = isLeftSide ? -1 : 1; // Left side: counterclockwise (-1), Right side: clockwise (+1)
            df = -df; // Reverse direction
        } else {
            if (isLeftSide) {
                df = -1; // Left side: counterclockwise (-1)
            } else {
                // Right side: white moves clockwise (+1), black moves anticlockwise (-1)
                df = color === 'white' ? 1 : -1;
            }
        }
        const targetFile = CoordinateUtils.normalizeFile(file + df);

        // Captures diagonally forward: change ring AND move forward along file
        // In citadel mode, radial direction is reversed
        let attackRing1 = ring + 1;
        let attackRing2 = ring - 1;
        if (mode === 'citadel') {
            // Swap: outer becomes inner, inner becomes outer
            [attackRing1, attackRing2] = [attackRing2, attackRing1];
        }

        let attacks = Bitboard.empty();
        if (CoordinateUtils.isValidRing(attackRing1)) {
            const attackCoord1 = new Coordinate(attackRing1, targetFile);
            const index1 = attackCoord1.toIndex();
            if (index1 !== -1) {
                attacks = attacks.or(Bitboard.fromIndex(index1));
            }
        }
        if (CoordinateUtils.isValidRing(attackRing2)) {
            const attackCoord2 = new Coordinate(attackRing2, targetFile);
            const index2 = attackCoord2.toIndex();
            if (index2 !== -1) {
                attacks = attacks.or(Bitboard.fromIndex(index2));
            }
        }

        return attacks;
    }

    clone(): Piece {
        return new Pawn(this.color);
    }
}

