export type Color = 'white' | 'black';

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export type GameMode = 'standard' | 'citadel' | 'modern';

export interface Piece {
    color: Color;
    type: PieceType;
}

export interface Square {
    ring: number;
    file: number;
}

export type Bitboard = bigint;

export const RINGS = 4;
export const FILES = 16;
export const TOTAL_SQUARES = RINGS * FILES;

export type BoardState = (Piece | null)[];

export interface GameState {
    board: BoardState; // For rendering/easy access, synced with bitboards
    turn: Color;
    mode: GameMode;
    citadelSquares: Bitboard; // Bitboard of citadel squares (for citadel chess mode)
    isDraw?: boolean; // True if game ended in a draw (e.g., king reached citadel)
    // Bitboards for efficient move generation
    pieces: Record<Color, Record<PieceType, Bitboard>>;
    occupancy: Record<Color, Bitboard>;
    allOccupancy: Bitboard;
}
