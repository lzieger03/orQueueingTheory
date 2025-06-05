// Operations Research Math Calculator - Centralized mathematical operations
// This module centralizes all queueing theory, performance metrics, and OR calculations

import type { Metrics, CheckoutStation, Customer, SimulationParams } from '../types';

/**
 * Centralized Operations Research Mathematics Calculator
 * Consolidates all mathematical formulas used throughout the application
 */
export class OperationsResearchMath {
  
  // ==================== BASIC UTILITY METHODS ====================
  
  /**
   * Calculate factorial (used in queueing theory formulas)
   */
  static factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  /**
   * Safe exponential distribution with bounds
   */
  static exponentialRandom(rate: number, maxMultiplier: number = 5): number {
    const safeRate = Math.max(0.0001, rate);
    const value = -Math.log(1 - Math.random()) / safeRate;
    const mean = 1 / safeRate;
    return Math.min(value, mean * maxMultiplier);
  }

  // ==================== M/M/C QUEUEING THEORY ====================

  /**
   * Calculate theoretical M/M/c queue metrics
   * @param lambda - Arrival rate (customers per unit time)
   * @param mu - Service rate per server (customers per unit time)  
   * @param c - Number of servers
   * @returns Complete theoretical metrics
   */
  static calculateMMcMetrics(lambda: number, mu: number, c: number): Metrics {
    // Traffic intensity (ρ)
    const rho = lambda / mu;
    
    // Server utilization
    const utilization = rho / c;
    
    // Check system stability
    if (utilization >= 1) {
      return this.getUnstableSystemMetrics(utilization);
    }

    // Calculate P0 (probability of empty system)
    const p0 = this.calculateP0(rho, c, utilization);

    // Average number of customers waiting in queue (Lq)
    const lq = (p0 * Math.pow(rho, c) * utilization) / 
               (this.factorial(c) * Math.pow(1 - utilization, 2));

    // Little's Law applications
    const ls = lq + rho; // Average number in system (Ls)
    const ws = ls / lambda; // Average time in system (Ws)
    // const wq = lq / lambda; // Average wait time in queue (Wq) - not used currently

    // Customer satisfaction model
    const satisfaction = this.calculateCustomerSatisfactionFromWaitTime(ws);

    return {
      averageWaitTime: ws,
      averageQueueLength: ls,
      serverUtilization: utilization,
      utilization: utilization,
      throughput: lambda,
      totalCustomersServed: 0, // Not applicable for theoretical
      totalCustomersAbandoned: 0,
      peakQueueLength: 0,
      customersInSystem: ls,
      customerSatisfaction: satisfaction * 100,
      score: satisfaction * 100
    };
  }

  /**
   * Calculate P0 for M/M/c system
   */
  private static calculateP0(rho: number, c: number, utilization: number): number {
    let p0Sum = 0;
    for (let n = 0; n < c; n++) {
      p0Sum += Math.pow(rho, n) / this.factorial(n);
    }
    p0Sum += (Math.pow(rho, c) / this.factorial(c)) * (1 / (1 - utilization));
    return 1 / p0Sum;
  }

  // ==================== REAL-TIME SIMULATION METRICS ====================

  /**
   * Calculate real-time queue metrics from simulation data
   */
  static calculateQueueMetrics(
    stations: CheckoutStation[], 
    mainQueue: Customer[], 
    currentTime: number,
    totalQueueLengthTime: number
  ): {
    currentQueueLength: number;
    stationQueueLength: number;
    mainQueueLength: number;
    averageQueueLength: number;
    customersInSystem: number;
  } {
    const stationQueueLength = stations.reduce((sum, s) => sum + (s.queue?.length || 0), 0);
    const mainQueueLength = mainQueue.length;
    const currentQueueLength = stationQueueLength + mainQueueLength;
    
    // Calculate busy stations
    const busyStations = stations.filter(s => s.servingCustomer).length;
    const customersInSystem = currentQueueLength + busyStations;
    
    // Time-weighted average queue length (Little's Law)
    const elapsedTime = Math.max(1, currentTime);
    const averageQueueLength = elapsedTime > 0 ? totalQueueLengthTime / elapsedTime : 0;

    return {
      currentQueueLength,
      stationQueueLength,
      mainQueueLength,
      averageQueueLength,
      customersInSystem
    };
  }

