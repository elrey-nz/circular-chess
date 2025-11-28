import { FILES, RINGS } from '../types';
import type { Bitboard } from '../types';
import { toCoord, toIndex, normalizeFile } from '../topology';
import { setBit } from '../bitboard';

// Precalculated attack tables for Rooks
const rookAttacks: Bitboard[] = new Array(RINGS * FILES).fill(0n);

const initRookAttacks = () => {
    for (let r = 0; r < RINGS; r++) {
        for (let f = 0; f < FILES; f++) {
            const sq = toIndex(r, f);
            let attacks = 0n;

            // File movement (continuous circle)
            // A rook can move to any other square on the same ring
            for (let nf = 0; nf < FILES; nf++) {
                if (nf !== f) {
                    attacks = setBit(attacks, toIndex(r, nf));
                }
            }

            // Ring movement (bounded radial)
            // Inward
            for (let nr = r - 1; nr >= 0; nr--) {
                attacks = setBit(attacks, toIndex(nr, f));
            }
            // Outward
            for (let nr = r + 1; nr < RINGS; nr++) {
                attacks = setBit(attacks, toIndex(nr, f));
            }

            rookAttacks[sq] = attacks;
        }
    }
};

// Initialize once
initRookAttacks();

export const getRookAttacks = (square: number, occupancy: Bitboard): Bitboard => {
    // Simplified for now: doesn't account for blocking pieces yet.
    // Full implementation needs magic bitboards or similar for blocking.
    // For Shatranj/Circular, blocking is standard.
    // Re-implementing with blocking logic on the fly for simplicity first,
    // or use precalculated rays if performance needed later.

    let attacks = 0n;
    const { ring, file } = toCoord(square);

    // Clockwise
    for (let i = 1; i < FILES; i++) {
        const target = toIndex(ring, normalizeFile(file + i));
        attacks = setBit(attacks, target);
        if ((occupancy & (1n << BigInt(target))) !== 0n) break;
    }
    // Counter-clockwise
    for (let i = 1; i < FILES; i++) {
        const target = toIndex(ring, normalizeFile(file - i));
        // Avoid double counting if full circle is empty, but loop break handles it.
        // Actually, if empty, it overlaps with clockwise at FILES/2 distance.
        // Standard chess bitboards handle this with rays.
        // Simplest: just add bit, if it was already added by CW it's fine (OR operation).
        // BUT blocking is directional.
        // Need distinct CW and CCW loops.
        // The check `if (target bit is set in attacks already)` might be needed to stop
        // if we wrapped all the way around?
        // Actually, standard loop `i < FILES` works, but need to stop *before* self if empty?
        // A rook on an empty ring attacks FILES-1 squares.

        // Re-think: standard ray casting
        attacks = setBit(attacks, target);
        if ((occupancy & (1n << BigInt(target))) !== 0n) break;
    }

    // Inward
    for (let r = ring - 1; r >= 0; r--) {
        const target = toIndex(r, file);
        attacks = setBit(attacks, target);
        if ((occupancy & (1n << BigInt(target))) !== 0n) break;
    }

    // Outward
    for (let r = ring + 1; r < RINGS; r++) {
        const target = toIndex(r, file);
        attacks = setBit(attacks, target);
        if ((occupancy & (1n << BigInt(target))) !== 0n) break;
    }

    return attacks;
};

// Actually, the CW/CCW loops above might double-count the opposite side if empty.
// E.g. 16 files. From file 0, CW reaches 8, CCW reaches 8.
// If file 8 is empty, both loops might try to go past it?
// No, `normalizeFile(file + i)` with `i` from 1 to FILES-1 covers all.
// Wait, if it's a full circle, a rook can reach ANY square on the ring if empty.
// If blocked, it can reach up to the blocker in both directions.
// Correct loop for circular file:
export const getRookFileAttacks = (ring: number, file: number, occupancy: Bitboard): Bitboard => {
    let attacks = 0n;
    // Clockwise
    for (let i = 1; i < FILES; i++) {
        const targetFile = normalizeFile(file + i);
        // If we've wrapped around to the start (shouldn't happen with i < FILES, but good sanity check)
        if (targetFile === file) break;

        const target = toIndex(ring, targetFile);
        attacks = setBit(attacks, target);
        if ((occupancy & (1n << BigInt(target))) !== 0n) break;
    }
    // Counter-clockwise
    for (let i = 1; i < FILES; i++) {
        const targetFile = normalizeFile(file - i);
        if (targetFile === file) break;

        const target = toIndex(ring, targetFile);
        // If this square was already attacked by CW ray, it means we met on the other side.
        // In a purely empty board, they meet at FILES/2.
        // If we don't stop, we might "go through" the meeting point.
        // Actually, if they meet, that square is attacked from both sides.
        // Standard bitwise OR handles the "already attacked" case fine.
        // THE ISSUE is blocking: if CW is blocked at file+2, CCW should be able to reach file+3?
        // NO, they are distinct rays.
        // The only tricky case is when they meet.
        // If FILES=16. From 0. CW goes 1, 2... 8. CCW goes 15, 14... 8.
        // Square 8 is attacked by both if empty.
        // If 8 is occupied, it blocks both? Yes.
        // My loops above: CW goes 1..15. CCW goes 1..15.
        // They will overlap significantly if empty.
        // We need to stop when they meet or overlap.
        // Simplest: just let them overlap, `attacks |= ...` handles it.
        // BUT, if CW reaches square X, and CCW reaches square X, it's fine.
        // What if CW is blocked at 2? It attacks 1, 2.
        // CCW should be able to go 15, 14... 3.
        // Yes, separate loops works.
        // Just need to ensure we don't go PAST the start square from the other side.
        // `targetFile === file` check handles that.

        // WAIT. If I go CW 15 steps, I reach file-1.
        // If I go CCW 1 step, I reach file-1.
        // They overlap perfectly.
        // We only need to go FILES/2 in each direction?
        // No, if blocked at file+1, CCW must be able to go all the way around to file+2.
        // So both must be able to go full circle (FILES-1 steps).
        // AND we must ensure we don't double-process if they meet?
        // Actually it doesn't hurt to double-set a bit.
        // The break condition `targetFile === file` is enough to stop infinite loops,
        // but `i < FILES` already guarantees that.

        // REAL ISSUE: If I go CW and hit a blocker at file+8.
        // CCW goes and hits SAME blocker at file+8.
        // Both loops break. Correct.
        // What if no blocker?
        // CW sets all bits. CCW sets all bits. Result is correct (full ring attacked).

        attacks = setBit(attacks, target);
        if ((occupancy & (1n << BigInt(target))) !== 0n) break;
    }
    return attacks;
}
