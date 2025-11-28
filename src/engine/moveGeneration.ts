import type { Bitboard, GameState } from './types';
import { getPawnMoves, getPawnAttacks } from './moves/pawn';
import { getRookAttacks } from './moves/rook';
import { getKnightAttacks } from './moves/knight';
import { getBishopAttacks } from './moves/bishop';
import { getQueenAttacks } from './moves/queen';
import { getKingAttacks } from './moves/king';

export const getLegalMoves = (gameState: GameState, square: number): Bitboard => {
    const piece = gameState.board[square];
    if (!piece || piece.color !== gameState.turn) return 0n;

    let moves = 0n;
    const { type, color } = piece;
    const us = gameState.occupancy[color];
    const them = gameState.occupancy[color === 'white' ? 'black' : 'white'];
    const all = gameState.allOccupancy;

    switch (type) {
        case 'pawn':
            moves = getPawnMoves(square, color, all);
            // Add attacks only if there's an enemy piece
            moves |= (getPawnAttacks(square, color) & them);
            break;
        case 'rook':
            moves = getRookAttacks(square, all);
            break;
        case 'knight':
            moves = getKnightAttacks(square);
            break;
        case 'bishop':
            moves = getBishopAttacks(square);
            break;
        case 'queen':
            moves = getQueenAttacks(square);
            break;
        case 'king':
            moves = getKingAttacks(square);
            break;
    }

    // Remove moves to squares occupied by friendly pieces (standard for all except pawns which already handled it mostly, but good to be safe)
    // Actually pawn non-attack moves already checked occupancy. Pawn attacks didn't.
    // For leapers/sliders, we need to mask out friendly pieces.
    if (type !== 'pawn') {
        moves &= ~us;
    }

    // TODO: Filter out moves that leave king in check (if strict Shatranj rules apply)

    return moves;
};
