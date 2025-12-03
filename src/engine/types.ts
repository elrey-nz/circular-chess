export type Color = 'white' | 'black';

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export type GameMode = 'standard' | 'citadel' | 'modern';

export const RINGS = 4;
export const FILES = 16;
export const TOTAL_SQUARES = RINGS * FILES;

// Re-export classes for convenience
export { Piece } from './pieces/Piece';
export { Coordinate } from './Coordinate';
export { Bitboard } from './Bitboard';
export { Board } from './Board';
export { GameState } from './GameState';
export { MoveGenerator } from './MoveGenerator';
