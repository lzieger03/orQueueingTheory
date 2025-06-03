// Simple debug test - add this to a component temporarily
// Debug function to analyze simulation step by step

export const debugSimulation = () => {
  console.log('=== SIMULATION DEBUG START ===');
  
  // Import required modules
  const { SimulationEngine } = require('./simulation/engine');
  const { defaultSimulationParams } = require('./data/samples');
  
  const testStations = [
    { 
      id: 'station-1', 
      type: 'regular', 
      position: { x: 100, y: 100 }, 
      size: { width: 80, height: 60 }, 
      isActive: true, 
      servingCustomer: null, 
      queue: [], 
      serviceTime: 82, 
      onBreak: false 
    }
  ];

  const testParams = {
    ...defaultSimulationParams,
    simulationDuration: 2, // 2 minutes for quick testing
  };

  console.log('Parameters:', testParams);
  
  const engine = new SimulationEngine(testStations, testParams);
  
  // Run a few steps and analyze
  let step = 0;
  while (engine.step() && step < 10) {
    step++;
    const currentTime = engine.getCurrentTime();
    const metrics = engine.getCurrentMetrics();
    
    if (step % 3 === 0) {
      console.log(`Step ${step}: Time=${currentTime.toFixed(1)}s, Throughput=${metrics.throughput.toFixed(1)}/h`);
    }
  }
  
  const finalMetrics = engine.getCurrentMetrics();
  console.log('Final throughput:', finalMetrics.throughput);
  console.log('=== DEBUG END ===');
};
