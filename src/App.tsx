import { useState } from 'react';
import CircularBoard from './components/CircularBoard';
import { initialGameState, makeMove } from './engine/gameState';

function App() {
  const [gameState, setGameState] = useState(initialGameState());

  const handleMove = (from: number, to: number) => {
    const newGameState = makeMove(gameState, from, to);
    setGameState(newGameState);
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 flex flex-col items-center justify-center overflow-hidden">
      <h1 className="text-neutral-200 text-2xl font-bold mb-4">Circular Chess (Shatranj)</h1>
      <div className="flex-grow flex items-center justify-center w-full max-w-md aspect-square p-4">
        <CircularBoard gameState={gameState} onMove={handleMove} />
      </div>
      <div className="text-neutral-400 mt-4">
        Turn: <span className="capitalize">{gameState.turn}</span>
      </div>
    </div>
  );
}

export default App;
