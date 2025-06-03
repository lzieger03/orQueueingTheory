// Minimal version of CheckoutLayoutGame for debugging
import { useState } from 'react';

export function CheckoutLayoutGameSimple() {
  const [gameState, setGameState] = useState('editing');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Checkout Layout Game</h1>
      <p className="text-gray-300">Current state: {gameState}</p>
      
      <div className="mt-8 space-y-4">
        <button 
          onClick={() => setGameState('simulating')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          Start Simulation
        </button>
        
        <div className="w-full h-64 bg-gray-800 border-2 border-gray-700 rounded">
          <p className="p-4 text-gray-400">Layout editor area</p>
        </div>
      </div>
    </div>
  );
}
