# Single-Line Queue Implementation Documentation

## Overview
This document tracks the implementation of the single-line queue system for the Checkout Layout Game simulation. The system creates a more realistic customer flow by directing customers to a centralized queue before assigning them to available regular checkout stations.

## Implementation Status

| Feature | Status |
|-|-|
| Data model updates | ✅ Complete |
| Simulation engine modifications | ✅ Complete |
| Main queue visualization | ✅ Complete |
| Metrics display updates | ✅ Complete |
| Animation and styling | ✅ Complete |
| Queue balancing logic | ✅ Complete |

## Completed Changes

### 1. Data Model Updates
- Added `prefersSelfCheckout` and `inMainQueue` properties to the `Customer` interface
- Added `mainQueue` array to the `GameStore` interface to hold the centralized queue

### 2. Simulation Engine Modifications
- Added `mainQueue` property to the `SimulationEngine` class
- Updated customer arrival logic to route customers based on preferences:
  - Customers with `prefersSelfCheckout: true` go directly to kiosk stations
  - All other customers join the centralized queue (`mainQueue`)
- Added methods to manage the main queue:
  - `findBestKioskStation()` - For self-checkout customers
  - `findBestRegularCheckout()` - For allocating customers from main queue
  - `processMainQueue()` - Move customers from main queue to available regular stations
- Updated service completion logic to check the main queue when a station becomes available
- Added metrics calculations for the centralized queue

### 3. State Management Updates
- Updated `useGameState` hook to handle mainQueue state
- Added mainQueue initialization and updates in simulation steps
- Ensured mainQueue is passed to UI components

### 4. Visual Representation
- Created `MainQueueVisualizer` component for rendering the centralized queue
- Implemented a serpentine layout pattern for visually appealing queue representation
- Added color coding to distinguish self-checkout preference customers
- Added animation for smooth customer transitions

### 5. Metrics Panel Updates
- Added dedicated metric cards for main queue and station queue lengths
- Updated metrics calculation to include main queue in system statistics

## Implementation Details

### Customer Generation Logic
The `createCustomer` method generates self-checkout preferences based on:
1. **Item Count**:
   - 0-3 items: +40% preference for self-checkout
   - 4-6 items: +20% preference for self-checkout
   - 7+ items: -30% preference for self-checkout (prefer regular checkouts)
   
2. **Payment Method**:
   - Card: +30% preference for self-checkout
   - Cash: -20% preference for self-checkout
   - Voucher: -40% preference for self-checkout
   
3. **Day Type**:
   - Weekend shoppers: +10% preference for self-checkout (assumed to be more tech-savvy)
   
4. **Base Rate**:
   - 30% base preference rate, modified by the above factors

### Customer Routing Logic
1. When a customer arrives:
   - Check if they prefer self-checkout (based on preferences determined at creation)
   - If yes, direct them to available kiosk stations
   - If no or no kiosks available, add them to the main queue

2. Main Queue Processing:
   - Each simulation step checks for available regular checkouts
   - If available, dequeue the next customer from main queue
   - Update customer's `inMainQueue` status and move to station

3. Queue Balancing:
   - Station selection considers customer characteristics and station load
   - Smart allocation of customers from main queue to optimize flow

## Animation and Styling
- Used CSS transitions for smooth customer movement
- Implemented queue path visualization with animated dashes
- Color coding indicates customer wait time and checkout preferences
- Serpentine queue pattern provides effective space usage

## Future Enhancements
- Add heatmap visualization of customer density
- Implement customer patience visualization (how likely to abandon queue)
- Add configurable queue layout patterns (linear, serpentine, double-line)
- Enhanced queue balancing algorithms with machine learning

## Usage
The single-line queue system is automatically active in all simulations. No configuration is needed, though future updates may add queue configuration options in the simulation parameters.
