import { TOTAL_SQUARES } from './types';
import type { Color, GameState, PieceType } from './types';
import { setBit, clearBit } from './bitboard';
import { toIndex } from './topology';

export const createEmptyGameState = (): GameState => {
    return {
        board: new Array(TOTAL_SQUARES).fill(null),
        turn: 'white',
        pieces: {
            white: { pawn: 0n, rook: 0n, knight: 0n, bishop: 0n, queen: 0n, king: 0n },
            black: { pawn: 0n, rook: 0n, knight: 0n, bishop: 0n, queen: 0n, king: 0n },
        },
        occupancy: { white: 0n, black: 0n },
        allOccupancy: 0n,
    };
};

// Standard Circular Chess / Shatranj setup (approximate, needs verification of exact standard)
// Assuming:
// Ring 0 (innermost): Empty? Or main pieces?
// Ring 3 (outermost): Pawns?
// Need a definitive setup. KIs didn't specify.
// Common circular: 4 rings.
// Outer ring (3): White Pawns?
// Ring 2: White Pieces?
// Ring 1: Black Pieces?
// Inner ring (0): Black Pawns?
// OR split by halves.
// Let's assume split by halves for now as it's common for 4x16.
// Files 0-7: White side? Files 8-15: Black side?
// Actually, 4 rings, 16 files.
// Usually it's two opposite sides.
// White at files 0,1, 14,15?
// Let's go with a simple symmetric setup for now and refine later.
// White on Ring 0, Files 0-7? No, that's a quarter.
// Let's try: White on Rings 0 & 1, Black on Rings 2 & 3?
// No, they need to meet.
// Standard is often:
// White pieces on Ring 0, Files 4-11. Pawns on Ring 1, Files 4-11.
// Black pieces on Ring 3, Files 4-11. Pawns on Ring 2, Files 4-11.
// Wait, 16 files.
// Let's use a setup where they face each other across the center?
// Or face each other along the files?
// "Unfurled version of the board" -> sounds like standard 8x8 bent into a cylinder.
// If 4 rings x 16 files = 64 squares.
// It's exactly an 8x8 board.
// Maybe it's just standard chess wrapped?
// If so, Ring = Rank, File = File.
// Ranks 0-7, Files 0-7.
// Wrapping files means File 0 is next to File 7?
// 4x16 is different.
// Let's stick to 4 rings, 16 files.
// Setup:
// White Rooks at (0,0), (0,15)?
// Let's place them opposite.
// White at Files 0-3?
// Need user input on exact setup if standard isn't clear.
// For now, implementing a placeholder setup.

export const setupStandardBoard = (gs: GameState): void => {
    // PLACEHOLDER SETUP - needs verification
    // White pieces on Ring 0, Files 6,7,8,9
    // Black pieces on Ring 3, Files 6,7,8,9

    // Just put Kings for testing
    addPiece(gs, 'white', 'king', 0, 8);
    addPiece(gs, 'black', 'king', 3, 8);

    // Rooks
    addPiece(gs, 'white', 'rook', 0, 0);
    addPiece(gs, 'black', 'rook', 3, 0);

    // Pawns to test captures
    addPiece(gs, 'white', 'pawn', 1, 8);
    addPiece(gs, 'black', 'pawn', 2, 8);
};

const addPiece = (gs: GameState, color: Color, type: PieceType, ring: number, file: number) => {
    const sq = toIndex(ring, file);
    if (sq === -1) return;

    gs.board[sq] = { color, type };
    gs.pieces[color][type] = setBit(gs.pieces[color][type], sq);
    gs.occupancy[color] = setBit(gs.occupancy[color], sq);
    gs.allOccupancy = setBit(gs.allOccupancy, sq);
};

export const initialGameState = (): GameState => {
    const gs = createEmptyGameState();
    setupStandardBoard(gs);
    return gs;
};

export const makeMove = (gameState: GameState, from: number, to: number): GameState => {
    // Deep copy game state (simplest for React state immutability, though slow for engine)
    // For a real engine, we'd use undo-move, but for React app, copying is safer.
    // JSON.parse/stringify is slow but easy for deep copy of simple objects.
    // Bitints need special handling if we use JSON.
    // Better to manual copy or use a library, but let's try manual for critical parts.

    const newGameState: GameState = {
        board: [...gameState.board],
        turn: gameState.turn === 'white' ? 'black' : 'white',
        pieces: {
            white: { ...gameState.pieces.white },
            black: { ...gameState.pieces.black },
        },
        occupancy: {
            white: gameState.occupancy.white,
            black: gameState.occupancy.black,
        },
        allOccupancy: gameState.allOccupancy,
    };

    const movingPiece = newGameState.board[from];
    if (!movingPiece) return gameState; // Should not happen if move is legal

    // Handle capture
    const targetPiece = newGameState.board[to];
    if (targetPiece) {
        newGameState.pieces[targetPiece.color][targetPiece.type] = clearBit(newGameState.pieces[targetPiece.color][targetPiece.type], to);
        newGameState.occupancy[targetPiece.color] = clearBit(newGameState.occupancy[targetPiece.color], to);
    }

    // Move piece
    newGameState.board[to] = movingPiece;
    newGameState.board[from] = null;

    const color = movingPiece.color;
    const type = movingPiece.type;

    // Update bitboards for moving piece
    newGameState.pieces[color][type] = clearBit(newGameState.pieces[color][type], from);
    newGameState.pieces[color][type] = setBit(newGameState.pieces[color][type], to);
    newGameState.occupancy[color] = clearBit(newGameState.occupancy[color], from);
    newGameState.occupancy[color] = setBit(newGameState.occupancy[color], to);

    // Update all occupancy
    newGameState.allOccupancy = newGameState.occupancy.white | newGameState.occupancy.black;

    return newGameState;
};
