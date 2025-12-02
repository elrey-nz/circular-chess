// Chess piece SVG cache utility
// Downloads SVGs from Wikipedia Commons and stores them in localStorage

const PIECE_URLS: Record<string, Record<string, string>> = {
    white: {
        king: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
        queen: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
        rook: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
        bishop: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
        knight: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
        pawn: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
    },
    black: {
        king: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
        queen: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
        rook: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
        bishop: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
        knight: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
        pawn: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    },
};

const STORAGE_PREFIX = 'chess-piece-svg-';
const STORAGE_VERSION = '1'; // Increment to force re-download of all pieces

const getStorageKey = (color: string, type: string): string => {
    return `${STORAGE_PREFIX}${STORAGE_VERSION}-${color}-${type}`;
};

/**
 * Get SVG data URL from localStorage or download from Wikipedia Commons
 */
export const getChessPieceSvg = async (
    color: 'white' | 'black',
    type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
): Promise<string> => {
    const storageKey = getStorageKey(color, type);
    
    // Check localStorage first
    const cached = localStorage.getItem(storageKey);
    if (cached) {
        try {
            const data = JSON.parse(cached);
            // Verify it's a valid SVG data URL
            if (data.svg && (data.svg.startsWith('data:image/svg+xml') || data.svg.startsWith('data:image/svg+xml;charset=utf-8'))) {
                return data.svg;
            }
        } catch (e) {
            // Invalid cache, remove it
            localStorage.removeItem(storageKey);
        }
    }
    
    // Download from Wikipedia Commons
    const url = PIECE_URLS[color][type];
    if (!url) {
        throw new Error(`No URL found for ${color} ${type}`);
    }
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
        });
        
        if (!response.ok) {
            throw new Error(`Failed to download ${color} ${type}: ${response.statusText}`);
        }
        
        const svgText = await response.text();
        
        // Convert to data URL using URL encoding (more efficient than base64 for SVG)
        const encodedSvg = encodeURIComponent(svgText);
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
        
        // Store in localStorage
        localStorage.setItem(storageKey, JSON.stringify({
            svg: dataUrl,
            timestamp: Date.now(),
        }));
        
        return dataUrl;
    } catch (error) {
        console.error(`Error downloading chess piece ${color} ${type}:`, error);
        throw error;
    }
};

/**
 * Preload all chess piece SVGs into cache
 */
export const preloadChessPieces = async (): Promise<void> => {
    const colors: Array<'white' | 'black'> = ['white', 'black'];
    const types: Array<'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'> = [
        'king',
        'queen',
        'rook',
        'bishop',
        'knight',
        'pawn',
    ];
    
    const promises = colors.flatMap((color) =>
        types.map((type) =>
            getChessPieceSvg(color, type).catch((error) => {
                console.error(`Failed to preload ${color} ${type}:`, error);
            })
        )
    );
    
    await Promise.all(promises);
};

/**
 * Clear all cached chess pieces
 */
export const clearChessPieceCache = (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
};

