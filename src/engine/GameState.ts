import { Board } from './Board';
import { Bitboard } from './Bitboard';
import { Coordinate } from './Coordinate';
import type { Color, GameMode } from './types';
import { createPiece } from './pieces';

/**
 * GameState class manages the entire game state including board, turn, mode, and citadel squares.
 * All operations return new GameState instances (immutable).
 */
export class GameState {
    readonly board: Board;
    readonly turn: Color;
    readonly mode: GameMode;
    readonly citadelSquares: Bitboard;
    readonly isDraw?: boolean;

    constructor(
        board: Board,
        turn: Color = 'white',
        mode: GameMode = 'standard',
        citadelSquares: Bitboard = Bitboard.empty(),
        isDraw?: boolean
    ) {
        this.board = board;
        this.turn = turn;
        this.mode = mode;
        this.citadelSquares = citadelSquares;
        this.isDraw = isDraw;
    }

    /**
     * Create an empty game state
     */
    static createEmpty(mode: GameMode = 'standard'): GameState {
        const board = new Board();
        return new GameState(board, 'white', mode, Bitboard.empty());
    }

    /**
     * Create a game state with standard board setup
     */
    static setupStandard(mode: GameMode = 'standard'): GameState {
        const gs = GameState.createEmpty(mode);
        return gs.setupStandardBoard();
    }

    /**
     * Create a game state with modern board setup
     */
    static setupModern(mode: GameMode = 'modern'): GameState {
        const gs = GameState.createEmpty(mode);
        return gs.setupModernBoard();
    }

    /**
     * Create a game state with citadel board setup
     */
    static setupCitadel(): GameState {
        const gs = GameState.createEmpty('citadel');
        return gs.setupCitadelBoard();
    }

    /**
     * Create initial game state based on mode
     */
    static initial(mode: GameMode = 'standard'): GameState {
        if (mode === 'citadel') {
            return GameState.setupCitadel();
        } else if (mode === 'modern') {
            return GameState.setupModern(mode);
        } else {
            return GameState.setupStandard(mode);
        }
    }

    /**
     * Setup standard board (Byzantine / Circular Chess Setup)
     */
    private setupStandardBoard(): GameState {
        const newBoard = this.board.clone();

        // White Pieces (Files 15, 0)
        // File 15: King (Inner) -> Rook (Outer)
        newBoard.setPiece(new Coordinate(0, 15), createPiece('white', 'king'));
        newBoard.setPiece(new Coordinate(1, 15), createPiece('white', 'bishop'));
        newBoard.setPiece(new Coordinate(2, 15), createPiece('white', 'knight'));
        newBoard.setPiece(new Coordinate(3, 15), createPiece('white', 'rook'));

        // File 0: Queen (Inner) -> Rook (Outer)
        newBoard.setPiece(new Coordinate(0, 0), createPiece('white', 'queen'));
        newBoard.setPiece(new Coordinate(1, 0), createPiece('white', 'bishop'));
        newBoard.setPiece(new Coordinate(2, 0), createPiece('white', 'knight'));
        newBoard.setPiece(new Coordinate(3, 0), createPiece('white', 'rook'));

        // White Pawns (Files 14, 1 - Flanking)
        for (let r = 0; r < 4; r++) {
            newBoard.setPiece(new Coordinate(r, 14), createPiece('white', 'pawn'));
            newBoard.setPiece(new Coordinate(r, 1), createPiece('white', 'pawn'));
        }

        // Black Pieces (Files 7, 8)
        // File 7: King (Inner) -> Rook (Outer) - Facing White King
        newBoard.setPiece(new Coordinate(0, 7), createPiece('black', 'king'));
        newBoard.setPiece(new Coordinate(1, 7), createPiece('black', 'bishop'));
        newBoard.setPiece(new Coordinate(2, 7), createPiece('black', 'knight'));
        newBoard.setPiece(new Coordinate(3, 7), createPiece('black', 'rook'));

        // File 8: Queen (Inner) -> Rook (Outer)
        newBoard.setPiece(new Coordinate(0, 8), createPiece('black', 'queen'));
        newBoard.setPiece(new Coordinate(1, 8), createPiece('black', 'bishop'));
        newBoard.setPiece(new Coordinate(2, 8), createPiece('black', 'knight'));
        newBoard.setPiece(new Coordinate(3, 8), createPiece('black', 'rook'));

        // Black Pawns (Files 6, 9 - Flanking)
        for (let r = 0; r < 4; r++) {
            newBoard.setPiece(new Coordinate(r, 6), createPiece('black', 'pawn'));
            newBoard.setPiece(new Coordinate(r, 9), createPiece('black', 'pawn'));
        }

        return new GameState(newBoard, this.turn, this.mode, this.citadelSquares, this.isDraw);
    }

    /**
     * Setup modern board (same as standard for now)
     */
    private setupModernBoard(): GameState {
        // Modern is the same as standard for now
        return this.setupStandardBoard();
    }

