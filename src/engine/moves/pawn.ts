
import type { Bitboard, Color } from '../types';
import { toIndex, normalizeFile, isValidRing, toCoord } from '../topology';
import { setBit, getBit } from '../bitboard';

export const getPawnMoves = (square: number, color: Color, occupancy: Bitboard): Bitboard => {
    let moves = 0n;
    const { ring, file } = toCoord(square);

    // Direction: White moves CW (+1 file), Black moves CCW (-1 file)
    const df = color === 'white' ? 1 : -1;
    const targetFile = normalizeFile(file + df);

    // 1. Normal Move (forward along the ring)
    const forwardSq = toIndex(ring, targetFile);
    if (!getBit(occupancy, forwardSq)) {
        moves = setBit(moves, forwardSq);
    }

    // Shatranj pawns don't have a double initial move.

    return moves;
};

export const getPawnAttacks = (square: number, color: Color): Bitboard => {
    let attacks = 0n;
    const { ring, file } = toCoord(square);

    const df = color === 'white' ? 1 : -1;
    const targetFile = normalizeFile(file + df);

    // Captures diagonally forward: change ring AND move forward along file
    const attackRing1 = ring + 1;
    const attackRing2 = ring - 1;

    if (isValidRing(attackRing1)) {
        attacks = setBit(attacks, toIndex(attackRing1, targetFile));
    }
    if (isValidRing(attackRing2)) {
        attacks = setBit(attacks, toIndex(attackRing2, targetFile));
    }

    return attacks;
};
