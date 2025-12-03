import type { Color, PieceType, GameMode } from '../types';
import { Bitboard } from '../Bitboard';
import { Coordinate } from '../Coordinate';
import { getChessPieceSvg } from '../../utils/chessPieceCache';

/**
 * Forward declaration - will be replaced by GameState class
 * Pieces need access to mode, occupancy, and allOccupancy
 */
export interface GameStateForPieces {
    mode: GameMode;
    occupancy: Record<Color, Bitboard>;
    allOccupancy: Bitboard;
}

/**
 * Abstract base class for all chess pieces.
 * Each piece has a color, type, and SVG representation.
 */
export abstract class Piece {
    readonly color: Color;
    readonly type: PieceType;
    private _svg: string | null = null;
    private _svgLoading: Promise<string> | null = null;

    constructor(color: Color, type: PieceType) {
        this.color = color;
        this.type = type;
    }

    /**
     * Get the SVG data URL for this piece.
     * Loads from cache or downloads if not already loaded.
     */
    async getSvg(): Promise<string> {
        if (this._svg) {
            return this._svg;
        }

        if (this._svgLoading) {
            return this._svgLoading;
        }

        this._svgLoading = getChessPieceSvg(this.color, this.type).then((svg) => {
            this._svg = svg;
            this._svgLoading = null;
            return svg;
        });

        return this._svgLoading;
    }

    /**
     * Get the SVG synchronously if already loaded, null otherwise
     */
    getSvgSync(): string | null {
        return this._svg;
    }

    /**
     * Get non-attacking moves for this piece from the given coordinate.
     * For pawns, this includes forward moves. For other pieces, this may return empty.
     */
    abstract getMoves(coord: Coordinate, gameState: GameStateForPieces): Bitboard;

    /**
     * Get attacking moves for this piece from the given coordinate.
     * For most pieces, this is the same as all possible moves.
     * For pawns, this is separate from getMoves().
     */
    abstract getAttacks(coord: Coordinate, gameState: GameStateForPieces): Bitboard;

    /**
     * Check if this piece equals another (same color and type)
     */
    equals(other: Piece): boolean {
        return this.color === other.color && this.type === other.type;
    }

    /**
     * Create a copy of this piece
     */
    clone(): Piece {
        // Subclasses will override this
        throw new Error('clone() must be implemented by subclass');
    }
}

