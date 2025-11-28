import { FILES, RINGS } from './types';
import type { Square } from './types';

/**
 * Normalizes a file index to be within [0, FILES-1], handling wrap-around.
 * e.g., file -1 becomes 15 (if FILES=16).
 */
export const normalizeFile = (file: number): number => {
    return (file % FILES + FILES) % FILES;
};

/**
 * Checks if a ring is within valid bounds [0, RINGS-1].
 */
export const isValidRing = (ring: number): boolean => {
    return ring >= 0 && ring < RINGS;
};

/**
 * Checks if a square (ring, file) is valid.
 * Files are always valid due to wrapping, so this mainly checks the ring.
 */
export const isValidSquare = (ring: number, _file: number): boolean => {
    return isValidRing(ring);
};

/**
 * Converts a (ring, file) coordinate to a 1D index (0 to TOTAL_SQUARES-1).
 * Returns -1 if the ring is invalid.
 */
export const toIndex = (ring: number, file: number): number => {
    if (!isValidRing(ring)) return -1;
    return ring * FILES + normalizeFile(file);
};

/**
 * Converts a 1D index to a (ring, file) coordinate.
 */
export const toCoord = (index: number): Square => {
    return {
        ring: Math.floor(index / FILES),
        file: index % FILES,
    };
};
