// Main Queue Visualizer component for centralized queue
import { useMemo } from 'react';
import type { Customer } from '../types';

interface MainQueueVisualizerProps {
  queue: Customer[];
  isSimulating: boolean;
  simulationSpeed?: number; // Simulation speed for animations
}

export function MainQueueVisualizer({ queue, isSimulating, simulationSpeed = 1 }: MainQueueVisualizerProps) {
  // Generate queue positions in a serpentine layout
  const queuePositions = useMemo(() => {
    return calculateMainQueuePositions(queue);
  }, [queue]);

  // Calculate animation times based on simulation speed
  const animationTime = Math.max(0.5, 2.5 / (simulationSpeed || 1));
  const transitionTime = Math.max(0.8, 3.0 / (simulationSpeed || 1));
  
  // Don't render if not simulating or queue is empty
  if (!isSimulating || queue.length === 0) {
    return null;
  }

  return (
    <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2 z-30">
      <div className="relative">
        {/* Queue Label */}
        <div className="absolute -top-8 left-0 right-0 text-center font-semibold text-sm text-white bg-indigo-700 px-2 py-1 rounded-md shadow-lg">
          Main Queue ({queue.length})
        </div>
        
        {/* Queue Line */}
        <div className="w-full h-full absolute top-0 left-0">
          <svg className="w-full h-full absolute top-0 left-0" 
               style={{ 
                 width: Math.max(400, queuePositions.width), 
                 height: queuePositions.height + 20 
               }}>
            <path 
              d={queuePositions.path} 
              fill="none" 
              stroke="rgba(99, 102, 241, 0.5)" 
              strokeWidth="30"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-30"
            />
          </svg>
        </div>
        
        {/* Customer Icons */}
        {queue.map((customer, index) => (
          <div
            key={customer.id}
            className={`customer-icon absolute w-4 h-4 rounded-full customer-waiting ${
              customer.prefersSelfCheckout ? 'bg-green-500' : 'bg-blue-500'
            } ${simulationSpeed <= 0.1 ? 'ultra-slow-motion' : simulationSpeed <= 0.25 ? 'slow-motion-queue' : ''}`}
            style={{ 
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
              transform: 'scale(1)',
              left: queuePositions.positions[index]?.x || 0,
              top: queuePositions.positions[index]?.y || 0,
              transition: `all ${transitionTime}s ease`,
              animationDuration: `${animationTime * 3}s`
            } as React.CSSProperties}
          >
            {/* Item count indicator */}
            {customer.itemCount > 10 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center">
                !
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Calculate positions for main queue in a serpentine pattern
function calculateMainQueuePositions(queue: Customer[]) {
  const customerSpacing = 10; // Space between customers
  const rowWidth = 300; // Width of each row
  const rowHeight = 30; // Height of each row
  const customersPerRow = Math.floor(rowWidth / customerSpacing);
  const positions: { x: number; y: number }[] = [];
  
  // Calculate the number of rows needed
  const numRows = Math.ceil(queue.length / customersPerRow);
  const width = rowWidth;
  const height = numRows * rowHeight;
  
  // Generate SVG path for the serpentine queue
  let path = `M 0 ${rowHeight/2}`;
  
  for (let i = 0; i < numRows; i++) {
    if (i % 2 === 0) {
      // Left to right
      path += ` H ${rowWidth}`;
      if (i < numRows - 1) {
        path += ` C ${rowWidth + 20} ${rowHeight/2 + i * rowHeight}, ${rowWidth + 20} ${rowHeight/2 + (i+1) * rowHeight}, ${rowWidth} ${rowHeight/2 + (i+1) * rowHeight}`;
      }
    } else {
      // Right to left
      path += ` H 0`;
      if (i < numRows - 1) {
        path += ` C -20 ${rowHeight/2 + i * rowHeight}, -20 ${rowHeight/2 + (i+1) * rowHeight}, 0 ${rowHeight/2 + (i+1) * rowHeight}`;
      }
    }
  }
  
  // Calculate positions for each customer along the path
  for (let i = 0; i < queue.length; i++) {
    const row = Math.floor(i / customersPerRow);
    const posInRow = i % customersPerRow;
    
    if (row % 2 === 0) {
      // Left to right
      positions.push({
        x: posInRow * customerSpacing,
        y: row * rowHeight + rowHeight/2
      });
    } else {
      // Right to left
      positions.push({
        x: rowWidth - (posInRow * customerSpacing),
        y: row * rowHeight + rowHeight/2
      });
    }
  }
  
  return { positions, width, height, path };
}

export default MainQueueVisualizer;
