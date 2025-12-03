import { Piece } from './pieces/Piece';
import { Bitboard } from './Bitboard';
import { Coordinate } from './Coordinate';
import type { Color, PieceType, TOTAL_SQUARES } from './types';
import { TOTAL_SQUARES as TOTAL_SQUARES_CONST } from './types';

/**
 * Board class manages the chess board state, including piece positions
 * and bitboards for efficient move generation.
 */
export class Board {
    private squares: (Piece | null)[];
    private pieces: Record<Color, Record<PieceType, Bitboard>>;
    private occupancy: Record<Color, Bitboard>;

    constructor() {
        this.squares = new Array(TOTAL_SQUARES_CONST).fill(null);
        this.pieces = {
            white: {
                pawn: Bitboard.empty(),
                rook: Bitboard.empty(),
                knight: Bitboard.empty(),
                bishop: Bitboard.empty(),
                queen: Bitboard.empty(),
                king: Bitboard.empty(),
            },
            black: {
                pawn: Bitboard.empty(),
                rook: Bitboard.empty(),
                knight: Bitboard.empty(),
                bishop: Bitboard.empty(),
                queen: Bitboard.empty(),
                king: Bitboard.empty(),
            },
        };
        this.occupancy = {
            white: Bitboard.empty(),
            black: Bitboard.empty(),
        };
    }

    /**
     * Create a copy of this board
     */
    clone(): Board {
        const newBoard = new Board();
        newBoard.squares = [...this.squares];
        newBoard.pieces = {
            white: {
                pawn: this.pieces.white.pawn,
                rook: this.pieces.white.rook,
                knight: this.pieces.white.knight,
                bishop: this.pieces.white.bishop,
                queen: this.pieces.white.queen,
                king: this.pieces.white.king,
            },
            black: {
                pawn: this.pieces.black.pawn,
                rook: this.pieces.black.rook,
                knight: this.pieces.black.knight,
                bishop: this.pieces.black.bishop,
                queen: this.pieces.black.queen,
                king: this.pieces.black.king,
            },
        };
        newBoard.occupancy = {
            white: this.occupancy.white,
            black: this.occupancy.black,
        };
        return newBoard;
    }

    /**
     * Get the piece at the given coordinate, or null if empty
     */
    getPiece(coord: Coordinate): Piece | null {
        const index = coord.toIndex();
        if (index === -1) return null;
        return this.squares[index];
    }

    /**
     * Get the piece at the given index, or null if empty
     */
    getPieceByIndex(index: number): Piece | null {
        if (index < 0 || index >= TOTAL_SQUARES_CONST) return null;
        return this.squares[index];
    }

    /**
     * Set a piece at the given coordinate
     */
    setPiece(coord: Coordinate, piece: Piece | null): void {
        const index = coord.toIndex();
        if (index === -1) return;

        // Remove existing piece if any
        const existingPiece = this.squares[index];
        if (existingPiece) {
            this.removePiece(coord);
        }

        // Set new piece
        this.squares[index] = piece;
        if (piece) {
            const bitboard = Bitboard.fromIndex(index);
            this.pieces[piece.color][piece.type] = this.pieces[piece.color][piece.type].or(bitboard);
            this.occupancy[piece.color] = this.occupancy[piece.color].or(bitboard);
        }
    }

    /**
     * Remove a piece from the given coordinate
     */
    removePiece(coord: Coordinate): void {
        const index = coord.toIndex();
        if (index === -1) return;

        const piece = this.squares[index];
        if (!piece) return;

        const bitboard = Bitboard.fromIndex(index);
        this.pieces[piece.color][piece.type] = this.pieces[piece.color][piece.type].and(bitboard.not());
        this.occupancy[piece.color] = this.occupancy[piece.color].and(bitboard.not());
        this.squares[index] = null;
    }

    /**
     * Check if a square is empty
     */
    isEmpty(coord: Coordinate): boolean {
        return this.getPiece(coord) === null;
    }

    /**
     * Get the bitboard for pieces of a specific color and type
     */
    getPieces(color: Color, type: PieceType): Bitboard {
        return this.pieces[color][type];
    }

    /**
     * Get the occupancy bitboard for a specific color
     */
    getOccupancy(color: Color): Bitboard {
        return this.occupancy[color];
    }

    /**
     * Get the combined occupancy bitboard for all pieces
     */
    getAllOccupancy(): Bitboard {
        return this.occupancy.white.or(this.occupancy.black);
    }

    /**
     * Get all squares as an array (for rendering)
     */
    getSquares(): (Piece | null)[] {
        return this.squares;
    }

    /**
     * Clear the entire board
     */
    clear(): void {
        this.squares = new Array(TOTAL_SQUARES_CONST).fill(null);
        this.pieces = {
            white: {
                pawn: Bitboard.empty(),
                rook: Bitboard.empty(),
                knight: Bitboard.empty(),
                bishop: Bitboard.empty(),
                queen: Bitboard.empty(),
                king: Bitboard.empty(),
            },
            black: {
                pawn: Bitboard.empty(),
                rook: Bitboard.empty(),
                knight: Bitboard.empty(),
                bishop: Bitboard.empty(),
                queen: Bitboard.empty(),
                king: Bitboard.empty(),
            },
        };
        this.occupancy = {
            white: Bitboard.empty(),
            black: Bitboard.empty(),
        };
    }
}

