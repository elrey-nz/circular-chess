import { useState } from 'react';
import { RINGS, FILES } from '../engine/types';
import type { GameState } from '../engine/types';
import { toIndex } from '../engine/topology';
import { getLegalMoves } from '../engine/moveGeneration';
import { getBit } from '../engine/bitboard';

interface CircularBoardProps {
    gameState: GameState;
    onMove: (from: number, to: number) => void;
}

const PIECE_UNICODE: Record<string, Record<string, string>> = {
    white: {
        king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙',
    },
    black: {
        king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟',
    },
};

const CircularBoard = ({ gameState, onMove }: CircularBoardProps) => {
    const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
    const [legalMoves, setLegalMoves] = useState<bigint>(0n);

    // SVG Viewbox settings
    const SIZE = 1000;
    const CENTER = SIZE / 2;
    const MAX_RADIUS = SIZE * 0.45; // Leave some padding
    const HOLE_RADIUS = SIZE * 0.1; // Inner empty space

    // Calculate ring radii
    const ringStep = (MAX_RADIUS - HOLE_RADIUS) / RINGS;
    const getRingRadius = (ring: number) => HOLE_RADIUS + ring * ringStep;

    // Helper to get cartesian coordinates for a square center
    const getSquareCenter = (ring: number, file: number) => {
        const innerR = getRingRadius(ring);
        const outerR = getRingRadius(ring + 1);
        const centerR = (innerR + outerR) / 2;

        // Files are wedges. Center of file f is at (f + 0.5) * angleStep
        const angleStep = 360 / FILES;
        const angleDeg = (file + 0.5) * angleStep;
        const angleRad = (angleDeg * Math.PI) / 180;

        return {
            x: CENTER + centerR * Math.cos(angleRad),
            y: CENTER + centerR * Math.sin(angleRad),
        };
    };

    const handleSquareClick = (ring: number, file: number) => {
        const sq = toIndex(ring, file);
        if (sq === -1) return;

        if (selectedSquare === sq) {
            // Deselect
            setSelectedSquare(null);
            setLegalMoves(0n);
        } else if (selectedSquare !== null && getBit(legalMoves, sq)) {
            // Move to legal square
            onMove(selectedSquare, sq);
            setSelectedSquare(null);
            setLegalMoves(0n);
        } else if (gameState.board[sq]?.color === gameState.turn) {
            // Select friendly piece
            setSelectedSquare(sq);
            setLegalMoves(getLegalMoves(gameState, sq));
        } else {
            // Clicked empty or enemy square (and not a legal move)
            setSelectedSquare(null);
            setLegalMoves(0n);
        }
    };

    // Generate rings (circles)
    const rings = [];
    for (let r = 0; r <= RINGS; r++) {
        rings.push(
            <circle
                key={`ring-${r}`}
                cx={CENTER}
                cy={CENTER}
                r={getRingRadius(r)}
                fill="none"
                stroke="#525252" // neutral-600
                strokeWidth="2"
            />
        );
    }

    // Generate file lines (radial)
    const fileLines = [];
    for (let f = 0; f < FILES; f++) {
        const angleDeg = (f * 360) / FILES;
        const angleRad = (angleDeg * Math.PI) / 180;

        const x1 = CENTER + HOLE_RADIUS * Math.cos(angleRad);
        const y1 = CENTER + HOLE_RADIUS * Math.sin(angleRad);
        const x2 = CENTER + MAX_RADIUS * Math.cos(angleRad);
        const y2 = CENTER + MAX_RADIUS * Math.sin(angleRad);

        fileLines.push(
            <line
                key={`file-${f}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#525252" // neutral-600
                strokeWidth="2"
            />
        );
    }

    // Generate clickable areas (wedges/arcs)
    const clickAreas = [];
    for (let r = 0; r < RINGS; r++) {
        for (let f = 0; f < FILES; f++) {
            const sq = toIndex(r, f);
            const isSelected = selectedSquare === sq;
            const isLegalMove = getBit(legalMoves, sq);

            // Calculate path for the wedge segment
            const innerR = getRingRadius(r);
            const outerR = getRingRadius(r + 1);
            const startAngle = (f * 360) / FILES;
            const endAngle = ((f + 1) * 360) / FILES;

            // Convert polar to cartesian for path definition
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = CENTER + innerR * Math.cos(startRad);
            const y1 = CENTER + innerR * Math.sin(startRad);
            const x2 = CENTER + outerR * Math.cos(startRad);
            const y2 = CENTER + outerR * Math.sin(startRad);
            const x3 = CENTER + outerR * Math.cos(endRad);
            const y3 = CENTER + outerR * Math.sin(endRad);
            const x4 = CENTER + innerR * Math.cos(endRad);
            const y4 = CENTER + innerR * Math.sin(endRad);

            // SVG Arc flag: 0 for small arc, 1 for large arc (>180deg)
            const largeArc = endAngle - startAngle > 180 ? 1 : 0;

            const pathData = [
                `M ${x1} ${y1}`,
                `L ${x2} ${y2}`,
                `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3}`,
                `L ${x4} ${y4}`,
                `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1}`,
                'Z',
            ].join(' ');

            clickAreas.push(
                <path
                    key={`sq-${sq}`}
                    d={pathData}
                    fill={isSelected ? 'rgba(255, 255, 0, 0.5)' : isLegalMove ? 'rgba(0, 255, 0, 0.3)' : 'transparent'}
                    stroke="none"
                    className="cursor-pointer hover:fill-white/10"
                    onClick={() => handleSquareClick(r, f)}
                />
            );
        }
    }

    return (
        <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="w-full h-full"
            style={{ transform: 'rotate(-90deg)' }} // Rotate so File 0 is at top (or bottom depending on preference)
        >
            {/* Board background */}
            <circle cx={CENTER} cy={CENTER} r={MAX_RADIUS} fill="#171717" /* neutral-900 */ />
            <circle cx={CENTER} cy={CENTER} r={HOLE_RADIUS} fill="#0a0a0a" /* neutral-950 (hole) */ />

            {/* Grid */}
            <g>{rings}</g>
            <g>{fileLines}</g>

            {/* Interactive Areas & Highlights */}
            <g>{clickAreas}</g>

            {/* Pieces */}
            <g>
                {gameState.board.map((piece, index) => {
                    if (!piece) return null;
                    const ring = Math.floor(index / FILES);
                    const file = index % FILES;
                    const { x, y } = getSquareCenter(ring, file);

                    return (
                        <text
                            key={`piece-${index}`}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={ringStep * 0.6}
                            className="select-none pointer-events-none"
                            fill={piece.color === 'white' ? '#ffffff' : '#9ca3af'} // White vs neutral-400
                            style={{
                                // Rotate text back so it's upright relative to the screen, OR let it rotate with board.
                                // If board is rotated -90deg, we need to counter-rotate pieces if we want them upright.
                                // Actually, let's just let them be oriented radially for now, looks cooler.
                                // Or standard: upright.
                                transformBox: 'fill-box',
                                transformOrigin: 'center',
                                transform: `rotate(${90}deg)`, // Counteract the parent SVG rotation to keep upright?
                                // Wait, parent SVG has rotate(-90deg).
                                // If we want pieces upright, we need rotate(90deg) relative to SVG space.
                            }}
                        >
                            {PIECE_UNICODE[piece.color][piece.type]}
                        </text>
                    );
                })}
            </g>
        </svg>
    );
};

export default CircularBoard;
