// Simulation Speed Control component
import { useState, useCallback, useEffect } from 'react';

export interface SimulationSpeedProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  disabled: boolean;
}

export function SimulationSpeedControl({ speed, onSpeedChange, disabled }: SimulationSpeedProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Define speed presets
  const speeds = [
    { value: 0.25, label: '0.25x', title: 'Slow Motion' },
    { value: 0.5, label: '0.5x', title: 'Half Speed' },
    { value: 1, label: '1.0x', title: 'Normal Speed' },
    { value: 2, label: '2.0x', title: 'Double Speed' },
    { value: 5, label: '5.0x', title: 'Fast' },
    { value: 10, label: '10.0x', title: 'Very Fast' }
  ];
  
  // Log the current speed for debugging
  console.log('Current simulation speed:', speed);
  
  // Get current speed label
  const currentSpeed = speeds.find(s => s.value === speed) || speeds[2]; // Default to 1.0x
  
  // Handle speed change
  const handleSpeedChange = useCallback((newSpeed: number) => {
    onSpeedChange(newSpeed);
    setIsOpen(false);
  }, [onSpeedChange]);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);
  
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        disabled={disabled}
        className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-blue-600/40 to-indigo-600/40 backdrop-blur-md border rounded-xl transition-all duration-300 ${
          disabled 
            ? 'opacity-70 cursor-not-allowed border-white/20 bg-gray-700/50' 
            : 'border-white/30 hover:border-white/50 hover:from-blue-600/50 hover:to-indigo-600/50 shadow-md'
        }`}
      >
        <span className="text-white/90 text-sm font-medium">Speed:</span>
        <span className="text-white font-bold">{currentSpeed.label}</span>
      </button>
      
      {isOpen && !disabled && (
        <div 
          className="absolute top-full left-0 mt-2 p-2 w-40 bg-gray-800 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50 animate-slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs text-white/70 mb-2 px-2">Simulation Speed</div>
          <div className="space-y-1">
            {speeds.map((speedOption) => (
              <button
                key={speedOption.value}
                onClick={() => handleSpeedChange(speedOption.value)}
                className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                  speed === speedOption.value
                    ? 'bg-indigo-600/50 text-white font-medium'
                    : 'hover:bg-gray-700 text-white/80'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{speedOption.title}</span>
                  <span className="font-mono text-xs">{speedOption.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SimulationSpeedControl;
