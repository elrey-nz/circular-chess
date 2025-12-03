import { useState } from 'react';
import CircularBoard from './components/CircularBoard';
import SettingsDropdown from './components/SettingsDropdown';
import { GameState } from './engine/GameState';
import type { GameMode } from './engine/types';
import type { BoardThemeName } from './types/boardTheme';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [gameState, setGameState] = useState(GameState.initial(gameMode));
  const [boardTheme, setBoardTheme] = useState<BoardThemeName>('dark');

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    setGameState(GameState.initial(mode));
  };

  const handleMove = (from: number, to: number) => {
    const newGameState = gameState.makeMoveFromIndices(from, to);
    setGameState(newGameState);
  };

  const getGameTitle = (mode: GameMode): string => {
    switch (mode) {
      case 'citadel':
        return 'Citadel Chess';
      case 'modern':
        return 'Modern Circular Chess';
      case 'standard':
      default:
        return 'Circular Chess (Shatranj)';
    }
  };

  const gameTitle = getGameTitle(gameMode);

  return (
    <div className="h-screen w-screen bg-neutral-950 flex flex-col overflow-hidden">
      {/* Header with title, mode buttons, and settings */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <div className="flex flex-col gap-2">
          <h1 className="text-neutral-200 text-xl font-bold">{gameTitle}</h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleModeChange('standard')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${gameMode === 'standard'
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
            >
              Shatranj
            </button>
            <button
              onClick={() => handleModeChange('modern')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${gameMode === 'modern'
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
            >
              Modern
            </button>
            <button
              onClick={() => handleModeChange('citadel')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${gameMode === 'citadel'
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
            >
              Citadel
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-neutral-400 text-sm">
            {gameState.isDraw ? (
              <div className="text-yellow-400 font-semibold">Game Draw - King reached citadel!</div>
            ) : (
              <div>Turn: <span className="capitalize">{gameState.turn}</span></div>
            )}
          </div>
          <SettingsDropdown currentTheme={boardTheme} onThemeChange={setBoardTheme} />
        </div>
      </div>

      {/* Board container - fills remaining space */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        <div className="w-full h-full max-w-full max-h-full aspect-square">
          <CircularBoard gameState={gameState} onMove={handleMove} theme={boardTheme} />
        </div>
      </div>
    </div>
  );
}

export default App;
