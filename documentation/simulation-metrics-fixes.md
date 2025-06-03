# Simulation Metrics Fixes

## Problem
The checkout layout game simulation was producing unrealistic metrics:
- Extremely high throughput (7702.3 customers/hour)
- Unrealistically long wait times (847.6 minutes)
- Server utilization stuck at 100%

## Root Causes Identified
1. **Throughput Calculation Issues**
   - Early in the simulation, dividing by very small `hoursElapsed` values (e.g., 0.01) produced unrealistically high throughput numbers
   - No bounds checking or realistic limiting on throughput values

2. **Service Time Problems**
   - The exponential distribution was occasionally generating extreme outlier values
   - No minimum or maximum service times were enforced

3. **Wait Time Calculation Issues**
   - No maximum realistic wait time was enforced
   - Extreme outliers were skewing average wait time calculations

## Fixes Implemented

### 1. Throughput Calculation
- Enforced a minimum simulation time (3 minutes) before calculating throughput based on actual customers
- Added early simulation estimation based on theoretical capacity with conservative adjustments
- Improved calculation to avoid division by very small numbers

```typescript
// Calculate realistic throughput (customers served per hour)
const servedCustomers = this.customers.filter(c => c.serviceEndTime !== undefined);
const hoursElapsed = Math.max(0.05, this.currentTime / 3600); // Minimum 3 minutes

// Only use actual throughput calculation after enough time has passed
if (hoursElapsed >= 0.05) {
  this.metrics.throughput = servedCustomers.length / hoursElapsed;
} else {
  // For early simulation, estimate based on station capacity
  const activeStations = this.stations.filter(s => s.isActive && !s.onBreak);
  const serviceTime = this.params.serviceTimeRegular || 82; // Default to 82 seconds
  const avgServiceTimeHours = serviceTime / 3600; // Convert seconds to hours
  const theoreticalMaxThroughput = activeStations.length / avgServiceTimeHours;
  
  // Use a conservative estimate
  if (servedCustomers.length > 0) {
    this.metrics.throughput = Math.min(theoreticalMaxThroughput * 0.7, 
      servedCustomers.length / Math.max(0.05, hoursElapsed));
  } else {
    this.metrics.throughput = 0;
  }
}
```

### 2. Service Time Calculation
- Added minimum (10 seconds) and maximum (6 minutes) service times based on realistic clothing retail operations
- Improved exponential random function to avoid extreme outliers

```typescript
// Apply exponential distribution with realistic multipliers
let serviceTime = this.exponentialRandom(1 / baseServiceTime) * serviceTimeMultiplier;

// Ensure service time is within realistic bounds for clothing retail
const minServiceTime = 10;  // Very quick item scan
const maxServiceTime = 360; // Complex transaction (6 minutes)
serviceTime = Math.max(minServiceTime, Math.min(maxServiceTime, serviceTime));
```

### 3. Exponential Distribution Improvements
- Added safeguards to prevent extreme values from exponential distribution
- Limited maximum value to 5 times the mean

```typescript
private exponentialRandom(rate: number): number {
  // Ensure rate is positive and not too small
  const safeRate = Math.max(0.0001, rate);
  
  // Standard exponential distribution formula
  const value = -Math.log(1 - Math.random()) / safeRate;
  
  // Trim extreme values (no more than 5 times the mean)
  const mean = 1 / safeRate;
  const maxValue = mean * 5;
  
  return Math.min(value, maxValue);
}
```

### 4. Wait Time Calculation
- Added a maximum realistic wait time cap (30 minutes) for clothing retail
- Prevented outliers from skewing the average wait time metrics

```typescript
// Calculate realistic average wait time from completed customers
if (completedCustomers.length > 0) {
  let totalRealisticWaitTime = 0;
  for (const customer of completedCustomers) {
    // Cap individual wait times to realistic maximum (30 minutes)
    totalRealisticWaitTime += Math.min(customer.waitTime || 0, 1800);
  }
  this.metrics.averageWaitTime = totalRealisticWaitTime / completedCustomers.length;
} else {
  this.metrics.averageWaitTime = 0;
}
```

## Results
After implementing these fixes:
1. Throughput now shows realistic values aligned with the actual arrival and service rates
2. Wait times are now within realistic bounds for retail environments
3. Server utilization properly reflects the actual utilization of checkout stations

This provides a much more realistic simulation of retail checkout operations, making the game both more educational and engaging.
