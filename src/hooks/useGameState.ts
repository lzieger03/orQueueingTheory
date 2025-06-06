// Custom hook for managing game state with XState
import { useState, useEffect, useCallback } from 'react';
import { useMachine } from '@xstate/react';
import { createMachine, assign } from 'xstate';
import type { 
  GameStore, 
  CheckoutStation, 
  SimulationParams, 
  GameState,
  AIRecommendation 
} from '../types';
import { SimulationEngine } from '../simulation/engine';
import { QLearningAgent } from '../ai/qlearning';
import { defaultSimulationParams } from '../data/samples';
import { simulationHistory } from '../data/simulationHistory';
import { generateSimulationData } from '../utils/simulationHelper';

// Game state machine definition
const gameStateMachine = createMachine({
  id: 'checkoutGame',
  initial: 'editing',
  predictableActionArguments: true,
  context: {
    state: 'editing' as GameState,
    stations: [],
    customers: [],
    mainQueue: [], // Initialize empty main queue
    simulationSpeed: parseFloat(localStorage.getItem('simulationSpeed') || '1'), // Use saved speed or default to 1.0x
    // Initialize metrics from first simulation history entry
    metrics: simulationHistory.length > 0 ? {
      averageWaitTime: simulationHistory[0].averageWaitTime,
      averageQueueLength: simulationHistory[0].queueLength,
      serverUtilization: simulationHistory[0].utilization,
      utilization: simulationHistory[0].utilization,
      throughput: simulationHistory[0].throughput,
      totalCustomersServed: simulationHistory[0].customersServed,
      totalCustomersAbandoned: 0,
      peakQueueLength: simulationHistory[0].queueLength,
      customersInSystem: simulationHistory[0].queueLength,
      customerSatisfaction: 0,
      score: 0
    } : {
      averageWaitTime: 0,
      averageQueueLength: 0,
      serverUtilization: 0,
      utilization: 0,
      throughput: 0,
      totalCustomersServed: 0,
      totalCustomersAbandoned: 0,
      peakQueueLength: 0,
      customersInSystem: 0,
      customerSatisfaction: 0,
      score: 0
    },
    simulationParams: defaultSimulationParams,
    currentTime: 0,
    eventQueue: [],
    isAIEnabled: false,
    aiRecommendations: [],
    simulationHistory: simulationHistory
  } as GameStore,
  states: {
    editing: {
      on: {
        START_SIMULATION: 'simulating',
        ENABLE_AI: { target: 'editing', actions: 'enableAI' },
        UPDATE_STATIONS: { target: 'editing', actions: 'updateStations' },
        UPDATE_PARAMS: { target: 'editing', actions: 'updateParams' }
      }
    },
    simulating: {
      on: {
        PAUSE: 'paused',
        STOP: 'editing',
        COMPLETE: 'complete',
        UPDATE_SIMULATION: { target: 'simulating', actions: 'updateSimulation' }
      }
    },
    paused: {
      on: {
        RESUME: 'simulating',
        STOP: 'editing'
      }
    },
    complete: {
      on: {
        RESET: 'editing',
        NEW_SIMULATION: 'simulating'
      }
    }
  },
  // Handle loading realistic simulation history
  on: {
    SET_SIMULATION_HISTORY: { actions: 'setSimulationHistory' },
    SET_SIMULATION_SPEED: { actions: 'setSimulationSpeed' } // Add action to set simulation speed
  }
}, {
  actions: {
    enableAI: assign({
      isAIEnabled: true
    }),
    updateStations: assign({
      stations: (_, event: any) => event.stations
    }),
    updateParams: assign({
      simulationParams: (_, event: any) => event.params
    }),
    setSimulationHistory: assign({ simulationHistory: (_, event: any) => event.simulationHistory }),
    setSimulationSpeed: assign({
      simulationSpeed: (_, event: any) => event.speed
    }),
    updateSimulation: assign({
      customers: (_, event: any) => {
        console.log('updateSimulation action - customers:', event.customers?.length || 0, event.customers);
        return event.customers;
      },
      metrics: (_, event: any) => event.metrics,
      currentTime: (_, event: any) => event.currentTime,
      stations: (_, event: any) => {
        console.log('updateSimulation action - stations:', event.stations?.length || 0, event.stations);
        return event.stations;
      },
      mainQueue: (_, event: any) => {
        console.log('updateSimulation action - mainQueue:', event.mainQueue?.length || 0, event.mainQueue);
        return event.mainQueue || [];
      }
    })
  }
});

