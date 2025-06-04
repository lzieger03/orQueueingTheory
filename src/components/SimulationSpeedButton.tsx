// Simple Simulation Speed Button component
import { useState, useEffect } from 'react';

export interface SimulationSpeedButtonProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  disabled: boolean;
}

export function SimulationSpeedButton({ speed, onSpeedChange, disabled }: SimulationSpeedButtonProps) {
  const [wasClicked, setWasClicked] = useState(false);
  
  // Load saved speed preference from local storage on component mount
  useEffect(() => {
    const savedSpeed = localStorage.getItem('simulationSpeed');
    if (savedSpeed && !isNaN(parseFloat(savedSpeed))) {
      onSpeedChange(parseFloat(savedSpeed));
    }
  }, []);
  
  // Define speed presets
  const speeds = [
    { value: 0.1, label: '0.1x', title: 'Ultra Slow' },
    { value: 0.25, label: '0.25x', title: 'Slow Motion' },
    { value: 0.5, label: '0.5x', title: 'Half Speed' },
    { value: 1, label: '1.0x', title: 'Normal Speed' },
    { value: 2, label: '2.0x', title: 'Double Speed' },
    { value: 5, label: '5.0x', title: 'Fast' },
    { value: 10, label: '10.0x', title: 'Very Fast' }
  ];
  
  // Cycle through speed presets
  const handleSpeedChange = () => {
    if (disabled) return;
    
    // Mark that the button was clicked at least once
    setWasClicked(true);
    
    // Find current speed index
    const currentIndex = speeds.findIndex(s => s.value === speed);
    // Get next speed (loop back to first if at end)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length].value;
    
    // Show a visual cue that the speed changed
    const button = document.querySelector('.speed-button');
    if (button) {
      button.classList.add('speed-changed');
      setTimeout(() => button.classList.remove('speed-changed'), 500);
    }
    
    // Save preference to local storage
    localStorage.setItem('simulationSpeed', nextSpeed.toString());
    
    // Apply the speed change
    onSpeedChange(nextSpeed);
    
    // Log for debugging
    console.log(`Simulation speed changed to: ${nextSpeed}x (saved to preferences)`);
  };
  
  // Get current speed label
  const currentSpeed = speeds.find(s => s.value === speed) || speeds[2]; // Default to 1.0x
  
  return (
    <button
      onClick={handleSpeedChange}
      disabled={disabled}
      className={`speed-button flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-purple-600/40 to-blue-600/40 backdrop-blur-md border rounded-xl transition-all duration-300 ${
        disabled 
          ? 'opacity-70 cursor-not-allowed border-white/20 bg-gray-700/50' 
          : wasClicked
            ? 'border-white/40 hover:border-white/60 hover:from-purple-600/60 hover:to-blue-600/60 shadow-md hover:shadow-blue-500/30'
            : 'border-white/30 hover:border-white/50 hover:from-purple-600/50 hover:to-blue-600/50 shadow-md hover:shadow-blue-500/20'
      }`}
      title="Click to change simulation speed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <div className="flex flex-col items-start">
        <span className="text-white/70 text-xs leading-none mb-1">Simulation Speed</span>
        <span className="text-white font-bold leading-none">{currentSpeed.label}</span>
      </div>
      <span className="ml-1 text-xs bg-blue-600/30 rounded px-1.5 py-0.5 text-blue-200 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Set speed
      </span>
    </button>
  );
}

export default SimulationSpeedButton;
