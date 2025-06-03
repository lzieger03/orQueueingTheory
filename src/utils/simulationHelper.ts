// Improved simulation helper for more accurate metrics
import type { SimulationData } from '../types';

/**
 * Generates realistic simulation data by parsing CSV files for given day type.
 * Fast-forwards through the data sequence.
 */
export async function generateSimulationData(dayType: 'weekday' | 'weekend'): Promise<SimulationData[]> {
  // Choose CSV file from public assets
  const fileName = dayType === 'weekday' ? 'Monday.csv' : 'Saturday.csv';
  const response = await fetch(`/csv/${fileName}`);
  const text = await response.text();

  // Simple CSV parsing
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => {
    const cols = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h.trim()] = (cols[i] || '').trim(); });
    return row;
  });

  // Convert rows to SimulationData with realistic timestamps
  let cumulativeTime = 0;
  let customersServed = 0;
  const result: SimulationData[] = [];
  
  // Process data in chunks to create more realistic metrics
  const chunkSize = 10; // Process 10 customers at a time for smoother metrics
  
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    let chunkServiceTime = 0;
    let chunkQueueLength = 0;
    
    // Calculate metrics for this chunk
    chunk.forEach(row => {
      const serviceTimeSec = parseFloat(row['Service Time (s)']) || 0;
      chunkServiceTime += serviceTimeSec;
      chunkQueueLength += parseInt(row['Queue Length'] || '0', 10);
      customersServed++;
    });
    
    // Average metrics for this time period
    const avgServiceTime = chunkServiceTime / chunk.length;
    const avgQueueLength = chunkQueueLength / chunk.length;
    cumulativeTime += avgServiceTime * chunk.length;
    
    // Calculate realistic metrics
    const throughput = (3600 / avgServiceTime); // customers per hour
    const utilization = Math.min(0.9, throughput / (chunk.length * 2)); // Assume 2 servers per chunk
    
    result.push({
      timestamp: cumulativeTime,
      averageWaitTime: avgServiceTime / 60, // minutes
      throughput: throughput,
      utilization: utilization,
      queueLength: avgQueueLength,
      customersServed: customersServed
    } as SimulationData);
  }
  
  return result;
}