export function useGameState() {
  const [state, send] = useMachine(gameStateMachine);
  const [simulationEngine, setSimulationEngine] = useState<SimulationEngine | null>(null);
  const [aiAgent, setAiAgent] = useState<QLearningAgent | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const [lastStepTime, setLastStepTime] = useState<number>(0);

  // Initialize AI agent
  useEffect(() => {
    if (state.context.isAIEnabled && !aiAgent) {
      setAiAgent(new QLearningAgent());
    }
  }, [state.context.isAIEnabled, aiAgent]);

  // Load realistic simulation history
  useEffect(() => {
    (async () => {
      const data = await generateSimulationData(state.context.simulationParams.dayType);
      send({ type: 'SET_SIMULATION_HISTORY', simulationHistory: data });
    })();
  }, [send, state.context.simulationParams.dayType]);

  // Start simulation
  const startSimulation = useCallback(async () => {
    if (state.context.stations.length === 0) {
      alert('Please add at least one checkout station before starting simulation');
      return;
    }

    // Load realistic simulation data from CSV based on dayType
    try {
      const history = await generateSimulationData(state.context.simulationParams.dayType);
      send({ type: 'SET_SIMULATION_HISTORY', simulationHistory: history });
    } catch (err) {
      console.error('Failed to load simulation data', err);
    }

    const engine = new SimulationEngine(
      state.context.stations,
      state.context.simulationParams
    );
    setSimulationEngine(engine);
    setIsRunning(true);
    setLastStepTime(0);
    send({ type: 'START_SIMULATION' });
  }, [state.context.stations, state.context.simulationParams, send]);

  // Pause simulation
  const pauseSimulation = useCallback(() => {
    setIsRunning(false);
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      setAnimationFrame(null);
    }
    send({ type: 'PAUSE' });
  }, [animationFrame, send]);

  // Resume simulation
  const resumeSimulation = useCallback(() => {
    setIsRunning(true);
    setLastStepTime(0);
    send({ type: 'RESUME' });
  }, [send]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      setAnimationFrame(null);
    }
    setSimulationEngine(null);
    send({ type: 'STOP' });
  }, [animationFrame, send]);

  // Reset game
  const resetGame = useCallback(() => {
    setIsRunning(false);
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      setAnimationFrame(null);
    }
    setSimulationEngine(null);
    send({ type: 'RESET' });
  }, [animationFrame, send]);

  // Update stations
  const updateStations = useCallback((stations: CheckoutStation[]) => {
    send({ type: 'UPDATE_STATIONS', stations });
  }, [send]);

  // Update simulation parameters
  const updateParams = useCallback((params: Partial<SimulationParams>) => {
    const updatedParams = { ...state.context.simulationParams, ...params };
    send({ type: 'UPDATE_PARAMS', params: updatedParams });
  }, [state.context.simulationParams, send]);

  // Update simulation speed
  const updateSimulationSpeed = useCallback((speed: number) => {
    // Log to help debug speed change issues
    console.log('Setting simulation speed to:', speed);
    
    // Dispatch the speed change action
    send({ type: 'SET_SIMULATION_SPEED', speed });
    
    // We could also add a notification here if needed in the future
  }, [send]);

  // Enable AI
  const enableAI = useCallback(() => {
    send({ type: 'ENABLE_AI' });
    // Create AI agent immediately if it doesn't exist
    if (!aiAgent) {
      setAiAgent(new QLearningAgent());
    }
  }, [send, aiAgent]);

  // Generate AI recommendations
  const generateAIRecommendations = useCallback((): AIRecommendation[] => {
    if (!aiAgent || !state.context.isAIEnabled) return [];

    const queueLengths = state.context.stations.map(s => s.queue.length);
    const activeStations = state.context.stations.filter(s => s.isActive).length;
    const currentHour = Math.floor((state.context.currentTime / 3600) % 24);

    const qState = {
      queueLengths,
      activeStations,
      dayType: state.context.simulationParams.dayType,
      timeOfDay: currentHour
    };

    return aiAgent.generateRecommendations(qState, state.context.stations);
  }, [aiAgent, state.context]);

  // Animation loop for real-time simulation
  useEffect(() => {
    if (isRunning && simulationEngine && state.matches('simulating')) {
      let lastUpdate = 0;
      const targetFPS = 30; // Limit to 30 FPS for better performance
      const frameInterval = 1000 / targetFPS;
      
      const animate = (timestamp: number = 0) => {
        if (timestamp - lastUpdate < frameInterval) {
          const frame = requestAnimationFrame(animate);
          setAnimationFrame(frame);
          return;
        }
        lastUpdate = timestamp;
        
        // Apply simulation speed - determine if we should step the simulation in this frame
        const currentTime = performance.now();
        const timeSinceLastStep = currentTime - lastStepTime;
        
        // Calculate step interval - higher for slower speeds, lower for faster speeds
        // For speeds < 1, we increase the interval proportionally to slow down the simulation
        const speed = state.context.simulationSpeed;
        const baseStepInterval = 200;  // base interval in ms
        const stepInterval = speed < 1 
          ? baseStepInterval / speed  // Slower: increase interval (e.g. 0.5 speed = 400ms interval)
          : Math.max(50, baseStepInterval / speed); // Faster: decrease interval with a min of 50ms
        
        // Determine if we should step in this frame based on elapsed time and speed
        let shouldStep = false;
        if (lastStepTime === 0 || timeSinceLastStep >= stepInterval) {
          shouldStep = true;
          setLastStepTime(currentTime);
        }
        
        let hasMore = true;
        if (shouldStep) {
          // For speeds < 1, we need to potentially skip some frames
          // For speeds > 1, we perform multiple steps per frame
          const willStepThisFrame = speed < 1 
            ? Math.random() < speed // Probabilistic approach for slow speeds
            : true;
            
          if (willStepThisFrame) {
            // Calculate steps to perform based on speed
            // For slow speeds (< 1), always do just one step
            // For high speeds (> 1), do multiple steps proportionally
            const stepsToPerform = speed <= 1 
              ? 1 
              : Math.max(1, Math.floor(speed));
            
            // Log the actual simulation speed effect for debugging
            console.log(`Speed: ${speed}x, Steps: ${stepsToPerform}, Interval: ${stepInterval.toFixed(0)}ms`);
            
            for (let i = 0; i < stepsToPerform && hasMore; i++) {
              hasMore = simulationEngine.step();
            }
          }
          
          // Get fresh metrics after simulation steps
          const currentMetrics = simulationEngine.getCurrentMetrics();
          
          // Debug: Log customer data being sent
          const customers = simulationEngine.getCustomers();
          const mainQueue = simulationEngine.getMainQueue();
          const stations = simulationEngine.getStations();
          
          console.log('Sending UPDATE_SIMULATION:');
          console.log('  - customers:', customers.length, customers);
          console.log('  - mainQueue:', mainQueue.length, mainQueue);
          console.log('  - stations with queues:', stations.map(s => ({ id: s.id, queueLength: s.queue?.length || 0 })));
           
          // Update state with current simulation data
          send({
            type: 'UPDATE_SIMULATION',
            customers,
            metrics: currentMetrics,
            currentTime: simulationEngine.getCurrentTime(),
            stations,
            mainQueue
          });
        }

        if (hasMore) {
          const frame = requestAnimationFrame(animate);
          setAnimationFrame(frame);
        } else {
          setIsRunning(false);
          send({ type: 'COMPLETE' });
        }
       };

       const frame = requestAnimationFrame(animate);
       setAnimationFrame(frame);

       return () => {
         if (frame) {
           cancelAnimationFrame(frame);
         }
       };
     }
   }, [isRunning, simulationEngine, state, send, lastStepTime, state.context.simulationSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [animationFrame]);

  return {
    // State
    gameState: state.value as GameState,
    context: state.context,
    isRunning,
    
    // Actions
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetGame,
    updateStations,
    updateParams,
    updateSimulationSpeed,
    enableAI,
    generateAIRecommendations,
    
    // Utils
    canStartSimulation: state.context.stations.length > 0,
    canPause: state.matches('simulating') && isRunning,
    canResume: state.matches('paused'),
    canStop: state.matches('simulating') || state.matches('paused'),
    canReset: state.matches('complete'),
    
    // Simulation engine reference (for advanced operations)
    simulationEngine,
    aiAgent
  };
}

export default useGameState;
