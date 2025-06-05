// Centralized Wait Time Calculator
// Standardizes wait time calculations across the entire application
import type { Customer } from '../types';

export class WaitTimeCalculator {
  
  /**
   * Calculate actual wait time from simulation data (in seconds)
   * Used by the simulation engine for real-time metrics
   */
  static calculateActualWaitTime(customers: Customer[]): number {
    const completedCustomers = customers.filter(c => 
      c.waitTime !== undefined && c.serviceEndTime !== undefined
    );
    
    if (completedCustomers.length === 0) {
      return 0;
    }
    
    // Cap maximum wait time to realistic retail maximum (30 minutes)
    const MAX_REALISTIC_WAIT_TIME = 1800; // 30 minutes in seconds
    
    let totalWaitTime = 0;
    for (const customer of completedCustomers) {
      const cappedWaitTime = Math.min(customer.waitTime || 0, MAX_REALISTIC_WAIT_TIME);
      totalWaitTime += cappedWaitTime;
    }
    
    return totalWaitTime / completedCustomers.length;
  }
  
  /**
   * Calculate theoretical wait time using M/M/c queueing theory (in seconds)
   * Used for theoretical predictions and optimization
   */
  static calculateTheoreticalWaitTime(
    arrivalRate: number,    // customers per second
    serviceRate: number,    // customers per second per server
    serverCount: number
  ): number {
    // Traffic intensity (ρ)
    const rho = arrivalRate / serviceRate;
    
    // Server utilization
    const utilization = rho / serverCount;
    
    // Check system stability
    if (utilization >= 1) {
      return Infinity; // Unstable system
    }
    
    // Calculate P0 (probability of empty system)
    const p0 = this.calculateP0(rho, serverCount, utilization);
    
    // Average number of customers waiting in queue (Lq)
    const lq = (p0 * Math.pow(rho, serverCount) * utilization) / 
               (this.factorial(serverCount) * Math.pow(1 - utilization, 2));
    
    // Average number of customers in system (Ls)
    const ls = lq + rho;
    
    // Average time in system (Ws) using Little's Law
    const ws = ls / arrivalRate;
    
    return ws;
  }
  
  /**
   * Calculate approximate wait time for historical/sample data (in seconds)
   * Used for generating realistic historical simulation data
   */
  static calculateApproximateWaitTime(
    arrivalRatePerHour: number,
    serviceTimeSeconds: number,
    serverCount: number,
    utilizationFactor: number = 1.0
  ): number {
    // Convert arrival rate to per second
    const arrivalRatePerSecond = arrivalRatePerHour / 3600;
    
    // Convert service time to service rate
    const serviceRatePerSecond = 1 / serviceTimeSeconds;
    
    // Calculate theoretical wait time
    const theoreticalWaitTime = this.calculateTheoreticalWaitTime(
      arrivalRatePerSecond,
      serviceRatePerSecond,
      serverCount
    );
    
    // Apply utilization factor for more realistic approximation
    return theoreticalWaitTime * utilizationFactor;
  }
  
  /**
   * Calculate wait time for display purposes (in minutes, formatted)
   * Used throughout the UI for consistent display formatting
   */
  static formatWaitTimeForDisplay(waitTimeSeconds: number): string {
    const minutes = waitTimeSeconds / 60;
    
    if (minutes < 1) {
      return `${Math.round(waitTimeSeconds)}s`;
    } else if (minutes < 60) {
      return `${minutes.toFixed(1)}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  }
  
  /**
   * Convert wait time between different units
   */
  static convertWaitTime(
    waitTime: number,
    fromUnit: 'seconds' | 'minutes' | 'hours',
    toUnit: 'seconds' | 'minutes' | 'hours'
  ): number {
    // Convert to seconds first
    let seconds: number;
    switch (fromUnit) {
      case 'seconds': seconds = waitTime; break;
      case 'minutes': seconds = waitTime * 60; break;
      case 'hours': seconds = waitTime * 3600; break;
    }
    
    // Convert from seconds to target unit
    switch (toUnit) {
      case 'seconds': return seconds;
      case 'minutes': return seconds / 60;
      case 'hours': return seconds / 3600;
    }
  }
  
  /**
   * Validate wait time for reasonableness in retail context
   */
  static isReasonableWaitTime(waitTimeSeconds: number): boolean {
    const MAX_REASONABLE_WAIT = 2400; // 40 minutes for retail
    const MIN_REASONABLE_WAIT = 0;
    
    return waitTimeSeconds >= MIN_REASONABLE_WAIT && 
           waitTimeSeconds <= MAX_REASONABLE_WAIT;
  }
  
  /**
   * Calculate customer satisfaction based on wait time
   * Uses industry-standard satisfaction curves
   */
  static calculateSatisfactionFromWaitTime(waitTimeSeconds: number): number {
    // Satisfaction curve based on retail research
    // 100% satisfaction at 0 wait, decreases exponentially
    const targetWaitTime = 120; // 2 minutes target
    const maxAcceptableWait = 300; // 5 minutes maximum
    
    if (waitTimeSeconds <= targetWaitTime) {
      return 1.0; // 100% satisfaction
    } else if (waitTimeSeconds >= maxAcceptableWait) {
      return 0.0; // 0% satisfaction
    } else {
      // Exponential decay between target and maximum
      const ratio = (waitTimeSeconds - targetWaitTime) / (maxAcceptableWait - targetWaitTime);
      return Math.max(0, 1 - Math.pow(ratio, 2));
    }
  }
  
  // Helper methods
  private static calculateP0(rho: number, c: number, utilization: number): number {
    let p0Sum = 0;
    
    // Sum for n = 0 to c-1
    for (let n = 0; n < c; n++) {
      p0Sum += Math.pow(rho, n) / this.factorial(n);
    }
    
    // Add term for n >= c
    p0Sum += (Math.pow(rho, c) / this.factorial(c)) * (1 / (1 - utilization));
    
    return 1 / p0Sum;
  }
  
  private static factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  
  /**
   * Get appropriate wait time calculation method description
   */
  static getCalculationMethodInfo(method: 'actual' | 'theoretical' | 'approximate'): string {
    switch (method) {
      case 'actual':
        return 'Based on actual customer wait times from simulation';
      case 'theoretical':
        return 'Based on M/M/c queueing theory calculations';
      case 'approximate':
        return 'Based on historical data approximation using queueing theory';
      default:
        return 'Unknown calculation method';
    }
  }
}

// Export convenience functions for backward compatibility
export const formatWaitTime = WaitTimeCalculator.formatWaitTimeForDisplay;
export const calculateSatisfaction = WaitTimeCalculator.calculateSatisfactionFromWaitTime;