  /**
   * Calculate server utilization with realistic bounds
   */
  static calculateServerUtilization(
    stations: CheckoutStation[],
    currentTime: number,
    totalUtilizationTime: number,
    previousUtilization: number = 0,
    smoothingFactor: number = 0.8
  ): number {
    const activeStations = stations.filter(s => s.isActive && !s.onBreak);
    // const busyStations = activeStations.filter(s => s.servingCustomer !== null);
    
    if (activeStations.length === 0) return 0;

    // Calculate instantaneous utilization
    // const baseUtilization = busyStations.length / activeStations.length;
    
    // Factor in queue pressure for realism
    // const totalQueueSize = stations.reduce((sum, s) => sum + s.queue.length, 0);
    // let instantaneousUtilization = baseUtilization;
    
    // if (totalQueueSize > 0) {
    //   const queuePressure = Math.min(0.15, totalQueueSize * 0.01);
    //   instantaneousUtilization = Math.min(0.99, baseUtilization + queuePressure);
    // }

    // Calculate time-weighted average utilization
    const elapsedTime = Math.max(1, currentTime);
    const rawUtilization = totalUtilizationTime / elapsedTime;
    
    // Apply smoothing to avoid jumps
    if (previousUtilization > 0) {
      return smoothingFactor * previousUtilization + (1 - smoothingFactor) * rawUtilization;
    }
    
    return rawUtilization;
  }

  /**
   * Calculate realistic throughput with early simulation handling
   */
  static calculateThroughput(
    servedCustomers: Customer[],
    currentTime: number,
    params: SimulationParams,
    activeStations: CheckoutStation[]
  ): number {
    const hoursElapsed = Math.max(0.05, currentTime / 3600); // Minimum 3 minutes
    
    // Use actual throughput after sufficient time
    if (hoursElapsed >= 0.05) {
      return servedCustomers.length / hoursElapsed;
    }
    
    // Early simulation estimate based on theoretical capacity
    const serviceTime = params.serviceTimeRegular || 82; // Default 82 seconds
    const avgServiceTimeHours = serviceTime / 3600;
    const theoreticalMaxThroughput = activeStations.length / avgServiceTimeHours;
    
    if (servedCustomers.length > 0) {
      return Math.min(
        theoreticalMaxThroughput * 0.7, 
        servedCustomers.length / Math.max(0.05, hoursElapsed)
      );
    }
    
    return 0;
  }

  /**
   * Calculate realistic average wait time with outlier protection
   */
  static calculateAverageWaitTime(
    completedCustomers: Customer[],
    maxRealisticWaitTime: number = 1800 // 30 minutes in seconds
  ): number {
    if (completedCustomers.length === 0) return 0;
    
    let totalRealisticWaitTime = 0;
    for (const customer of completedCustomers) {
      // Cap individual wait times to realistic maximum
      totalRealisticWaitTime += Math.min(customer.waitTime || 0, maxRealisticWaitTime);
    }
    
    return totalRealisticWaitTime / completedCustomers.length;
  }

  // ==================== CUSTOMER SATISFACTION MODELS ====================

  /**
   * Calculate customer satisfaction based on wait time
   */
  static calculateCustomerSatisfactionFromWaitTime(waitTimeSeconds: number): number {
    const maxAcceptableWait = 300; // 5 minutes in seconds
    return Math.max(0, 1 - (waitTimeSeconds / maxAcceptableWait));
  }

