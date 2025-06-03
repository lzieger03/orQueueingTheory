// Integration test for all improvements: Kiosk queue overflow, dashboard metrics, and AI component
import { SimulationEngine } from '../simulation/engine';
import { QLearningAgent } from '../ai/qlearning';
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
    serviceTime: 75, // Add serviceTime in seconds
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
    serviceTime: 75, // Add serviceTime in seconds
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
    serviceTime: 90, // Add serviceTime in seconds
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
export function runIntegratedTest() {
  console.log('Starting integrated validation test for all improvements...');
  
  const engine = new SimulationEngine(testStations, testParams);
  const aiAgent = new QLearningAgent();
  
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
  
  // Track metrics for dashboard validation
  const metricSnapshots: any[] = [];
  
  // Run simulation for 200 steps to really stress test
  for (let i = 0; i < 200; i++) {
    engine.step();
    
    // Every 10 steps, record queue lengths and metrics
    if (i % 10 === 0) {
      const stations = engine.getStations();
      const mainQueue = engine.getMainQueue();
      const metrics = engine.getCurrentMetrics();
      
      const kioskStation = stations.find(s => s.type === 'kiosk');
      const regularStations = stations.filter(s => s.type === 'regular');
      
      if (kioskStation) {
        kioskQueueLengths.push(kioskStation.queue.length);
      }
      
      mainQueueLengths.push(mainQueue.length);
      
      const avgRegularQueueLength = regularStations.reduce((sum, s) => sum + s.queue.length, 0) / 
                                   (regularStations.length || 1);
      regularQueueLengths.push(avgRegularQueueLength);
      
      // Save metrics snapshot for dashboard validation
      metricSnapshots.push({
        time: engine.getCurrentTime(),
        metrics: { ...metrics },
        kioskQueueLength: kioskStation ? kioskStation.queue.length : 0,
        mainQueueLength: mainQueue.length,
        regularQueueLength: avgRegularQueueLength
      });
    }
    
    // Every 50 steps, test AI learning
    if (i % 50 === 0) {
      // Create a state for AI agent
      const state = {
        queueLengths: engine.getStations().map(s => s.queue.length),
        activeStations: engine.getStations().filter(s => s.isActive).length,
        dayType: 'weekday',
        timeOfDay: Math.floor(engine.getCurrentTime() / 3600) % 24
      };
      
      // Test AI recommendations
      const recCount = aiAgent.generateRecommendations(state, engine.getStations()).length;
      console.log(`Generated ${recCount} AI recommendations`);
      
      // If we're at step 50, start learning
      if (i === 50) {
        aiAgent.startLearning(state, engine.getStations());
      }
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
  
  // Validate dashboard metrics
  const finalMetrics = engine.getCurrentMetrics();
  const regularStations = testStations.filter(s => s.type === 'regular' && s.isActive).length;
  const kioskStations = testStations.filter(s => s.type === 'kiosk' && s.isActive).length;
  const totalStations = regularStations + kioskStations;
  
  // M/M/c queue model calculations
  const lambda = finalMetrics.throughput || 0; // arrival rate
  const mu = totalStations > 0 ? (lambda / (finalMetrics.utilization || 0.01)) / totalStations : 0; // service rate per server
  const rho = totalStations > 0 ? lambda / (totalStations * mu) : 0; // traffic intensity
  
  // Little's Law calculations
  const L = finalMetrics.customersInSystem || 0; // average number of customers in system
  const Lq = L - (finalMetrics.utilization * totalStations); // average queue length
  const W = lambda > 0 ? L / lambda : 0; // average time in system
  const Wq = lambda > 0 ? Lq / lambda : 0; // average wait time in queue
  
  // Validate AI agent
  const aiProgress = aiAgent.getLearningProgress();
  const aiStats = aiAgent.getQTableStats();
  
  // Print results
  console.log('Integrated Test Results:');
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
  
  console.log('\nDashboard Metrics Validation:');
  console.log(`Arrival rate (λ): ${lambda.toFixed(2)}/hr`);
  console.log(`Service rate per server (μ): ${mu.toFixed(2)}/hr`);
  console.log(`Traffic intensity (ρ): ${rho.toFixed(2)} (${(rho*100).toFixed(0)}%)`);
  console.log(`Average number in system (L): ${L.toFixed(2)}`);
  console.log(`Average queue length (Lq): ${Lq.toFixed(2)}`);
  console.log(`Average time in system (W): ${W.toFixed(2)} hr (${(W*60).toFixed(2)} min)`);
  console.log(`Average wait time in queue (Wq): ${Wq.toFixed(2)} hr (${(Wq*60).toFixed(2)} min)`);
  
  console.log('\nAI Component Validation:');
  console.log(`Learning progress: ${aiProgress}%`);
  console.log(`States learned: ${aiStats.stateCount}`);
  console.log(`Actions evaluated: ${aiStats.actionCount}`);
  console.log(`Max Q-value: ${aiStats.maxQValue.toFixed(2)}`);
  console.log(`Min Q-value: ${aiStats.minQValue.toFixed(2)}`);
  
  // Return validation result
  return {
    isValid: 
      cashToRegularPercent === 100 && 
      cardUnder5ToSelfPercent >= 50 && cardUnder5ToSelfPercent <= 60 &&
      cardOver5ToRegularPercent === 100 &&
      !kioskQueueOverflow &&
      rho < 1 && // Traffic intensity should be less than 1 for stable system
      aiProgress > 0, // AI should have made some progress
    stats: {
      totalCustomers,
      cashToRegularPercent,
      cardUnder5ToSelfPercent,
      cardOver5ToRegularPercent,
      kioskQueueLengths,
      mainQueueLengths,
      regularQueueLengths,
      kioskQueueOverflow,
      metrics: finalMetrics,
      orMetrics: {
        lambda, mu, rho, L, Lq, W, Wq
      },
      aiStats: {
        progress: aiProgress,
        stateCount: aiStats.stateCount,
        actionCount: aiStats.actionCount,
        maxQValue: aiStats.maxQValue,
        minQValue: aiStats.minQValue
      }
    }
  };
}

// Export test stations and params for reuse
export { testStations, testParams };
