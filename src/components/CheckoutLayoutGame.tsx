'use client';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { LayoutEditor } from './LayoutEditor';
import { SimulationDashboard } from './SimulationDashboard';
import { ParameterControls } from './ParameterControls';
import { MetricsPanel } from './MetricsPanel';
import { TutorialOverlay } from './TutorialOverlay';
import { GameStatsDisplay } from './GameStatsDisplay';
import { RealDataInfo } from './RealDataInfo';
import { NotificationSystem, useNotifications } from './NotificationSystem';
import { SimulationSpeedButton } from './SimulationSpeedButton';
import { useGameState } from '../hooks/useGameState';
import { storeLayouts } from '../data/samples';
import type { CheckoutStation, CheckoutType } from '../types';
import { Play, Pause, Square, RotateCcw, Settings, Brain, Info, HelpCircle } from 'lucide-react';

// Lazy load the AI Advisor component to reduce initial bundle size
const AIAdvisor = lazy(() => import('./AIAdvisor'));

// Import AIRecommendation type from types
import type { AIRecommendation } from '../types';
//   description: string;
//   impact: string;
//   confidence: number;
//   priority: 'high' | 'medium' | 'low';
//   stationId?: string;
//   newPosition?: { x: number; y: number };
//   newType?: 'regular' | 'kiosk';
// }

