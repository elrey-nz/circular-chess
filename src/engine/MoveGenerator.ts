import { GameState } from './GameState';
import { Coordinate } from './Coordinate';
import { Bitboard } from './Bitboard';
import type { Color } from './types';

/**
 * MoveGenerator class encapsulates move generation logic.
 * Uses piece instance methods to generate moves and applies game rules filtering.
 */
export class MoveGenerator {
    /**
     * Get legal moves for a piece at the given coordinate
     */
    static getLegalMoves(gameState: GameState, coord: Coordinate): Bitboard {
        const piece = gameState.board.getPiece(coord);
        if (!piece || piece.color !== gameState.turn) {
            return Bitboard.empty();
        }

        const pieceGameState = gameState.toPieceGameState();
        let moves = Bitboard.empty();

        // Get moves based on piece type
        if (piece.type === 'pawn') {
            // Pawns have separate moves and attacks
            moves = piece.getMoves(coord, pieceGameState);
            // Add attacks only if there's an enemy piece
            const attacks = piece.getAttacks(coord, pieceGameState);
            const enemyOccupancy = gameState.getOccupancy(piece.color === 'white' ? 'black' : 'white');
            moves = moves.or(attacks.and(enemyOccupancy));
        } else {
            // Other pieces use getAttacks
            moves = piece.getAttacks(coord, pieceGameState);
        }

        // Remove moves to squares occupied by friendly pieces
        if (piece.type !== 'pawn') {
            const friendlyOccupancy = gameState.getOccupancy(piece.color);
            moves = moves.and(friendlyOccupancy.not());
        }

        // Block moves to citadel squares (king cannot move there, and they're blanked out)
        if (gameState.mode === 'citadel') {
            moves = moves.and(gameState.citadelSquares.not());
        }

        // TODO: Filter out moves that leave king in check (if strict Shatranj rules apply)

        return moves;
    }

    /**
     * Get legal moves for a piece at the given index (for backward compatibility)
     */
    static getLegalMovesFromIndex(gameState: GameState, squareIndex: number): Bitboard {
        const coord = Coordinate.fromIndex(squareIndex);
        return MoveGenerator.getLegalMoves(gameState, coord);
    }

    /**
     * Check if a move is legal
     */
    static isLegalMove(gameState: GameState, from: Coordinate, to: Coordinate): boolean {
        const legalMoves = MoveGenerator.getLegalMoves(gameState, from);
        const toIndex = to.toIndex();
        if (toIndex === -1) return false;
        return legalMoves.getBit(toIndex);
    }

    /**
     * Get all legal moves for the current player
     */
    static getAllLegalMoves(gameState: GameState): Map<Coordinate, Bitboard> {
        const moves = new Map<Coordinate, Bitboard>();
        const squares = gameState.board.getSquares();
        const currentColor = gameState.turn;

        for (let i = 0; i < squares.length; i++) {
            const piece = squares[i];
            if (piece && piece.color === currentColor) {
                const coord = Coordinate.fromIndex(i);
                const legalMoves = MoveGenerator.getLegalMoves(gameState, coord);
                if (!legalMoves.isEmpty()) {
                    moves.set(coord, legalMoves);
                }
            }
        }

        return moves;
    }
}