  /**
   * Calculate comprehensive customer satisfaction with multiple factors
   */
  static calculateCustomerSatisfaction(
    avgWaitTimeMinutes: number,
    averageQueueLength: number,
    abandonmentRate: number,
    previousSatisfaction?: number,
    smoothingFactor: number = 0.7
  ): number {
    // Base satisfaction on wait time (primary factor)
    let waitTimeSatisfaction = 0;
    if (avgWaitTimeMinutes <= 1) {
      waitTimeSatisfaction = 100;
    } else if (avgWaitTimeMinutes <= 2) {
      waitTimeSatisfaction = 90 - (avgWaitTimeMinutes - 1) * 10; // 90-80%
    } else if (avgWaitTimeMinutes <= 3) {
      waitTimeSatisfaction = 80 - (avgWaitTimeMinutes - 2) * 20; // 80-60%
    } else if (avgWaitTimeMinutes <= 5) {
      waitTimeSatisfaction = 60 - (avgWaitTimeMinutes - 3) * 15; // 60-30%
    } else {
      waitTimeSatisfaction = Math.max(0, 30 - (avgWaitTimeMinutes - 5) * 5); // <30%
    }
    
    // Secondary factors
    const queueLengthPenalty = Math.min(15, averageQueueLength * 2);
    const abandonmentPenalty = abandonmentRate * 20; // Up to 20% penalty
    
    // Calculate final satisfaction
    let satisfaction = Math.max(0, Math.min(100, 
      waitTimeSatisfaction - queueLengthPenalty - abandonmentPenalty));
      
    // Apply smoothing if previous value exists
    if (previousSatisfaction !== undefined) {
      satisfaction = smoothingFactor * previousSatisfaction + (1 - smoothingFactor) * satisfaction;
    }
    
    return satisfaction;
  }

  // ==================== PERFORMANCE SCORING ====================

  /**
   * Calculate wait time score (0-100) for performance evaluation
   */
  static calculateWaitTimeScore(waitTimeMinutes: number): number {
    if (waitTimeMinutes <= 1) return 100;
    if (waitTimeMinutes <= 2) return 90;
    if (waitTimeMinutes <= 3) return 75;
    if (waitTimeMinutes <= 5) return 50;
    if (waitTimeMinutes <= 7) return 25;
    return 0;
  }

  /**
   * Calculate utilization score with optimal range for service operations
   */
  static calculateUtilizationScore(utilization: number): number {
    // Optimal utilization for service operations is 70-85%
    if (utilization >= 0.7 && utilization <= 0.85) {
      return 100;
    } else if (utilization >= 0.6 && utilization < 0.7) {
      return 70 + (utilization - 0.6) * 300; // Scale from 70-100
    } else if (utilization > 0.85 && utilization <= 0.95) {
      return 100 - (utilization - 0.85) * 500; // Scale from 100-50
    } else if (utilization < 0.6) {
      return utilization * 100 / 0.6; // Scale from 0-70
    } else {
      return Math.max(0, 50 - (utilization - 0.95) * 1000); // Rapidly decline after 95%
    }
  }

  /**
   * Calculate throughput score based on arrival rate
   */
  static calculateThroughputScore(throughput: number, arrivalRate: number): number {
    const targetThroughput = arrivalRate * 60; // Convert to customers per hour
    const efficiency = throughput / Math.max(1, targetThroughput);
    
    if (efficiency >= 0.95) return 100;
    if (efficiency >= 0.8) return 80 + (efficiency - 0.8) * 133; // 80-100
    if (efficiency >= 0.6) return 60 + (efficiency - 0.6) * 100; // 60-80
    return efficiency * 100; // 0-60
  }

  /**
   * Calculate overall performance score with weighted components
   */
  static calculateOverallScore(
    waitTimeMinutes: number,
    utilization: number,
    throughput: number,
    arrivalRate: number,
    weights: { waitTime: number; utilization: number; throughput: number } = 
      { waitTime: 0.4, utilization: 0.3, throughput: 0.3 }
  ): number {
    const waitTimeScore = this.calculateWaitTimeScore(waitTimeMinutes);
    const utilizationScore = this.calculateUtilizationScore(utilization);
    const throughputScore = this.calculateThroughputScore(throughput, arrivalRate);
    
    return (waitTimeScore * weights.waitTime) + 
           (utilizationScore * weights.utilization) + 
           (throughputScore * weights.throughput);
  }

  // ==================== OPTIMIZATION CALCULATIONS ====================

  /**
   * Calculate optimal number of servers for target utilization
   */
  static calculateOptimalServers(
    lambda: number, 
    mu: number, 
    targetUtilization: number
  ): number {
    const minServers = Math.ceil(lambda / mu); // Minimum for stability
    
    for (let c = minServers; c <= minServers + 10; c++) {
      const utilization = lambda / (c * mu);
      if (utilization <= targetUtilization) {
        return c;
      }
    }
    
    return minServers + 10; // Fallback
  }

