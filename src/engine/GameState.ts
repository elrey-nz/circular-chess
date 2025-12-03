import { TOTAL_SQUARES } from './types';
import type { Color, GameState, GameMode, PieceType } from './types';
import { setBit, clearBit } from './bitboard';
import { toIndex } from './topology';

export const createEmptyGameState = (mode: GameMode = 'standard'): GameState => {
    return {
        board: new Array(TOTAL_SQUARES).fill(null),
        turn: 'white',
        mode,
        citadelSquares: 0n,
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
    // Byzantine / Circular Chess Setup
    // White occupies Files 14, 15, 0, 1 (rotated counterclockwise)
    // Black occupies Files 6, 7, 8, 9 (rotated counterclockwise)

    // White Pieces (Files 15, 0)
    // File 15: King (Inner) -> Rook (Outer)
    addPiece(gs, 'white', 'king', 0, 15);
    addPiece(gs, 'white', 'bishop', 1, 15);
    addPiece(gs, 'white', 'knight', 2, 15);
    addPiece(gs, 'white', 'rook', 3, 15);

    // File 0: Queen (Inner) -> Rook (Outer)
    addPiece(gs, 'white', 'queen', 0, 0);
    addPiece(gs, 'white', 'bishop', 1, 0);
    addPiece(gs, 'white', 'knight', 2, 0);
    addPiece(gs, 'white', 'rook', 3, 0);

    // White Pawns (Files 14, 1 - Flanking)
    for (let r = 0; r < 4; r++) {
        addPiece(gs, 'white', 'pawn', r, 14);
        addPiece(gs, 'white', 'pawn', r, 1);
    }

    // Black Pieces (Files 7, 8)
    // File 7: King (Inner) -> Rook (Outer) - Facing White King
    addPiece(gs, 'black', 'king', 0, 7);
    addPiece(gs, 'black', 'bishop', 1, 7);
    addPiece(gs, 'black', 'knight', 2, 7);
    addPiece(gs, 'black', 'rook', 3, 7);

    // File 8: Queen (Inner) -> Rook (Outer)
    addPiece(gs, 'black', 'queen', 0, 8);
    addPiece(gs, 'black', 'bishop', 1, 8);
    addPiece(gs, 'black', 'knight', 2, 8);
    addPiece(gs, 'black', 'rook', 3, 8);

    // Black Pawns (Files 6, 9 - Flanking)
    for (let r = 0; r < 4; r++) {
        addPiece(gs, 'black', 'pawn', r, 6);
        addPiece(gs, 'black', 'pawn', r, 9);
    }
};

// Modern Circular Chess Setup
// Directly copied from shatranj starting positions
export const setupModernBoard = (gs: GameState): void => {
    // Byzantine / Circular Chess Setup
    // White occupies Files 14, 15, 0, 1 (rotated counterclockwise)
    // Black occupies Files 6, 7, 8, 9 (rotated counterclockwise)

    // White Pieces (Files 15, 0)
    // File 15: King (Inner) -> Rook (Outer)
    addPiece(gs, 'white', 'king', 0, 15);
    addPiece(gs, 'white', 'bishop', 1, 15);
    addPiece(gs, 'white', 'knight', 2, 15);
    addPiece(gs, 'white', 'rook', 3, 15);

    // File 0: Queen (Inner) -> Rook (Outer)
    addPiece(gs, 'white', 'queen', 0, 0);
    addPiece(gs, 'white', 'bishop', 1, 0);
    addPiece(gs, 'white', 'knight', 2, 0);
    addPiece(gs, 'white', 'rook', 3, 0);

    // White Pawns (Files 14, 1 - Flanking)
    for (let r = 0; r < 4; r++) {
        addPiece(gs, 'white', 'pawn', r, 14);
        addPiece(gs, 'white', 'pawn', r, 1);
    }

    // Black Pieces (Files 7, 8)
    // File 7: King (Inner) -> Rook (Outer) - Facing White King
    addPiece(gs, 'black', 'king', 0, 7);
    addPiece(gs, 'black', 'bishop', 1, 7);
    addPiece(gs, 'black', 'knight', 2, 7);
    addPiece(gs, 'black', 'rook', 3, 7);

    // File 8: Queen (Inner) -> Rook (Outer)
    addPiece(gs, 'black', 'queen', 0, 8);
    addPiece(gs, 'black', 'bishop', 1, 8);
    addPiece(gs, 'black', 'knight', 2, 8);
    addPiece(gs, 'black', 'rook', 3, 8);

    // Black Pawns (Files 6, 9 - Flanking)
    for (let r = 0; r < 4; r++) {
        addPiece(gs, 'black', 'pawn', r, 6);
        addPiece(gs, 'black', 'pawn', r, 9);
    }
};

// Citadel Chess Setup
// Based on historical circular chess variant with citadel spaces in the center circle
// Citadels are now in the center circle (striped quarters), not on ring 0
// Ring 0 squares are all normal playable squares
export const setupCitadelBoard = (gs: GameState): void => {
    // Citadel squares are now in the center circle, not on ring 0
    // No ring 0 squares are marked as citadel anymore

    // Citadel chess has a reversed starting setup from shatranj
    // King is at the farthest radius (outermost ring, ring 3)
    // Pieces are arranged in reverse order: Rooks innermost, then knights, bishops, queen, king outermost

    // White side (Files 15, 0, 1, 2) - rotated counterclockwise
    // Ring 0 (innermost): Rooks
    addPiece(gs, 'white', 'rook', 0, 15);
    addPiece(gs, 'white', 'rook', 0, 0);
    
    // Ring 1: Knights
    addPiece(gs, 'white', 'knight', 1, 15);
    addPiece(gs, 'white', 'knight', 1, 0);
    
    // Ring 2: Bishops
    addPiece(gs, 'white', 'bishop', 2, 15);
    addPiece(gs, 'white', 'bishop', 2, 0);
    
    // Ring 3 (outermost): King and Queen
    addPiece(gs, 'white', 'king', 3, 15);
    addPiece(gs, 'white', 'queen', 3, 0);
    
    // Pawns flanking (Files 14, 1)
    for (let r = 0; r < 4; r++) {
        addPiece(gs, 'white', 'pawn', r, 14);
        addPiece(gs, 'white', 'pawn', r, 1);
    }

    // Black side (Files 7, 8, 9, 10) - opposite side, rotated counterclockwise
    // Ring 0 (innermost): Rooks
    addPiece(gs, 'black', 'rook', 0, 7);
    addPiece(gs, 'black', 'rook', 0, 8);
    
    // Ring 1: Knights
    addPiece(gs, 'black', 'knight', 1, 7);
    addPiece(gs, 'black', 'knight', 1, 8);
    
    // Ring 2: Bishops
    addPiece(gs, 'black', 'bishop', 2, 7);
    addPiece(gs, 'black', 'bishop', 2, 8);
    
    // Ring 3 (outermost): King and Queen
    addPiece(gs, 'black', 'king', 3, 7);
    addPiece(gs, 'black', 'queen', 3, 8);
    
    // Pawns flanking (Files 6, 9)
    for (let r = 0; r < 4; r++) {
        addPiece(gs, 'black', 'pawn', r, 6);
        addPiece(gs, 'black', 'pawn', r, 9);
    }
};

const addPiece = (gs: GameState, color: Color, type: PieceType, ring: number, file: number) => {
    const sq = toIndex(ring, file);
    if (sq === -1) return;

    gs.board[sq] = { color, type };
    gs.pieces[color][type] = setBit(gs.pieces[color][type], sq);
    gs.occupancy[color] = setBit(gs.occupancy[color], sq);
    gs.allOccupancy = setBit(gs.allOccupancy, sq);
};

export const initialGameState = (mode: GameMode = 'standard'): GameState => {
    const gs = createEmptyGameState(mode);
    if (mode === 'citadel') {
        setupCitadelBoard(gs);
    } else if (mode === 'modern') {
        setupModernBoard(gs);
    } else {
        setupStandardBoard(gs);
    }
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
        mode: gameState.mode,
        citadelSquares: gameState.citadelSquares,
        isDraw: gameState.isDraw,
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

    // Note: In citadel mode, kings cannot move to citadel squares (blocked in move generation)

    return newGameState;
};