export default function CheckoutLayoutGame() {
  const {
    gameState,
    context,
    isRunning,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetGame,
    updateStations,
    updateParams,
    updateSimulationSpeed,
    enableAI,
    canStartSimulation,
    canPause,
    canResume,
    canStop
  } = useGameState();

  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  
  // Notification system
  const { 
    notifications, 
    removeNotification, 
    notifySuccess, 
    notifyWarning, 
    notifyInfo, 
    notifyAchievement 
  } = useNotifications();

  // Achievement tracking
  const previousMetrics = useRef<any>({});

  // Monitor performance and show achievements
  useEffect(() => {
    const metrics = context.metrics;
    const prev = previousMetrics.current;

    if (isRunning && metrics) {
      // Achievement: Excellent wait time
      if (metrics.averageWaitTime < 2 && prev.averageWaitTime >= 2) {
        notifyAchievement('Speed Demon!', 'Average wait time under 2 minutes! ⚡');
      }

      // Achievement: High throughput
      if (metrics.throughput > 40 && prev.throughput <= 40) {
        notifyAchievement('Traffic Master!', 'Serving over 40 customers per hour! 🚀');
      }

      // Achievement: Optimal utilization
      if (metrics.utilization > 0.75 && metrics.utilization < 0.9 && metrics.averageWaitTime < 3) {
        notifyAchievement('Perfect Balance!', 'Optimal efficiency achieved! 🎯');
      }

      // Achievement: High score
      if (metrics.score > 850 && prev.score <= 850) {
        notifyAchievement('High Scorer!', 'You\'ve exceeded 850 points! 🏆');
      }

      // Update previous metrics for next comparison
      previousMetrics.current = { ...metrics };
    }
  }, [context.metrics, isRunning, notifyAchievement]);

  // Load a preset layout
  const handleLoadLayout = (layoutName: string) => {
    const layout = storeLayouts[layoutName as keyof typeof storeLayouts];
    if (!layout) {
      return;
    } 
    // Ensure station.type is cast to CheckoutType
    updateStations(
      layout.stations.map((station: any) => ({
        ...station,
        type: station.type as CheckoutType
      }))
    );
    notifySuccess(
      'Layout Loaded', 
      `${layoutName.charAt(0).toUpperCase() + layoutName.slice(1)} layout applied successfully!`
    );
  };

  // Apply AI recommendation to the store layout
  const applyAIRecommendation = (recommendation: AIRecommendation) => {
    const currentStations = [...context.stations];
    
    switch (recommendation.type) {
      case 'add_station':
        // Find a good position for a new station
        const newPosition = findOptimalStationPosition(currentStations);
        // Map recommendation type to our internal types
        const stationType: CheckoutType = recommendation.newType || 'regular';
        const newStation: CheckoutStation = {
          id: `station-${Date.now()}`,
          type: stationType,
          position: newPosition,
          size: { width: 80, height: 60 },
          isActive: true,
          servingCustomer: null,
          queue: [],
          serviceTime: stationType === 'kiosk' ? 90 : 75,
          onBreak: false
        };
        currentStations.push(newStation);
        updateStations(currentStations);
        notifySuccess('AI Recommendation Applied', recommendation.description);
        break;
        
      case 'remove_station':
        // Remove the last station (simple approach since we don't have utilization stats)
        if (currentStations.length > 1) {
          const filtered = currentStations.slice(0, -1);
          updateStations(filtered);
          notifySuccess('AI Recommendation Applied', `Removed station to optimize layout`);
        }
        break;
        
      case 'change_type':
        // Convert a regular station to kiosk if possible
        const regularStation = currentStations.find(s => s.type === 'regular');
        if (regularStation) {
          regularStation.type = 'kiosk';
          regularStation.serviceTime = 90; // Kiosks are slower for clothing
          updateStations(currentStations);
          notifySuccess('AI Recommendation Applied', 'Converted station to self-service kiosk');
        }
        break;
        
      case 'move_station':
        // Redistribute stations for better spacing
        const redistributed = redistributeStations(currentStations);
        updateStations(redistributed);
        notifySuccess('AI Recommendation Applied', 'Optimized station positions');
        break;
        
      default:
        notifyWarning('Unknown Recommendation', 'Unable to apply this recommendation type');
    }
  };

  // Find optimal position for new station
  const findOptimalStationPosition = (existingStations: CheckoutStation[]) => {
    const gridSize = 100;
    const maxX = 600;
    const maxY = 400;
    
    // Try to find a position that's not too close to existing stations
    for (let y = gridSize; y < maxY; y += gridSize) {
      for (let x = gridSize; x < maxX; x += gridSize) {
        const position = { x, y };
        const tooClose = existingStations.some(station => {
          const distance = Math.sqrt(
            Math.pow(station.position.x - x, 2) + 
            Math.pow(station.position.y - y, 2)
          );
          return distance < 120; // Minimum distance between stations
        });
        
        if (!tooClose) {
          return position;
        }
      }
    }
    
    // Fallback position if no optimal spot found
    return { x: 200, y: 200 };
  };

  // Redistribute stations for better flow
  const redistributeStations = (stations: CheckoutStation[]) => {
    const redistributed = [...stations];
    const spacing = 150;
    
    redistributed.forEach((station, index) => {
      station.position = {
        x: 100 + (index % 3) * spacing,
        y: 100 + Math.floor(index / 3) * spacing
      };
    });
    
    return redistributed;
  };

  const handleSimulationControl = () => {
    if (gameState === 'editing' && canStartSimulation) {
      startSimulation();
      notifyInfo('Simulation Started', 'Customers are now arriving at your store!');
    } else if (gameState === 'simulating' && canPause) {
      pauseSimulation();
      notifyWarning('Simulation Paused', 'You can resume or make changes to your layout.');
    } else if (gameState === 'paused' && canResume) {
      resumeSimulation();
      notifyInfo('Simulation Resumed', 'Your store is operating again!');
    }
  };

  const getSimulationButtonIcon = () => {
    if (gameState === 'editing') return <Play className="w-4 h-4" />;
    if (gameState === 'simulating') return <Pause className="w-4 h-4" />;
    if (gameState === 'paused') return <Play className="w-4 h-4" />;
    return <Play className="w-4 h-4" />;
  };

  const getSimulationButtonText = () => {
    if (gameState === 'editing') return 'Start Simulation';
    if (gameState === 'simulating') return 'Pause';
    if (gameState === 'paused') return 'Resume';
    return 'Start';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-md border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🛒</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-100">
                  Checkout Layout Game
                </h1>
                <p className="text-gray-400 text-sm">
                  Optimize store layouts with queueing theory
                </p>
              </div>
            </div>
            
            <div>
              <button
                onClick={() => setShowTutorial(true)}
                className="p-2 rounded-lg bg-blue-900 text-blue-300 hover:bg-blue-800"
                title="Tutorial"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Vertical Layout */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Game Stats Section */}
          <div className="w-full">
            <GameStatsDisplay
              metrics={{
                averageWaitTime: context.metrics.averageWaitTime,
                throughput: context.metrics.throughput,
                utilization: context.metrics.utilization || context.metrics.serverUtilization,
                customersInSystem: context.metrics.customersInSystem || context.customers.length,
                score: context.metrics.score || 0,
              }}
            />
          </div>
          
          {/* Controls Section */}
          <div className="bg-gray-800 border border-gray-700 p-5 rounded-lg shadow-lg">
            <div className="flex flex-col gap-4">
              {/* Status and Main Controls Row */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  gameState === 'simulating' ? 'bg-green-600 text-green-100' :
                  gameState === 'paused' ? 'bg-amber-600 text-amber-100' :
                  gameState === 'complete' ? 'bg-blue-600 text-blue-100' :
                  'bg-gray-600 text-gray-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      gameState === 'simulating' ? 'bg-green-500 animate-pulse' :
                      gameState === 'paused' ? 'bg-amber-500' :
                      gameState === 'complete' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="capitalize">{gameState}</span>
                  </div>
                </div>
                
                {/* Simulation Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSimulationControl}
                    disabled={!canStartSimulation && gameState === 'editing'}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2"
                  >
                    {getSimulationButtonIcon()}
                    <span>{getSimulationButtonText()}</span>
                  </button>
                  
                  {canStop && (
                    <button
                      onClick={stopSimulation}
                      className="btn-secondary flex items-center gap-2 px-4 py-2"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop</span>
                    </button>
                  )}
                  
                  <button
                    onClick={resetGame}
                    className="p-2.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                    title="Reset Simulation"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Simulation Speed Control - Always enabled, even in editing mode */}
                <div className="flex items-center justify-between w-full mt-3">
                  {gameState === 'editing' && (
                    <div className="text-sm text-yellow-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      Set simulation speed before starting
                    </div>
                  )}
                  <div className={`bg-indigo-900/30 p-0.5 rounded-xl ${
                    gameState === 'simulating' ? 'speed-button-attention' : ''
                  }`}>
                    <SimulationSpeedButton
                      speed={context.simulationSpeed}
                      onSpeedChange={updateSimulationSpeed}
                      disabled={false} // Never disable the speed control
                    />
                  </div>
                </div>
              </div>
              
              {/* Tools and Layouts Row */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-600">
                {/* Quick Layout */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300 font-medium">Layouts:</span>
                  <button
                    onClick={() => handleLoadLayout('basic')}
                    className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium"
                    disabled={gameState !== 'editing'}
                  >
                    🏪 Basic
                  </button>
                  <button
                    onClick={() => handleLoadLayout('mixed')}
                    className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium"
                    disabled={gameState !== 'editing'}
                  >
                    🔀 Mixed
                  </button>
                </div>
                
                {/* Tool Buttons */}
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2.5 rounded-lg flex items-center gap-2 ${showSettings ? 'bg-blue-600 text-blue-100' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!context.isAIEnabled) enableAI();
                      setShowAI(!showAI);
                    }}
                    className={`p-2.5 rounded-lg flex items-center gap-2 ${showAI ? 'bg-purple-600 text-purple-100' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    title="AI Advisor"
                  >
                    <Brain className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">AI Advisor</span>
                  </button>
                  
                  <button
                    onClick={() => setShowInfoPanel(!showInfoPanel)}
                    className={`p-2.5 rounded-lg flex items-center gap-2 ${showInfoPanel ? 'bg-amber-600 text-amber-100' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    title="Information"
                  >
                    <Info className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">Help</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Layout Editor Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5">
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Store Layout</h3>
            <div className="h-[450px] bg-gray-900 rounded-md border border-gray-600">
              <LayoutEditor
                stations={context.stations}
                customers={context.customers}
                mainQueue={context.mainQueue || []}
                onStationsUpdate={updateStations}
                disabled={gameState !== 'editing'}
                isSimulating={gameState === 'simulating' || gameState === 'paused'}
                simulationSpeed={context.simulationSpeed}
              />
            </div>
          </div>

          {/* Parameter Controls - Shown conditionally */}
          {showSettings && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5">
              <h3 className="text-xl font-semibold mb-4 text-gray-100">Simulation Parameters</h3>
              <ParameterControls
                params={context.simulationParams}
                onUpdate={updateParams}
                disabled={gameState !== 'editing'}
              />
            </div>
          )}
          
          {/* Real Data Info */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5">
            <RealDataInfo dayType={context.simulationParams.dayType} />
          </div>
          
          {/* Metrics Panel */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5">
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Performance Metrics</h3>
            <MetricsPanel 
              metrics={context.metrics}
              currentTime={context.currentTime}
              stations={context.stations}
              mainQueue={context.mainQueue || []}
            />
          </div>
          
          {/* Simulation Dashboard */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5">
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Simulation Dashboard</h3>
            <SimulationDashboard
              simulationData={context.simulationHistory || []}
              stations={context.stations}
              currentMetrics={context.metrics}
            />
          </div>
          
          {/* AI Advisor - Shown conditionally */}
          {showAI && context.isAIEnabled && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5">
              <h3 className="text-xl font-semibold mb-4 text-gray-100">AI Advisor</h3>
              <Suspense fallback={
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-lg animate-pulse">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                    <span className="ml-3 text-gray-300">Loading AI Advisor...</span>
                  </div>
                </div>
              }>
                <AIAdvisor
                  stations={context.stations}
                  currentMetrics={{
                    averageWaitTime: context.metrics.averageWaitTime,
                    throughput: context.metrics.throughput,
                    utilization: context.metrics.utilization || context.metrics.serverUtilization,
                    customersInSystem: context.metrics.customersInSystem || context.customers.length,
                    score: context.metrics.score || 0,
                  }}
                  onApplyRecommendation={applyAIRecommendation}
                  isLearning={context.isAIEnabled && isRunning}
                  onStartLearning={() => enableAI()}
                  onStopLearning={() => {}}
                  aiAgent={null}
                />
              </Suspense>
            </div>
          )}

          {/* Info Panel - Shown conditionally */}
          {showInfoPanel && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5">
              <h3 className="text-xl font-semibold mb-4 text-gray-100">How to Play</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  <strong className="text-gray-100">1. Design:</strong> Drag checkout stations onto the store layout
                </p>
                <p>
                  <strong className="text-gray-100">2. Configure:</strong> Adjust arrival rates and service times
                </p>
                <p>
                  <strong className="text-gray-100">3. Simulate:</strong> Run the simulation to see customer flow
                </p>
                <p>
                  <strong className="text-gray-100">4. Optimize:</strong> Use AI recommendations to improve performance
                </p>
                <div className="mt-4 p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                  <p className="text-blue-200 text-xs">
                    <strong>Goal:</strong> Minimize customer wait times while maintaining efficient staff utilization
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Tutorial Overlay */}
      <TutorialOverlay 
        isVisible={showTutorial || (isFirstTime && context.stations.length === 0)}
        onClose={() => {
          setShowTutorial(false);
          setIsFirstTime(false);
        }}
        onStartGame={() => {
          setIsFirstTime(false);
          // Load a basic layout to get users started
          handleLoadLayout('basic');
          notifySuccess('Layout Loaded', 'Basic store layout has been applied. Ready to simulate!');
        }}
      />
    </div>
  );
}