  /**
   * Calculate service level metrics
   */
  static calculateServiceLevel(
    averageWaitTime: number, 
    targetWaitTime: number
  ): number {
    if (averageWaitTime <= targetWaitTime) {
      return 1.0; // 100% service level
    }
    return Math.max(0, 1 - ((averageWaitTime - targetWaitTime) / targetWaitTime));
  }

  /**
   * Calculate cost efficiency metrics
   */
  static calculateCostEfficiency(
    numberOfServers: number,
    staffCostPerHour: number,
    customerSatisfaction: number,
    revenuePerCustomer: number,
    customersPerHour: number
  ): {
    totalCost: number;
    totalRevenue: number;
    netBenefit: number;
    costEfficiency: number;
  } {
    const totalCost = numberOfServers * staffCostPerHour;
    const adjustedRevenue = customersPerHour * revenuePerCustomer * (customerSatisfaction / 100);
    const netBenefit = adjustedRevenue - totalCost;
    const costEfficiency = totalCost > 0 ? netBenefit / totalCost : 0;

    return {
      totalCost,
      totalRevenue: adjustedRevenue,
      netBenefit,
      costEfficiency
    };
  }

  // ==================== COMPARISON AND VALIDATION ====================

  /**
   * Compare simulation results with theoretical predictions
   */
  static compareSimulationWithTheory(
    theoreticalMetrics: Metrics, 
    simulationMetrics: Metrics
  ): {
    waitTimeDifference: number;
    queueLengthDifference: number;
    utilizationDifference: number;
    accuracy: number;
  } {
    const waitTimeDiff = Math.abs(
      theoreticalMetrics.averageWaitTime - simulationMetrics.averageWaitTime
    ) / Math.max(1, theoreticalMetrics.averageWaitTime);

    const queueLengthDiff = Math.abs(
      theoreticalMetrics.averageQueueLength - simulationMetrics.averageQueueLength
    ) / Math.max(1, theoreticalMetrics.averageQueueLength);

    const utilizationDiff = Math.abs(
      theoreticalMetrics.serverUtilization - simulationMetrics.serverUtilization
    ) / Math.max(0.01, theoreticalMetrics.serverUtilization);

    // Overall accuracy (closer to 1 is better)
    const accuracy = 1 - ((waitTimeDiff + queueLengthDiff + utilizationDiff) / 3);

    return {
      waitTimeDifference: waitTimeDiff,
      queueLengthDifference: queueLengthDiff,
      utilizationDifference: utilizationDiff,
      accuracy: Math.max(0, accuracy)
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate arrival rate patterns for different times of day
   */
  static generateArrivalPattern(
    dayType: 'weekday' | 'weekend',
    baseRate: number
  ): number[] {
    const hourlyMultipliers = dayType === 'weekday' 
      ? [
          0.1, 0.1, 0.1, 0.1, 0.1, 0.2, // 0-5 AM
          0.3, 0.5, 0.7, 0.8, 0.9, 1.2, // 6-11 AM
          1.5, 1.3, 1.1, 1.0, 1.2, 1.8, // 12-5 PM
          2.0, 1.6, 1.2, 0.8, 0.5, 0.3  // 6-11 PM
        ]
      : [
          0.1, 0.1, 0.1, 0.1, 0.1, 0.1, // 0-5 AM
          0.2, 0.3, 0.5, 0.8, 1.2, 1.5, // 6-11 AM
          1.8, 2.0, 1.9, 1.7, 1.5, 1.6, // 12-5 PM
          1.8, 1.6, 1.3, 1.0, 0.7, 0.4  // 6-11 PM
        ];

    return hourlyMultipliers.map(multiplier => baseRate * multiplier);
  }

  /**
   * Get metrics for unstable system (utilization >= 1)
   */
  private static getUnstableSystemMetrics(utilization: number): Metrics {
    return {
      averageWaitTime: Infinity,
      averageQueueLength: Infinity,
      serverUtilization: utilization,
      utilization: utilization,
      throughput: 0,
      totalCustomersServed: 0,
      totalCustomersAbandoned: 0,
      peakQueueLength: 0,
      customersInSystem: 0,
      customerSatisfaction: 0,
      score: 0
    };
  }
}
