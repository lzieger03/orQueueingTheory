// Node.js test to verify simulation engine creates customers
// This will help us verify if the core simulation logic works

import { SimulationEngine } from './src/simulation/engine.js';

console.log('🧪 Testing SimulationEngine customer creation...');

// Create test stations
const testStations = [
  {
    id: 'test-station-1',
    type: 'regular',
    position: { x: 100, y: 100 },
    size: { width: 80, height: 60 },
    isActive: true,
    servingCustomer: null,
    queue: [],
    serviceTime: 75,
    onBreak: false
  }
];

// Create test parameters
const testParams = {
  arrivalRate: 0.5, // customers per second (higher for faster testing)
  serviceRate: 1.0 / 75, // service rate
  dayType: 'weekday',
  timeOfDay: 12,
  numStations: 1
};

console.log('Creating simulation engine...');
const engine = new SimulationEngine(testStations, testParams);

console.log('Running simulation for 10 steps...');
for (let i = 0; i < 10; i++) {
  const hasMore = engine.step();
  
  const customers = engine.getCustomers();
  const mainQueue = engine.getMainQueue();
  const stations = engine.getStations();
  
  console.log(`Step ${i + 1}:`);
  console.log(`  - Total customers: ${customers.length}`);
  console.log(`  - Main queue: ${mainQueue.length}`);
  console.log(`  - Station queues: ${stations.map(s => s.queue.length).join(', ')}`);
  
  if (!hasMore) {
    console.log('Simulation completed');
    break;
  }
}

console.log('✅ Node.js simulation test completed');
