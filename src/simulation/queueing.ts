// Queueing theory formulas and calculations for M/M/c systems
import type { Metrics } from '../types';

export class QueueingTheory {
  /**
   * Calculate theoretical metrics for M/M/c queue
   * @param lambda - Arrival rate (customers per unit time)
   * @param mu - Service rate per server (customers per unit time)
   * @param c - Number of servers
   * @returns Theoretical metrics
   */
  static calculateMMcMetrics(lambda: number, mu: number, c: number): Metrics {
    // Traffic intensity
    const rho = lambda / mu;
    
    // Server utilization
    const utilization = rho / c;
    
    if (utilization >= 1) {
      // System is unstable
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

    // Calculate P0 (probability of empty system)
    let p0Sum = 0;
    for (let n = 0; n < c; n++) {
      p0Sum += Math.pow(rho, n) / this.factorial(n);
    }
    p0Sum += (Math.pow(rho, c) / this.factorial(c)) * (1 / (1 - utilization));
    const p0 = 1 / p0Sum;

    // Average number of customers waiting in queue (Lq)
    const lq = (p0 * Math.pow(rho, c) * utilization) / 
               (this.factorial(c) * Math.pow(1 - utilization, 2));

    // Average number of customers in system (Ls)
    const ls = lq + rho;

    // Average time in system (Ws)
    const ws = ls / lambda;

    // Customer satisfaction based on waiting time
    const maxAcceptableWait = 300; // 5 minutes in seconds
    const satisfaction = Math.max(0, 1 - (ws / maxAcceptableWait));

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
      customerSatisfaction: satisfaction,
      score: satisfaction * 100
    };
  }

  /**
   * Calculate factorial
   */
  private static factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  /**
   * Calculate optimal number of servers for target utilization
   */
  static calculateOptimalServers(lambda: number, mu: number, targetUtilization: number): number {
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
   * Compare simulation results with theoretical predictions
   */
  static compareResults(
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
    ) / theoreticalMetrics.averageWaitTime;

    const queueLengthDiff = Math.abs(
      theoreticalMetrics.averageQueueLength - simulationMetrics.averageQueueLength
    ) / theoreticalMetrics.averageQueueLength;

    const utilizationDiff = Math.abs(
      theoreticalMetrics.serverUtilization - simulationMetrics.serverUtilization
    ) / theoreticalMetrics.serverUtilization;

    // Overall accuracy (closer to 1 is better)
    const accuracy = 1 - ((waitTimeDiff + queueLengthDiff + utilizationDiff) / 3);

    return {
      waitTimeDifference: waitTimeDiff,
      queueLengthDifference: queueLengthDiff,
      utilizationDifference: utilizationDiff,
      accuracy: Math.max(0, accuracy)
    };
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
   * Calculate staffing cost vs customer satisfaction trade-off
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
    const adjustedRevenue = customersPerHour * revenuePerCustomer * customerSatisfaction;
    const netBenefit = adjustedRevenue - totalCost;
    const costEfficiency = netBenefit / totalCost;

    return {
      totalCost,
      totalRevenue: adjustedRevenue,
      netBenefit,
      costEfficiency
    };
  }

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
}
