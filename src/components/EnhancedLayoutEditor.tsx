// Layout Editor component with drag-and-drop functionality
import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { CheckoutStation, Customer, Position, CheckoutType } from '../types';
import { GameUtils } from '../utils/gameUtils';
import { Trash2, Settings } from 'lucide-react';
import MainQueueVisualizer from './EnhancedMainQueueVisualizer';

interface LayoutEditorProps {
  stations: CheckoutStation[];
  customers: Customer[];
  mainQueue: Customer[]; // Add main queue prop
  onStationsUpdate: (stations: CheckoutStation[]) => void;
  disabled: boolean;
  isSimulating: boolean;
  simulationSpeed?: number; // Simulation speed for animations
}

// Draggable checkout station component
function DraggableStation({ 
  station, 
  onUpdate, 
  onDelete, 
  disabled,
  isSimulating,
  simulationSpeed = 1
}: {
  station: CheckoutStation;
  onUpdate: (station: CheckoutStation) => void;
  onDelete: (id: string) => void;
  disabled: boolean;
  isSimulating: boolean;
  simulationSpeed?: number; // Simulation speed for animations
}) {
  const dragRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'station',
    item: { id: station.id, type: 'existing' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !disabled
  });

  // Connect the drag ref
  drag(dragRef);

  // Calculate animation time based on simulation speed
  const animationTime = Math.max(0.5, 2.5 / (simulationSpeed || 1));
  const queuePositions = GameUtils.calculateQueuePositions(station);

  const getStationColor = () => {
    if (!station.isActive) return 'bg-gray-700 border-gray-600 text-gray-400';
    switch (station.type) {
      case 'regular': return 'station-regular';
      case 'kiosk': return 'station-self-service';
      default: return 'bg-gray-700 border-gray-600';
    }
  };

  const getStationIcon = () => {
    switch (station.type) {
      case 'regular': return '🛒';
      case 'kiosk': return '🖥️';
      default: return '?';
    }
  };

  return (
    <div
      ref={dragRef}
      className={`absolute ${getStationColor()} border-2 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-xl hover:scale-105'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-move'} group`}
      style={{
        left: station.position.x,
        top: station.position.y,
        width: station.size.width,
        height: station.size.height
      }}
    >
      {/* Station Header */}
      <div className="flex items-center justify-between p-2 text-xs">
        <div className="flex items-center space-x-1">
          <span className="text-lg group-hover:scale-110 transition-transform">{getStationIcon()}</span>
          <span className="font-medium text-gray-200">{station.type}</span>
        </div>
        
        {!disabled && (
          <button
            onClick={() => onDelete(station.id)}
            className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-500/20"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Station Status */}
      <div className="px-2 pb-1">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full glow transition-all duration-300 ${
            station.servingCustomer ? 'bg-red-400 shadow-red-400/50 animate-pulse' : 'bg-green-400 shadow-green-400/50'
          }`} />
          <div className="text-xs text-gray-300">
            Queue: {station.queue.length}
            {station.queue.length > 3 && <span className="text-red-300 ml-1">⚠️</span>}
          </div>
        </div>
        
        {/* Efficiency indicator */}
        <div className="mt-1 text-xs">
          <div className={`inline-block px-1.5 py-0.5 rounded-md text-xs font-semibold ${
            station.queue.length === 0 ? 'bg-green-500/20 text-green-300' :
            station.queue.length <= 2 ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-red-500/20 text-red-300'
          }`}>
            {station.queue.length === 0 ? 'Optimal' :
             station.queue.length <= 2 ? 'Good' : 'Congested'}
          </div>
        </div>
      </div>

      {/* Active/Inactive Toggle */}
      <div className="absolute top-1 right-1">
        <button
          onClick={() => onUpdate({ ...station, isActive: !station.isActive })}
          className={`w-3 h-3 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
            station.isActive 
              ? 'bg-green-400 border-green-300 shadow-md shadow-green-400/50' 
              : 'bg-gray-400 border-gray-300 shadow-md shadow-gray-400/50'
          }`}
          disabled={disabled}
        />
      </div>

      {/* Customer Queue Visualization */}
      {isSimulating && queuePositions.map((pos, index) => (
        <div
          key={index}
          className={`customer-icon absolute customer-waiting 
            ${simulationSpeed <= 0.1 ? 'ultra-slow-motion' : simulationSpeed <= 0.25 ? 'slow-motion-queue' : ''}`}
          style={{ 
            left: pos.x - station.position.x, 
            top: pos.y - station.position.y,
            animationDuration: `${animationTime * 3}s`,
            transitionDuration: `${animationTime * 1.5}s`,
            '--move-x': `${pos.x - station.position.x}px`,
            '--move-y': `${pos.y - station.position.y}px`
          }}
        />
      ))}

      {/* Serving Customer Indicator */}
      {isSimulating && station.servingCustomer && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl animate-pulseSlow backdrop-blur-sm" />
      )}
    </div>
  );
}

// New station palette
function StationPalette({ onAddStation, disabled }: {
  onAddStation: (type: CheckoutType) => void;
  disabled: boolean;
}) {
  const stationTypes: { type: CheckoutType; label: string; icon: string; description: string }[] = [
    { type: 'regular', label: 'Regular', icon: '🛒', description: 'Standard checkout counter' },
    { type: 'kiosk', label: 'Self-Service', icon: '🖥️', description: 'Customer self-checkout' }
  ];

  return (
    <div className="absolute top-4 left-4 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md border border-white/30 rounded-xl shadow-lg p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-200">Add Stations</h3>
      <div className="space-y-3">
        {stationTypes.map(({ type, label, icon, description }) => (
          <button
            key={type}
            onClick={() => onAddStation(type)}
            disabled={disabled}
            className="w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-xl border border-gray-600 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
              <span className="font-medium text-gray-200 text-sm">{label}</span>
            </div>
            <div className="text-xs text-gray-400">{description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LayoutEditor({ 
  stations, 
  customers, 
  mainQueue,
  onStationsUpdate, 
  disabled,
  isSimulating,
  simulationSpeed = 1 // Default to normal speed
}: LayoutEditorProps) {
  const [showPalette, setShowPalette] = useState(!disabled);
  const [dropElement, setDropElement] = useState<HTMLDivElement | null>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'station',
    drop: (item: any, monitor) => {
      if (!dropElement) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const editorRect = dropElement.getBoundingClientRect();
      const relativePosition = {
        x: clientOffset.x - editorRect.left,
        y: clientOffset.y - editorRect.top
      };

      // Snap to grid
      const snappedPosition = GameUtils.snapToGrid(relativePosition, 20);

      if (item.type === 'existing') {
        // Move existing station
        moveStation(item.id, snappedPosition);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const moveStation = (stationId: string, newPosition: Position) => {
    const updatedStations = stations.map(station => {
      if (station.id === stationId) {
        const updatedStation = { ...station, position: newPosition };
        
        // Validate placement
        const validation = GameUtils.validateStationPlacement(
          updatedStation,
          Array.isArray(stations) ? stations.filter(s => s.id !== stationId) : [],
          { width: 600, height: 400 } // Editor size
        );

        if (validation.isValid) {
          return updatedStation;
        } else {
          // Show validation errors
          console.warn('Invalid placement:', validation.errors);
          return station; // Keep original position
        }
      }
      return station;
    });

    onStationsUpdate(updatedStations);
  };

  const addStation = (type: CheckoutType) => {
    // Ensure stations is an array
    const stationsArray = Array.isArray(stations) ? stations : [];
    
    const newStation: CheckoutStation = {
      id: GameUtils.generateId(`${type}_station`),
      type,
      position: { x: 100, y: 100 }, // Default position
      size: type === 'kiosk' ? { width: 60, height: 80 } : { width: 80, height: 60 },
      isActive: true,
      servingCustomer: null,
      queue: [],
      serviceTime: type === 'kiosk' ? 90 : 75, // Realistic clothing store service times
      onBreak: false
    };

    // Find a valid position
    let validPosition = newStation.position;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const testStation = { ...newStation, position: validPosition };
      const validation = GameUtils.validateStationPlacement(
        testStation,
        stationsArray,
        { width: 600, height: 400 }
      );

      if (validation.isValid) {
        break;
      }

      // Try next position
      validPosition = {
        x: (validPosition.x + 100) % 500,
        y: validPosition.y + (validPosition.x + 100 >= 500 ? 80 : 0)
      };
      attempts++;
    }

    newStation.position = validPosition;
    onStationsUpdate([...stationsArray, newStation]);
  };

  const updateStation = (updatedStation: CheckoutStation) => {
    const stationsArray = Array.isArray(stations) ? stations : [];
    const updatedStations = stationsArray.map(station =>
      station.id === updatedStation.id ? updatedStation : station
    );
    onStationsUpdate(updatedStations);
  };

  const deleteStation = (stationId: string) => {
    const stationsArray = Array.isArray(stations) ? stations : [];
    const updatedStations = stationsArray.filter(station => station.id !== stationId);
    onStationsUpdate(updatedStations);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 shadow-lg">
      {/* Store Layout Background */}
      <div
        ref={(node) => {
          setDropElement(node);
          drop(node);
        }}
        className={`w-full h-full relative bg-gradient-to-br from-indigo-500/10 to-purple-500/10 layout-grid transition-all duration-300 ${
          isOver ? 'bg-blue-400/20 shadow-inner' : ''
        }`}
      >
        {/* Store Entrance */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-b-xl shadow-lg border border-blue-300/50">
          <div className="text-xs text-gray-200 text-center mt-1 font-semibold">ENTRANCE</div>
        </div>

        {/* Main Queue Visualizer */}
        <MainQueueVisualizer 
          queue={mainQueue} 
          isSimulating={isSimulating}
          simulationSpeed={simulationSpeed} 
        />

        {/* Checkout Stations */}
        {Array.isArray(stations) && stations.map(station => (
          <DraggableStation
            key={station.id}
            station={station}
            onUpdate={updateStation}
            onDelete={deleteStation}
            disabled={disabled}
            isSimulating={isSimulating}
            simulationSpeed={simulationSpeed}
          />
        ))}

        {/* Customer Flow Visualization */}
        {isSimulating && Array.isArray(customers) && customers.map(customer => {
          // Simple customer positioning - in a real implementation, 
          // you'd track customer positions as they move through the store
          const stationsArray = Array.isArray(stations) ? stations : [];
          const station = stationsArray.find(s => 
            s.queue.some(c => c.id === customer.id) || s.servingCustomer?.id === customer.id
          );
          if (!station) return null;

          const queueIndex = station.queue.findIndex(c => c.id === customer.id);
          let position: Position | null = null;
          
          if (queueIndex >= 0) {
            // Customer is in queue
            const queuePositions = GameUtils.calculateQueuePositions(station);
            const queuePosition = queuePositions && queuePositions[queueIndex];
            
            if (queuePosition && typeof queuePosition.x === 'number' && typeof queuePosition.y === 'number') {
              position = queuePosition;
            } else {
              // Fallback positioning for queue
              position = { 
                x: station.position.x + station.size.width / 2, 
                y: station.position.y + station.size.height + 20 + (queueIndex * 15) 
              };
            }
          } else if (station.servingCustomer?.id === customer.id) {
            // Customer is being served
            position = { 
              x: station.position.x + 10, 
              y: station.position.y + 10 
            };
          }

          // Ensure position has valid values before rendering
          if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
            return null;
          }

          const animationTime = Math.max(0.5, 2.5 / (simulationSpeed || 1));

          return (
            <div
              key={customer.id}
              className={`customer-icon absolute ${
                station.servingCustomer?.id === customer.id 
                  ? 'customer-being-served' 
                  : 'customer-waiting'
              } ${simulationSpeed <= 0.1 ? 'ultra-slow-motion' : simulationSpeed <= 0.25 ? 'slow-motion-queue' : ''}`}
              style={{ 
                left: position.x, 
                top: position.y,
                transition: `all ${animationTime}s ease`,
                animationDuration: `${animationTime * 3}s`,
                ...({
                  '--move-x': `${position.x}px`,
                  '--move-y': `${position.y}px`
                } as React.CSSProperties)
              }}
              title={`Customer ${customer.id} - ${customer.itemCount} items`}
            />
          );
        })}

        {/* Station Palette */}
        {showPalette && !disabled && (
          <StationPalette onAddStation={addStation} disabled={disabled} />
        )}

        {/* Toggle Palette Button */}
        {!disabled && (
          <button
            onClick={() => setShowPalette(!showPalette)}
            className="absolute top-4 right-4 p-3 bg-gray-700 rounded-xl shadow-lg border border-gray-600 hover:bg-gray-600 transition-all duration-300 hover:scale-105 group"
          >
            <Settings className="w-4 h-4 text-gray-200 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4 text-xs">
          <h4 className="font-semibold mb-3 text-gray-200">Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="customer-icon" />
              <span className="text-gray-300">Customer</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full shadow-md shadow-green-400/50 glow" />
              <span className="text-gray-300">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full shadow-md shadow-red-400/50 glow" />
              <span className="text-gray-300">Busy</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {stations.length === 0 && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-300 bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-lg">
              <div className="text-4xl mb-4 animate-float">🏪</div>
              <div className="text-lg mb-2 font-semibold">Welcome to Layout Editor</div>
              <div className="text-sm mb-1">Click on station types to add them to your store</div>
              <div className="text-xs text-gray-400">Drag stations to reposition them</div>
            </div>
          </div>
        )}

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" className="layout-grid-pattern">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default LayoutEditor;
export { LayoutEditor as EnhancedLayoutEditor };
