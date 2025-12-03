// Constants to avoid circular dependency with types.ts
const FILES = 16;
const RINGS = 4;

/**
 * Represents a square on the circular chess board with ring and file coordinates.
 * Immutable coordinate class with conversion and validation methods.
 */
export class Coordinate {
    readonly ring: number;
    readonly file: number;

    constructor(ring: number, file: number) {
        this.ring = ring;
        this.file = this.normalizeFile(file);
    }

    /**
     * Create a Coordinate from a 1D index
     */
    static fromIndex(index: number): Coordinate {
        const ring = Math.floor(index / FILES);
        const file = index % FILES;
        return new Coordinate(ring, file);
    }

    /**
     * Normalize a file index to be within [0, FILES-1], handling wrap-around.
     * e.g., file -1 becomes 15 (if FILES=16).
     */
    private normalizeFile(file: number): number {
        return (file % FILES + FILES) % FILES;
    }

    /**
     * Normalize this coordinate, returning a new Coordinate with normalized file
     */
    normalize(): Coordinate {
        return new Coordinate(this.ring, this.file);
    }

    /**
     * Check if the ring is within valid bounds [0, RINGS-1]
     */
    isValidRing(): boolean {
        return this.ring >= 0 && this.ring < RINGS;
    }

    /**
     * Check if this coordinate is valid (ring is valid, file is always valid due to wrapping)
     */
    isValid(): boolean {
        return this.isValidRing();
    }

    /**
     * Convert this coordinate to a 1D index (0 to TOTAL_SQUARES-1).
     * Returns -1 if the ring is invalid.
     */
    toIndex(): number {
        if (!this.isValidRing()) return -1;
        return this.ring * FILES + this.file;
    }

    /**
     * Check if this coordinate equals another
     */
    equals(other: Coordinate): boolean {
        return this.ring === other.ring && this.file === other.file;
    }

    /**
     * Create a new coordinate with an offset
     */
    offset(ringOffset: number, fileOffset: number): Coordinate {
        return new Coordinate(this.ring + ringOffset, this.file + fileOffset);
    }

    /**
     * Convert to string representation
     */
    toString(): string {
        return `(${this.ring}, ${this.file})`;
    }
}

/**
 * Static utility functions for coordinate operations
 */
export class CoordinateUtils {
    /**
     * Normalize a file index to be within [0, FILES-1], handling wrap-around.
     */
    static normalizeFile(file: number): number {
        return (file % FILES + FILES) % FILES;
    }

    /**
     * Check if a ring is within valid bounds [0, RINGS-1]
     */
    static isValidRing(ring: number): boolean {
        return ring >= 0 && ring < RINGS;
    }

    /**
     * Check if a square (ring, file) is valid.
     */
    static isValidSquare(ring: number, _file: number): boolean {
        return CoordinateUtils.isValidRing(ring);
    }
}

