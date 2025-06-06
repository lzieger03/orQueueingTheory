// Wait Time Calculation Standardization Plan
// ======================================

## Problem Identified
Multiple different wait time calculations across the codebase:

### 1. Engine (engine.ts) - ACTUAL SIMULATION
- Uses actual customer wait times from completed customers
- Caps maximum wait time at 1800 seconds (30 minutes)
- Units: seconds
- Formula: `sum(actualWaitTimes) / numberOfCustomers`

### 2. SimulationHistory (simulationHistory.ts) - HISTORICAL DATA
- Uses simplified approximation formula
- Units: minutes (converted from seconds)
- Formula: `waitTime = serviceTimeMin * (1 + queueLength * utilization)`

### 3. QueueingTheory (queueing.ts) - THEORETICAL M/M/c
- Uses proper queueing theory calculations
- Units: time units (likely seconds based on lambda/mu)
- Formula: `ws = ls / lambda` (Little's Law)

### 4. OperationsResearchMath (operationsResearchMath.ts) - THEORETICAL M/M/c
- Another implementation of M/M/c calculations
- Units: time units
- Formula: Similar to QueueingTheory

## Issues
1. **Unit inconsistency**: Some calculations in seconds, others in minutes
2. **Formula inconsistency**: Different approaches for calculating wait times
3. **Context mismatch**: Theoretical vs simulation vs historical approximations
4. **Display inconsistency**: Different parts of UI show different wait times

## Solution Plan
1. Standardize all wait time calculations to use seconds internally
2. Create a centralized wait time calculation utility
3. Ensure proper unit conversion for display (minutes for UI)
4. Use appropriate calculation method for each context:
   - Simulation: Use actual customer data (engine)
   - Theoretical: Use M/M/c formulas (queueing theory)
   - Historical: Use improved approximation based on queueing theory
   - Display: Always convert to minutes with consistent formatting

## Implementation Steps
1. Create WaitTimeCalculator utility class
2. Standardize engine calculations
3. Fix simulationHistory calculations
4. Ensure UI displays consistent units
5. Add unit tests for wait time calculations
