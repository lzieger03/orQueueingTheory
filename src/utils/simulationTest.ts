// Integration test for the improved simulation engine
// This file helps validate that the customer flow logic works as expected
// and that kiosk queues don't overflow

import { SimulationEngine } from '../simulation/engine';
import type { CheckoutStation, SimulationParams } from '../types';

// Create test stations
const testStations: CheckoutStation[] = [
  {
    id: 'regular_1',
    type: 'regular',
    position: { x: 100, y: 100 },
    size: { width: 80, height: 60 },
    isActive: true,
    queue: [],
    servingCustomer: null,
    maxQueueLength: 10,
    serviceTime: 75, // Average service time in seconds
    onBreak: false
  },
  {
    id: 'regular_2',
    type: 'regular',
    position: { x: 200, y: 100 },
    size: { width: 80, height: 60 },
    isActive: true,
    queue: [],
    servingCustomer: null,
    maxQueueLength: 10,
    serviceTime: 75, // Average service time in seconds
    onBreak: false
  },
  {
    id: 'kiosk_1',
    type: 'kiosk',
    position: { x: 300, y: 100 },
    size: { width: 60, height: 80 },
    isActive: true,
    queue: [],
    servingCustomer: null,
    maxQueueLength: 5, // Explicitly set max queue length for kiosk
    serviceTime: 90, // Average service time in seconds
    onBreak: false
  }
];

// Create test simulation parameters with realistic arrival rate
const testParams: SimulationParams = {
  arrivalRate: 0.5, // 0.5 customers per minute (30 customers per hour)
  simulationDuration: 60, // 60 minutes
  dayType: 'weekday',
  maxCustomers: 200, // Allow more customers to test queue limits
  breakInterval: 0, // No breaks for testing
  breakDuration: 0
};

// Run the simulation and collect statistics
export function runSimulationTest() {
  console.log('Starting simulation test with queue overflow prevention...');
  
  const engine = new SimulationEngine(testStations, testParams);
  
  // Statistics to track
  let totalCustomers = 0;
  let cashCustomers = 0;
  let cardCustomersUnder5Items = 0;
  let cardCustomersOver5Items = 0;
  let cashToRegular = 0;
  let cardUnder5ToSelf = 0;
  let cardUnder5ToRegular = 0;
  let cardOver5ToRegular = 0;
  
  // Track queue lengths over time
  const kioskQueueLengths: number[] = [];
  const mainQueueLengths: number[] = [];
  const regularQueueLengths: number[] = [];
  
  // Run simulation for 200 steps to really stress test
  for (let i = 0; i < 200; i++) {
    engine.step();
    
    // Every 10 steps, record queue lengths
    if (i % 10 === 0) {
      const stations = engine.getStations();
      const mainQueue = engine.getMainQueue();
      
      const kioskStation = stations.find(s => s.type === 'kiosk');
      const regularStations = stations.filter(s => s.type === 'regular');
      
      if (kioskStation) {
        kioskQueueLengths.push(kioskStation.queue.length);
      }
      
      mainQueueLengths.push(mainQueue.length);
      
      const avgRegularQueueLength = regularStations.reduce((sum, s) => sum + s.queue.length, 0) / 
                                   (regularStations.length || 1);
      regularQueueLengths.push(avgRegularQueueLength);
    }
  }
  
  // Analyze customer distribution
  const customers = engine.getCustomers();
  totalCustomers = customers.length;
  
  customers.forEach(customer => {
    if (customer.paymentMethod === 'cash') {
      cashCustomers++;
      if (!customer.prefersSelfCheckout) {
        cashToRegular++;
      }
    } else if ((customer.paymentMethod === 'card' || customer.paymentMethod === 'voucher') && customer.itemCount < 5) {
      cardCustomersUnder5Items++;
      if (customer.prefersSelfCheckout) {
        cardUnder5ToSelf++;
      } else {
        cardUnder5ToRegular++;
      }
    } else {
      cardCustomersOver5Items++;
      if (!customer.prefersSelfCheckout) {
        cardOver5ToRegular++;
      }
    }
  });
  
  // Calculate percentages
  const cashToRegularPercent = cashCustomers > 0 ? (cashToRegular / cashCustomers) * 100 : 0;
  const cardUnder5ToSelfPercent = cardCustomersUnder5Items > 0 ? (cardUnder5ToSelf / cardCustomersUnder5Items) * 100 : 0;
  const cardOver5ToRegularPercent = cardCustomersOver5Items > 0 ? (cardOver5ToRegular / cardCustomersOver5Items) * 100 : 0;
  
  // Check if kiosk queue ever exceeded max length
  const kioskMaxQueueLength = testStations.find(s => s.type === 'kiosk')?.maxQueueLength || 5;
  const kioskQueueOverflow = kioskQueueLengths.some(length => length > kioskMaxQueueLength);
  
  // Print results
  console.log('Simulation Test Results:');
  console.log(`Total customers: ${totalCustomers}`);
  console.log(`Cash customers: ${cashCustomers} (${(cashCustomers/totalCustomers*100).toFixed(1)}% of total)`);
  console.log(`Card customers < 5 items: ${cardCustomersUnder5Items} (${(cardCustomersUnder5Items/totalCustomers*100).toFixed(1)}% of total)`);
  console.log(`Card customers >= 5 items: ${cardCustomersOver5Items} (${(cardCustomersOver5Items/totalCustomers*100).toFixed(1)}% of total)`);
  
  console.log('\nCustomer Flow Validation:');
  console.log(`Cash customers to regular checkout: ${cashToRegularPercent.toFixed(1)}% (should be 100%)`);
  console.log(`Card customers < 5 items to self-checkout: ${cardUnder5ToSelfPercent.toFixed(1)}% (should be ~55%)`);
  console.log(`Card customers >= 5 items to regular checkout: ${cardOver5ToRegularPercent.toFixed(1)}% (should be 100%)`);
  
  console.log('\nQueue Length Validation:');
  console.log(`Kiosk max queue length: ${kioskMaxQueueLength}`);
  console.log(`Kiosk queue lengths over time: ${kioskQueueLengths.join(', ')}`);
  console.log(`Main queue lengths over time: ${mainQueueLengths.join(', ')}`);
  console.log(`Regular queue lengths over time: ${regularQueueLengths.join(', ')}`);
  console.log(`Did kiosk queue overflow? ${kioskQueueOverflow ? 'YES - PROBLEM!' : 'No - Fixed!'}`);
  
  // Validate metrics
  const metrics = engine.getCurrentMetrics();
  console.log('\nMetrics Validation:');
  console.log(`Average wait time: ${metrics.averageWaitTime.toFixed(2)} seconds`);
  console.log(`Throughput: ${metrics.throughput.toFixed(2)} customers/hour`);
  console.log(`Utilization: ${(metrics.utilization * 100).toFixed(2)}%`);
  console.log(`Customers served: ${metrics.totalCustomersServed}`);
  
  // Return validation result
  return {
    isValid: 
      cashToRegularPercent === 100 && 
      cardUnder5ToSelfPercent >= 50 && cardUnder5ToSelfPercent <= 60 &&
      cardOver5ToRegularPercent === 100 &&
      !kioskQueueOverflow,
    stats: {
      totalCustomers,
      cashToRegularPercent,
      cardUnder5ToSelfPercent,
      cardOver5ToRegularPercent,
      kioskQueueLengths,
      mainQueueLengths,
      regularQueueLengths,
      kioskQueueOverflow,
      metrics
    }
  };
}

// Export test stations and params for reuse
export { testStations, testParams };