    /**
     * Setup citadel board
     */
    private setupCitadelBoard(): GameState {
        const newBoard = this.board.clone();

        // White side (Files 15, 0, 1, 2) - rotated counterclockwise
        // Ring 0 (innermost): Rooks
        newBoard.setPiece(new Coordinate(0, 15), createPiece('white', 'rook'));
        newBoard.setPiece(new Coordinate(0, 0), createPiece('white', 'rook'));

        // Ring 1: Knights
        newBoard.setPiece(new Coordinate(1, 15), createPiece('white', 'knight'));
        newBoard.setPiece(new Coordinate(1, 0), createPiece('white', 'knight'));

        // Ring 2: Bishops
        newBoard.setPiece(new Coordinate(2, 15), createPiece('white', 'bishop'));
        newBoard.setPiece(new Coordinate(2, 0), createPiece('white', 'bishop'));

        // Ring 3 (outermost): King and Queen
        newBoard.setPiece(new Coordinate(3, 15), createPiece('white', 'king'));
        newBoard.setPiece(new Coordinate(3, 0), createPiece('white', 'queen'));

        // Pawns flanking (Files 14, 1)
        for (let r = 0; r < 4; r++) {
            newBoard.setPiece(new Coordinate(r, 14), createPiece('white', 'pawn'));
            newBoard.setPiece(new Coordinate(r, 1), createPiece('white', 'pawn'));
        }

        // Black side (Files 7, 8, 9, 10) - opposite side, rotated counterclockwise
        // Ring 0 (innermost): Rooks
        newBoard.setPiece(new Coordinate(0, 7), createPiece('black', 'rook'));
        newBoard.setPiece(new Coordinate(0, 8), createPiece('black', 'rook'));

        // Ring 1: Knights
        newBoard.setPiece(new Coordinate(1, 7), createPiece('black', 'knight'));
        newBoard.setPiece(new Coordinate(1, 8), createPiece('black', 'knight'));

        // Ring 2: Bishops
        newBoard.setPiece(new Coordinate(2, 7), createPiece('black', 'bishop'));
        newBoard.setPiece(new Coordinate(2, 8), createPiece('black', 'bishop'));

        // Ring 3 (outermost): King and Queen
        newBoard.setPiece(new Coordinate(3, 7), createPiece('black', 'king'));
        newBoard.setPiece(new Coordinate(3, 8), createPiece('black', 'queen'));

        // Pawns flanking (Files 6, 9)
        for (let r = 0; r < 4; r++) {
            newBoard.setPiece(new Coordinate(r, 6), createPiece('black', 'pawn'));
            newBoard.setPiece(new Coordinate(r, 9), createPiece('black', 'pawn'));
        }

        return new GameState(newBoard, this.turn, this.mode, this.citadelSquares, this.isDraw);
    }

    /**
     * Make a move from one coordinate to another, returning a new GameState
     */
    makeMove(from: Coordinate, to: Coordinate): GameState {
        const movingPiece = this.board.getPiece(from);
        if (!movingPiece || movingPiece.color !== this.turn) {
            return this; // Invalid move, return unchanged
        }

        const newBoard = this.board.clone();

        // Handle capture
        const targetPiece = newBoard.getPiece(to);
        if (targetPiece) {
            newBoard.removePiece(to);
        }

        // Move piece
        newBoard.removePiece(from);
        newBoard.setPiece(to, movingPiece);

        // Switch turn
        const newTurn: Color = this.turn === 'white' ? 'black' : 'white';

        return new GameState(newBoard, newTurn, this.mode, this.citadelSquares, this.isDraw);
    }

    /**
     * Make a move from indices (for backward compatibility)
     */
    makeMoveFromIndices(fromIndex: number, toIndex: number): GameState {
        const from = Coordinate.fromIndex(fromIndex);
        const to = Coordinate.fromIndex(toIndex);
        return this.makeMove(from, to);
    }

    /**
     * Get the current player's color
     */
    getCurrentPlayer(): Color {
        return this.turn;
    }

    /**
     * Switch turn (returns new GameState)
     */
    switchTurn(): GameState {
        const newTurn: Color = this.turn === 'white' ? 'black' : 'white';
        return new GameState(this.board, newTurn, this.mode, this.citadelSquares, this.isDraw);
    }

    /**
     * Check if the game is a draw
     */
    isGameDraw(): boolean {
        return this.isDraw === true;
    }

    /**
     * Get occupancy for a specific color (for piece move generation)
     */
    getOccupancy(color: Color): Bitboard {
        return this.board.getOccupancy(color);
    }

    /**
     * Get all occupancy (for piece move generation)
     */
    getAllOccupancy(): Bitboard {
        return this.board.getAllOccupancy();
    }

    /**
     * Convert to the interface format expected by pieces (for move generation)
     */
    toPieceGameState(): {
        mode: GameMode;
        occupancy: Record<Color, Bitboard>;
        allOccupancy: Bitboard;
    } {
        return {
            mode: this.mode,
            occupancy: {
                white: this.board.getOccupancy('white'),
                black: this.board.getOccupancy('black'),
            },
            allOccupancy: this.board.getAllOccupancy(),
        };
    }
}
