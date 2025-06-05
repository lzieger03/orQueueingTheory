// Improved simulation history data for more accurate dashboard
import type { SimulationData, HistoricalData } from '../types';
import { sampleHistoricalData } from './samples';
import { WaitTimeCalculator } from '../utils/waitTimeCalculator';

// Choose sample based on default parameters or first scenario
const sample: HistoricalData = sampleHistoricalData.find((s: HistoricalData) => s.dayType === 'weekday') || sampleHistoricalData[0];

// Create more realistic simulation history data
export const simulationHistory: SimulationData[] = sample.hourlyArrivalRates.map((rate: number, index: number) => {
  const serviceTimeMin = sample.averageServiceTimes.regular / 60;
  
  // Calculate more realistic utilization based on arrival rate and service time
  const utilization = Math.min((rate * serviceTimeMin) / (sample.regularStations * 60), 0.95);
  
  // Calculate realistic queue length based on utilization (using M/M/c formula approximation)
  const queueFactor = utilization > 0.8 ? 4 : (utilization > 0.6 ? 2 : 1);
  const queueLength = Math.round(rate * utilization * queueFactor / sample.regularStations);
  
  // Calculate realistic wait time using standardized calculator
  const waitTimeSeconds = WaitTimeCalculator.calculateApproximateWaitTime(
    rate, // arrival rate per hour
    sample.averageServiceTimes.regular, // service time in seconds
    sample.regularStations, // server count
    utilization // utilization factor
  );
  
  const waitTime = waitTimeSeconds / 60; // Convert to minutes
  
  return {
    timestamp: index * 3600,       // hourly steps
    averageWaitTime: waitTime,     // more realistic wait time calculation
    throughput: rate,              // customers per hour
    utilization: utilization,      // more accurate utilization
    queueLength: queueLength,      // more realistic queue length
    customersServed: Math.round(rate * (1 - (utilization > 0.9 ? 0.1 : 0))) // Some customers leave when utilization is very high
  } as SimulationData;
});
