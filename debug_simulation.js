// Debug script to analyze simulation metrics issues

import { SimulationEngine } from './src/simulation/engine.ts';
import { defaultSimulationParams } from './src/data/samples.ts';

// Test the simulation with minimal setup
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
  simulationDuration: 5, // 5 minutes for testing
  arrivalRate: 0.44 // 0.44 customers per minute
};

console.log('=== SIMULATION DEBUG TEST ===');
console.log('Test Parameters:');
console.log('- Arrival Rate:', testParams.arrivalRate, 'customers/minute');
console.log('- Service Time:', testParams.serviceTimeRegular, 'seconds');
console.log('- Simulation Duration:', testParams.simulationDuration, 'minutes');
console.log('- Expected arrivals in 5 minutes:', testParams.arrivalRate * 5, 'customers');

const engine = new SimulationEngine(testStations, testParams);

// Run simulation for a few steps and log details
let stepCount = 0;
let lastMetrics = null;

while (engine.step() && stepCount < 20) {
  stepCount++;
  const currentTime = engine.getCurrentTime();
  const metrics = engine.getCurrentMetrics();
  const customers = engine.getCustomers();
  
  // Log every few steps
  if (stepCount % 5 === 0) {
    console.log(`\n--- Step ${stepCount} (Time: ${currentTime.toFixed(2)}s / ${(currentTime/60).toFixed(2)}m) ---`);
    console.log('Total Customers Created:', customers.length);
    console.log('Customers Served:', metrics.totalCustomersServed);
    console.log('Current Throughput:', metrics.throughput.toFixed(2), 'customers/hour');
    console.log('Average Wait Time:', (metrics.averageWaitTime/60).toFixed(2), 'minutes');
    console.log('Server Utilization:', (metrics.serverUtilization * 100).toFixed(1), '%');
    
    // Check for unrealistic values
    if (metrics.throughput > 100) {
      console.log('⚠️  UNREALISTIC THROUGHPUT DETECTED!');
      console.log('Calculation: served customers =', metrics.totalCustomersServed);
      console.log('Hours elapsed =', (currentTime/3600).toFixed(4));
      console.log('Division result =', metrics.totalCustomersServed / (currentTime/3600));
    }
  }
}

console.log('\n=== FINAL RESULTS ===');
const finalMetrics = engine.getCurrentMetrics();
const finalTime = engine.getCurrentTime();
const allCustomers = engine.getCustomers();

console.log('Simulation Time:', (finalTime/60).toFixed(2), 'minutes');
console.log('Total Customers:', allCustomers.length);
console.log('Customers Served:', finalMetrics.totalCustomersServed);
console.log('Final Throughput:', finalMetrics.throughput.toFixed(2), 'customers/hour');
console.log('Actual arrival rate:', (allCustomers.length / (finalTime/60)).toFixed(2), 'customers/minute');

// Detailed analysis
const servedCustomers = allCustomers.filter(c => c.serviceEndTime !== undefined);
console.log('\n=== DETAILED ANALYSIS ===');
console.log('Served customers array length:', servedCustomers.length);
console.log('Hours elapsed calculation:', (finalTime/3600).toFixed(6));
console.log('Raw throughput calculation:', servedCustomers.length, '/', (finalTime/3600).toFixed(6), '=', (servedCustomers.length / (finalTime/3600)).toFixed(2));
