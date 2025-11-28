export type Color = 'white' | 'black';

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

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
    // Bitboards for efficient move generation
    pieces: Record<Color, Record<PieceType, Bitboard>>;
    occupancy: Record<Color, Bitboard>;
    allOccupancy: Bitboard;
}
