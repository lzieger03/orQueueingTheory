// Sample implementation showing how to refactor engine.ts to use centralized OR math

/**
 * Updated updateMetrics method using centralized OperationsResearchMath
 * This replaces the existing scattered calculations with centralized methods
 */
private updateMetrics(): void {
  const deltaTime = this.currentTime - this.lastUpdateTime;
  
  // Update time-weighted tracking
  if (deltaTime > 0) {
    const currentQueueLength = this.mainQueue.length + this.stations.reduce(
      (sum, s) => sum + s.queue.length, 0
    );
    this.totalQueueLengthTime += currentQueueLength * deltaTime;
    this.queueLengthHistory.push({time: this.currentTime, length: currentQueueLength});
    
    // Calculate instantaneous utilization for time-weighted averaging
    const activeStations = this.stations.filter(s => s.isActive && !s.onBreak);
    const busyStations = activeStations.filter(s => s.servingCustomer !== null);
    const baseUtilization = activeStations.length > 0 ? busyStations.length / activeStations.length : 0;
    
    // Factor in queue pressure
    const totalQueueSize = this.stations.reduce((sum, s) => sum + s.queue.length, 0) + this.mainQueue.length;
    let instantaneousUtilization = baseUtilization;
    if (totalQueueSize > 0) {
      const queuePressure = Math.min(0.15, totalQueueSize * 0.01);
      instantaneousUtilization = Math.min(0.99, baseUtilization + queuePressure);
    }
    
    this.totalUtilizationTime += instantaneousUtilization * deltaTime;
  }

  // ============ USING CENTRALIZED OR MATH ============

  // 1. Calculate queue metrics using centralized method
  const queueMetrics = OperationsResearchMath.calculateQueueMetrics(
    this.stations, 
    this.mainQueue, 
    this.currentTime,
    this.totalQueueLengthTime
  );
  
  this.metrics.averageQueueLength = queueMetrics.averageQueueLength;
  this.metrics.customersInSystem = queueMetrics.customersInSystem;
  this.metrics.peakQueueLength = Math.max(this.metrics.peakQueueLength, queueMetrics.currentQueueLength);

  // 2. Calculate wait time using centralized method
  const completedCustomers = this.customers.filter(c => 
    c.waitTime !== undefined && c.serviceEndTime !== undefined
  );
  
  this.metrics.averageWaitTime = OperationsResearchMath.calculateAverageWaitTime(
    completedCustomers, 
    1800 // 30 minutes max wait time for retail
  );

  // 3. Calculate server utilization using centralized method
  this.metrics.serverUtilization = OperationsResearchMath.calculateServerUtilization(
    this.stations,
    this.currentTime,
    this.totalUtilizationTime,
    this.metrics.serverUtilization, // previous value for smoothing
    0.8 // smoothing factor
  );
  this.metrics.utilization = this.metrics.serverUtilization;

  // 4. Calculate throughput using centralized method
  const servedCustomers = this.customers.filter(c => c.serviceEndTime !== undefined);
  const activeStations = this.stations.filter(s => s.isActive && !s.onBreak);
  
  this.metrics.throughput = OperationsResearchMath.calculateThroughput(
    servedCustomers,
    this.currentTime,
    this.params,
    activeStations
  );

  // 5. Update customer counts
  this.metrics.totalCustomersServed = servedCustomers.length;
  // totalCustomersAbandoned is updated elsewhere when customers balk

  // 6. Calculate customer satisfaction using centralized method
  const avgWaitTimeMinutes = this.metrics.averageWaitTime / 60;
  const totalCustomers = this.metrics.totalCustomersServed + this.metrics.totalCustomersAbandoned;
  const abandonmentRate = totalCustomers > 0 ? 
    (this.metrics.totalCustomersAbandoned / totalCustomers) : 0;
  
  this.metrics.customerSatisfaction = OperationsResearchMath.calculateCustomerSatisfaction(
    avgWaitTimeMinutes,
    this.metrics.averageQueueLength,
    abandonmentRate,
    this.previousCustomerSatisfaction, // for smoothing
    0.7 // smoothing factor
  );
  
  this.previousCustomerSatisfaction = this.metrics.customerSatisfaction;

  // 7. Calculate overall performance score using centralized method
  this.metrics.score = OperationsResearchMath.calculateOverallScore(
    avgWaitTimeMinutes,
    this.metrics.serverUtilization,
    this.metrics.throughput,
    this.params.arrivalRate,
    { waitTime: 0.4, utilization: 0.3, throughput: 0.3 } // weights
  );

  // Update last update time
  this.lastUpdateTime = this.currentTime;
}

/**
 * Example of using theoretical M/M/c calculations for comparison
 */
getTheoreticalMetrics(): Metrics {
  const lambda = this.params.arrivalRate * 60; // Convert to customers per hour
  const serviceTimeSeconds = this.params.serviceTimeRegular || 82;
  const mu = 3600 / serviceTimeSeconds; // Service rate per server per hour
  const activeStations = this.stations.filter(s => s.isActive && !s.onBreak);
  const c = activeStations.length;
  
  return OperationsResearchMath.calculateMMcMetrics(lambda, mu, c);
}

/**
 * Example of comparing simulation with theory for validation
 */
validateSimulationAccuracy(): {
  accuracy: number;
  differences: any;
  isAccurate: boolean;
} {
  const theoretical = this.getTheoreticalMetrics();
  const simulation = this.getCurrentMetrics();
  
  const comparison = OperationsResearchMath.compareSimulationWithTheory(
    theoretical, 
    simulation
  );
  
  return {
    accuracy: comparison.accuracy,
    differences: comparison,
    isAccurate: comparison.accuracy > 0.8 // 80% accuracy threshold
  };
}
