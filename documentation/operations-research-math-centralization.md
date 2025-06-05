# Operations Research Math Centralization

## Overview

The codebase had Operations Research mathematical calculations scattered across multiple files. This document outlines the centralization approach and implementation of a unified `OperationsResearchMath` utility class.

## Current State Analysis

### Math Scattered Across Files

1. **`src/simulation/queueing.ts`** - M/M/c queueing theory formulas
2. **`src/simulation/engine.ts`** - Real-time metrics calculations in `updateMetrics()`
3. **`src/components/MetricsPanel.tsx`** - Queue length and utilization calculations
4. **`src/components/SimulationDashboard.tsx`** - M/M/c calculations and Little's Law
5. **`src/utils/gameUtils.ts`** - Performance scoring algorithms
6. **Test files** - Duplicated metric calculations

### Key Operations Research Concepts Found

- **M/M/c Queueing Theory**: Markovian arrival/service with c servers
- **Little's Law**: L = λW (relationship between queue length, arrival rate, and wait time)
- **Server Utilization**: ρ = λ/(cμ) where λ=arrival rate, μ=service rate, c=servers
- **Performance Metrics**: Throughput, wait times, queue lengths
- **Customer Satisfaction Models**: Based on wait times and queue lengths
- **Cost-Efficiency Calculations**: ROI and operational cost models

## Centralization Solution

### New Architecture

Created `src/utils/operationsResearchMath.ts` with organized sections:

1. **Basic Utility Methods**
   - `factorial()` - For queueing theory calculations
   - `exponentialRandom()` - Safe exponential distribution with bounds

2. **M/M/c Queueing Theory**
   - `calculateMMcMetrics()` - Complete theoretical M/M/c calculations
   - `calculateP0()` - Probability of empty system
   - Little's Law applications (Ls, Lq, Ws, Wq)

3. **Real-Time Simulation Metrics**
   - `calculateQueueMetrics()` - Current queue states
   - `calculateServerUtilization()` - With smoothing and bounds
   - `calculateThroughput()` - Early simulation handling
   - `calculateAverageWaitTime()` - With outlier protection

4. **Customer Satisfaction Models**
   - `calculateCustomerSatisfactionFromWaitTime()` - Simple wait-time based
   - `calculateCustomerSatisfaction()` - Multi-factor comprehensive model

5. **Performance Scoring**
   - `calculateWaitTimeScore()` - Wait time performance (0-100)
   - `calculateUtilizationScore()` - Optimal utilization scoring
   - `calculateThroughputScore()` - Efficiency vs arrival rate
   - `calculateOverallScore()` - Weighted performance score

6. **Optimization Calculations**
   - `calculateOptimalServers()` - Staffing optimization
   - `calculateServiceLevel()` - SLA calculations
   - `calculateCostEfficiency()` - ROI and cost-benefit analysis

7. **Comparison and Validation**
   - `compareSimulationWithTheory()` - Validate simulation accuracy

## Implementation Plan

### Phase 1: Create Centralized Module ✅
- [x] Create `OperationsResearchMath` class with all formulas
- [x] Organize methods by functional categories
- [x] Add comprehensive documentation

### Phase 2: Update Simulation Engine
- [ ] Refactor `updateMetrics()` in `engine.ts` to use centralized methods
- [ ] Replace scattered calculations with centralized calls
- [ ] Maintain backwards compatibility

### Phase 3: Update Components
- [ ] Refactor `MetricsPanel.tsx` to use centralized calculations
- [ ] Update `SimulationDashboard.tsx` to use centralized M/M/c formulas
- [ ] Clean up `gameUtils.ts` performance scoring

### Phase 4: Replace Queueing Module
- [ ] Migrate functionality from `queueing.ts` to centralized module
- [ ] Update imports throughout codebase
- [ ] Remove old `queueing.ts` file

### Phase 5: Testing and Validation
- [ ] Update test files to use centralized methods
- [ ] Validate that all calculations produce identical results
- [ ] Performance testing to ensure no regression

## Benefits of Centralization

### 1. Consistency
- Single source of truth for all OR calculations
- Eliminates duplicate implementations
- Ensures consistent formulas across components

### 2. Maintainability
- Easier to update formulas in one place
- Better organization and documentation
- Reduced code duplication

### 3. Testability
- Centralized testing of mathematical functions
- Easier to validate calculation accuracy
- Better unit test coverage

### 4. Educational Value
- Clear separation of OR concepts
- Well-documented formulas with variable explanations
- Better understanding of queueing theory relationships

### 5. Performance
- Optimized implementations with bounds checking
- Consistent error handling and edge cases
- Reduced computational overhead

## Key Mathematical Formulas Centralized

### M/M/c Queueing Theory
```
ρ = λ/μ                    // Traffic intensity
ρs = ρ/c                   // Server utilization  
Lq = P0 * (ρ^c * ρs) / (c! * (1-ρs)²)  // Avg queue length
Ls = Lq + ρ                // Avg customers in system
Ws = Ls/λ                  // Avg time in system (Little's Law)
Wq = Lq/λ                  // Avg wait time in queue
```

### Performance Metrics
```
Throughput = Customers Served / Time Elapsed
Utilization = Busy Servers / Total Active Servers
Customer Satisfaction = f(wait_time, queue_length, abandonment_rate)
Overall Score = 0.4*wait_score + 0.3*util_score + 0.3*throughput_score
```

### Cost Efficiency
```
Total Cost = Servers × Cost Per Hour
Revenue = Customers × Revenue Per Customer × Satisfaction Rate
Net Benefit = Revenue - Cost
Cost Efficiency = Net Benefit / Total Cost
```

## Usage Examples

### Basic M/M/c Calculation
```typescript
import { OperationsResearchMath } from '../utils/operationsResearchMath';

const lambda = 30; // 30 customers/hour arrival rate
const mu = 40;     // 40 customers/hour service rate per server  
const c = 2;       // 2 servers

const metrics = OperationsResearchMath.calculateMMcMetrics(lambda, mu, c);
console.log(`Average wait time: ${metrics.averageWaitTime} hours`);
console.log(`Server utilization: ${metrics.utilization * 100}%`);
```

### Real-time Metrics Update
```typescript
const queueMetrics = OperationsResearchMath.calculateQueueMetrics(
  stations, mainQueue, currentTime, totalQueueLengthTime
);

const utilization = OperationsResearchMath.calculateServerUtilization(
  stations, currentTime, totalUtilizationTime, previousUtilization
);

const satisfaction = OperationsResearchMath.calculateCustomerSatisfaction(
  avgWaitTimeMinutes, averageQueueLength, abandonmentRate, previousSatisfaction
);
```

### Performance Scoring
```typescript
const overallScore = OperationsResearchMath.calculateOverallScore(
  waitTimeMinutes, utilization, throughput, arrivalRate
);

const grade = overallScore >= 90 ? 'A' : 
              overallScore >= 80 ? 'B' : 
              overallScore >= 70 ? 'C' : 
              overallScore >= 60 ? 'D' : 'F';
```

## Future Enhancements

1. **Advanced Queueing Models**
   - M/M/c/K (finite capacity)
   - M/G/1 (general service time distribution)
   - Priority queuing systems

2. **Simulation Validation**
   - Chi-square goodness of fit tests
   - Confidence intervals for metrics
   - Statistical significance testing

3. **Optimization Algorithms**
   - Genetic algorithms for layout optimization
   - Simulated annealing for staffing schedules
   - Linear programming for cost minimization

4. **Real-time Analytics**
   - Trend analysis and forecasting
   - Anomaly detection in queue behavior
   - Predictive performance modeling
