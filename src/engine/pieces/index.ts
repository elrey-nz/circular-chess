export { Piece, type GameStateForPieces } from './Piece';
export { Pawn } from './Pawn';
export { Rook } from './Rook';
export { Knight } from './Knight';
export { Bishop } from './Bishop';
export { Queen } from './Queen';
export { King } from './King';

/**
 * Factory function to create a piece instance from color and type
 */
import type { Color, PieceType } from '../types';
import { Piece } from './Piece';
import { Pawn } from './Pawn';
import { Rook } from './Rook';
import { Knight } from './Knight';
import { Bishop } from './Bishop';
import { Queen } from './Queen';
import { King } from './King';

export function createPiece(color: Color, type: PieceType): Piece {
    switch (type) {
        case 'pawn':
            return new Pawn(color);
        case 'rook':
            return new Rook(color);
        case 'knight':
            return new Knight(color);
        case 'bishop':
            return new Bishop(color);
        case 'queen':
            return new Queen(color);
        case 'king':
            return new King(color);
    }
}

