export type BoardThemeName = 'light' | 'dark' | 'chesscom';

export interface BoardTheme {
    name: BoardThemeName;
    displayName: string;
    lightSquare: string;
    darkSquare: string;
    boardBackground: string;
    boardHole: string;
    gridColor: string;
    selectedSquare: string;
    legalMove: string;
}

export const BOARD_THEMES: Record<BoardThemeName, BoardTheme> = {
    light: {
        name: 'light',
        displayName: 'Light',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863',
        boardBackground: '#f5f5f5',
        boardHole: '#e5e5e5',
        gridColor: '#8b7355',
        selectedSquare: 'rgba(255, 255, 0, 0.6)',
        legalMove: 'rgba(0, 255, 0, 0.5)',
    },
    dark: {
        name: 'dark',
        displayName: 'Dark',
        lightSquare: '#eeeed2',
        darkSquare: '#769656',
        boardBackground: '#262421',
        boardHole: '#1a1917',
        gridColor: '#4a5a4a',
        selectedSquare: 'rgba(255, 255, 0, 0.6)',
        legalMove: 'rgba(0, 255, 0, 0.5)',
    },
    chesscom: {
        name: 'chesscom',
        displayName: 'Chess.com',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863',
        boardBackground: '#312e2b',
        boardHole: '#262421',
        gridColor: '#8b7355',
        selectedSquare: 'rgba(255, 255, 0, 0.7)',
        legalMove: 'rgba(125, 199, 111, 0.8)',
    },
};




