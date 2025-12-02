import { useState, useEffect } from 'react';
import { RINGS, FILES } from '../engine/types';
import type { GameState } from '../engine/types';
import { toIndex } from '../engine/topology';
import { getLegalMoves } from '../engine/moveGeneration';
import { getBit } from '../engine/bitboard';
import { BOARD_THEMES, type BoardThemeName } from '../types/boardTheme';
import { getChessPieceSvg, preloadChessPieces } from '../utils/chessPieceCache';
import type { Color, PieceType } from '../engine/types';

interface CircularBoardProps {
    gameState: GameState;
    onMove: (from: number, to: number) => void;
    theme?: BoardThemeName;
}

const CircularBoard = ({ gameState, onMove, theme = 'dark' }: CircularBoardProps) => {
    const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
    const [legalMoves, setLegalMoves] = useState<bigint>(0n);
    const [pieceSvgs, setPieceSvgs] = useState<Record<string, Record<string, string>>>({});
    const [piecesLoaded, setPiecesLoaded] = useState(false);
    const boardTheme = BOARD_THEMES[theme];

    // Load chess piece SVGs from cache or download them
    useEffect(() => {
        const loadPieces = async () => {
            try {
                // Preload all pieces
                await preloadChessPieces();

                // Load all piece SVGs into state
                const colors: Color[] = ['white', 'black'];
                const types: PieceType[] = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];

                const svgMap: Record<string, Record<string, string>> = {};

                for (const color of colors) {
                    svgMap[color] = {};
                    for (const type of types) {
                        svgMap[color][type] = await getChessPieceSvg(color, type);
                    }
                }

                setPieceSvgs(svgMap);
                setPiecesLoaded(true);
            } catch (error) {
                console.error('Failed to load chess pieces:', error);
            }
        };

        loadPieces();
    }, []);

    // SVG Viewbox settings
    const SIZE = 1000;
    const CENTER = SIZE / 2;
    const MAX_RADIUS = SIZE * 0.45; // Leave some padding
    const HOLE_RADIUS = SIZE * 0.1; // Inner empty space
    const ROTATION_OFFSET = -2; // Counter-clockwise offset to correct board alignment (degrees)

    // Calculate ring radii
    const ringStep = (MAX_RADIUS - HOLE_RADIUS) / RINGS;
    const getRingRadius = (ring: number) => HOLE_RADIUS + ring * ringStep;

    // Calculate the size of the smallest square (innermost ring, ring 0)
    // The smallest square is constrained by:
    // 1. Radial dimension: ringStep
    // 2. Angular dimension at inner edge: (360/FILES) * PI/180 * HOLE_RADIUS
    const angleStepRad = (360 / FILES) * (Math.PI / 180);
    const smallestRadialWidth = ringStep;
    const smallestAngularWidth = angleStepRad * HOLE_RADIUS;
    // Use the smaller constraint to ensure piece fits in smallest space
    const maxPieceSize = Math.min(smallestRadialWidth, smallestAngularWidth) * 0.9; // 0.9 for padding

    // Helper to get cartesian coordinates for a square center
    const getSquareCenter = (ring: number, file: number) => {
        const innerR = getRingRadius(ring);
        const outerR = getRingRadius(ring + 1);
        const centerR = (innerR + outerR) / 2;

        // Files are wedges. Center of file f is at (f + 0.5) * angleStep
        const angleStep = 360 / FILES;
        const angleDeg = (file + 0.5) * angleStep + ROTATION_OFFSET;
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
                stroke={boardTheme.gridColor}
                strokeWidth="2"
            />
        );
    }

    // Generate file lines (radial)
    const fileLines = [];
    for (let f = 0; f < FILES; f++) {
        const angleDeg = (f * 360) / FILES + ROTATION_OFFSET;
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
                stroke={boardTheme.gridColor}
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
            // Citadel squares are no longer on ring 0 - they're in the center circle

            // Calculate path for the wedge segment
            const innerR = getRingRadius(r);
            const outerR = getRingRadius(r + 1);
            const startAngle = (f * 360) / FILES + ROTATION_OFFSET;
            const endAngle = ((f + 1) * 360) / FILES + ROTATION_OFFSET;

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

            // Determine square color (checkerboard pattern)
            const isLightSquare = (r + f) % 2 === 0;
            const baseColor = isLightSquare ? boardTheme.lightSquare : boardTheme.darkSquare;

            // Calculate fill color with priority: selected > legal move > base color
            let fillColor = baseColor;
            if (isSelected) {
                fillColor = boardTheme.selectedSquare;
            } else if (isLegalMove) {
                fillColor = boardTheme.legalMove;
            }

            clickAreas.push(
                <path
                    key={`sq-${sq}`}
                    d={pathData}
                    fill={fillColor}
                    stroke="none"
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={(e) => {
                        if (!isSelected && !isLegalMove) {
                            e.currentTarget.style.opacity = '0.8';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                    }}
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
            <circle cx={CENTER} cy={CENTER} r={MAX_RADIUS} fill={boardTheme.boardBackground} />

            {/* Center hole - only two quarters are holes, other two show board background */}
            {gameState.mode !== 'citadel' && (() => {
                const quarterAngle = 90; // 90 degrees per quarter
                const baseAngle = ROTATION_OFFSET - 45; // Rotated 45 degrees anticlockwise

                // Define 4 quarters starting from baseAngle
                // Quarter 0: 0-90° (facing white at ~0°)
                // Quarter 1: 90-180° (between white and black) -> HOLE
                // Quarter 2: 180-270° (facing black at ~190°)
                // Quarter 3: 270-360° (between black and white) -> HOLE
                const holeQuarters = [1, 3]; // Quarters 1 and 3 are holes

                return [0, 1, 2, 3].map((i) => {
                    const angleStart = baseAngle + i * quarterAngle;
                    const angleEnd = angleStart + quarterAngle;
                    const angleStartRad = (angleStart * Math.PI) / 180;
                    const angleEndRad = (angleEnd * Math.PI) / 180;

                    const x1 = CENTER + HOLE_RADIUS * Math.cos(angleStartRad);
                    const y1 = CENTER + HOLE_RADIUS * Math.sin(angleStartRad);
                    const x2 = CENTER + HOLE_RADIUS * Math.cos(angleEndRad);
                    const y2 = CENTER + HOLE_RADIUS * Math.sin(angleEndRad);

                    const largeArc = quarterAngle > 180 ? 1 : 0;
                    const quarterPath = `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${HOLE_RADIUS} ${HOLE_RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    const isHole = holeQuarters.includes(i);

                    return (
                        <path
                            key={`center-quarter-${i}`}
                            d={quarterPath}
                            fill={isHole ? boardTheme.boardHole : boardTheme.boardBackground}
                            style={{
                                filter: isHole ? 'drop-shadow(inset 0 0 4px rgba(0, 0, 0, 0.3))' : 'none',
                            }}
                        />
                    );
                });
            })()}

            {/* Citadel center quarters (4 quarters of the center hole for citadel chess mode) */}
            {gameState.mode === 'citadel' && (() => {
                // White pieces start at files 15, 0, 1, 2 (centered around file 0, angle ~0°)
                // Black pieces start at files 7, 8, 9, 10 (centered around file 8.5, angle ~190°)
                // Center hole divided into 4 quarters (90 degrees each)
                // Quarter facing black pieces (around 180-270°): white
                // Quarter facing white pieces (around 0-90°): black
                // Remaining two quarters: citadel (striped/holes)

                const quarterAngle = 90; // 90 degrees per quarter
                // Start at 0 degrees (accounting for rotation offset), rotated 45 degrees anticlockwise
                const baseAngle = ROTATION_OFFSET - 45;

                // Define 4 quarters starting from baseAngle
                // Quarter 0: 0-90° (facing white at ~0°) -> black
                // Quarter 1: 90-180° (between white and black) -> citadel (hole)
                // Quarter 2: 180-270° (facing black at ~190°) -> white
                // Quarter 3: 270-360° (between black and white) -> citadel (hole)
                const quarters = [
                    { startAngle: baseAngle, type: 'black' },      // Facing white
                    { startAngle: baseAngle + 90, type: 'citadel' }, // Citadel hole
                    { startAngle: baseAngle + 180, type: 'white' }, // Facing black
                    { startAngle: baseAngle + 270, type: 'citadel' }, // Citadel hole
                ];

                return quarters.map((quarter, i) => {
                    const angleStart = quarter.startAngle;
                    const angleEnd = angleStart + quarterAngle;
                    const angleStartRad = (angleStart * Math.PI) / 180;
                    const angleEndRad = (angleEnd * Math.PI) / 180;

                    const x1 = CENTER + HOLE_RADIUS * Math.cos(angleStartRad);
                    const y1 = CENTER + HOLE_RADIUS * Math.sin(angleStartRad);
                    const x2 = CENTER + HOLE_RADIUS * Math.cos(angleEndRad);
                    const y2 = CENTER + HOLE_RADIUS * Math.sin(angleEndRad);

                    // Determine if we need large arc (for angles > 180)
                    const largeArc = quarterAngle > 180 ? 1 : 0;
                    const quarterPath = `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${HOLE_RADIUS} ${HOLE_RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    if (quarter.type === 'white') {
                        return (
                            <path
                                key={`quarter-${i}`}
                                d={quarterPath}
                                fill={boardTheme.lightSquare}
                                opacity={0.9}
                            />
                        );
                    } else if (quarter.type === 'black') {
                        return (
                            <path
                                key={`quarter-${i}`}
                                d={quarterPath}
                                fill={boardTheme.darkSquare}
                                opacity={0.9}
                            />
                        );
                    } else if (quarter.type === 'citadel') {
                        // Citadel quarters are shown as holes (blocked areas)
                        return (
                            <path
                                key={`quarter-${i}`}
                                d={quarterPath}
                                fill={boardTheme.boardHole}
                                style={{
                                    filter: 'drop-shadow(inset 0 0 4px rgba(0, 0, 0, 0.3))',
                                }}
                            />
                        );
                    }
                    return null;
                });
            })()}

            {/* Grid */}
            <g>{rings}</g>
            <g>{fileLines}</g>

            {/* Interactive Areas & Highlights */}
            <g>{clickAreas}</g>

            {/* Pieces */}
            {piecesLoaded && (
                <g>
                    {gameState.board.map((piece, index) => {
                        if (!piece) return null;
                        const ring = Math.floor(index / FILES);
                        const file = index % FILES;
                        const { x, y } = getSquareCenter(ring, file);
                        // Use maxPieceSize for all pieces to ensure they fit in the smallest space
                        const pieceSize = maxPieceSize;
                        const svgUrl = pieceSvgs[piece.color]?.[piece.type];

                        if (!svgUrl) return null;

                        return (
                            <image
                                key={`piece-${index}`}
                                href={svgUrl}
                                x={x - pieceSize / 2}
                                y={y - pieceSize / 2}
                                width={pieceSize}
                                height={pieceSize}
                                className="select-none pointer-events-none"
                                style={{
                                    transformBox: 'fill-box',
                                    transformOrigin: 'center',
                                    transform: `rotate(${90}deg)`, // Counteract the parent SVG rotation to keep pieces upright
                                }}
                            />
                        );
                    })}
                </g>
            )}
        </svg>
    );
};

export default CircularBoard;
