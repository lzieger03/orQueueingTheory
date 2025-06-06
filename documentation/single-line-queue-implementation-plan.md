# Single-Line Queue Implementation Plan

## Current Issue
Currently, the simulation assigns customers directly to individual checkout stations, causing uneven queue distribution with some stations having hundreds of customers while others might be empty. This creates an unrealistic customer flow and poor user experience.

## Proposed Solution
Implement a single-line queue system where:
1. All regular checkout customers join a single main queue
2. Customers with preference for self-checkout can skip the main queue and go directly to kiosk stations
3. The customer at the head of the main queue moves to the next available regular checkout
4. The queue is visually animated to show realistic customer movement

## Implementation Steps

### 1. Update Data Model ✅
- ✓ Modify the `Customer` interface to include `prefersSelfCheckout` boolean property
- ✓ Add `inMainQueue` boolean property to track if a customer is in the main queue
- ✓ Create a new `mainQueue` array in the `GameStore` interface to hold the centralized queue

### 2. Update Customer Generation Logic ✅
- ✓ Updated the `createCustomer` method in the `SimulationEngine` class to set self-checkout preference based on:
  - Number of items (customers with fewer items more likely to choose self-checkout)
  - Payment method (card payments more likely to use self-checkout than cash/voucher)
  - Created appropriate bias factor that makes ~30% of customers prefer self-checkout
  - Added day type influence on preferences (weekend shoppers more tech-savvy)
  - Implemented configurable probability settings through preference scores

### 3. Update Simulation Engine ✅
- Modify the `SimulationEngine` class:
  - ✓ Added `mainQueue` property to hold the centralized queue
  - ✓ Updated customer arrival processing to route customers based on preferences
  - ✓ For customers preferring regular checkout: add to `mainQueue`
  - ✓ For customers preferring self-checkout: find available kiosk or add to shortest kiosk queue
  - ✓ Added methods to move customers from `mainQueue` to available regular counters
  - ✓ Updated the `step()` method to check and reassign customers from main queue each simulation step
  - ✓ Implemented smart queue-balancing logic that considers:
    - Current queue lengths at each station
    - Customer characteristics (itemCount, paymentMethod)
    - Station service time and availability
  - ✓ Added event handling for abandonment if main queue exceeds configurable threshold

### 4. Update Visual Representation ✅
- ✓ Created new `MainQueueVisualizer` component to show the single line
- ✓ Positioned it centrally in the layout editor
- ✓ Implemented visualization showing individual customers in the queue with animations:
  - New arrivals joining at the end of the queue
  - The queue moving forward as customers leave
  - Customers moving from queue to available regular checkouts
  - Visual path showing customer movement
- ✓ Added visual indicators to distinguish customers by checkout preference
- ✓ Updated CSS to style the main queue line with:
  - Serpentine queue visualization for longer queues
  - Color coding based on customer characteristics
  - Size indicators for special cases (many items)
- ✓ Added responsive design elements to ensure queue visualization works on various screen sizes

### 5. Update Metrics Calculation ✅
- ✓ Modified how queue length and wait time metrics are calculated
- ✓ Included main queue in total queue length calculations
- ✓ Adjusted wait time calculations based on single-line simulation model
- ✓ Added new metrics specific to the centralized queue:
  - Separate counts for main queue vs. station queues
  - Improved distribution metrics across checkout types
  - Better queue efficiency indicators
- ✓ Enhanced visualization of queue statistics

### 6. Update UI Components ✅
- ✓ Modified `LayoutEditor` component to display the main queue
- ✓ Updated `MetricsPanel` to show statistics for main queue vs. individual queues
- ✓ Added styling improvements for better queue visualization

## Expected Outcome ✅
- ✓ More realistic customer flow with a single main queue feeding into regular checkout counters
- ✓ Self-checkout preference for some customers, bypassing the main queue
- ✓ Improved visual representation of the queuing system with smooth animations
- ✓ More balanced distribution of customers across checkout stations
- ✓ Reduced overall wait times due to more efficient queue management
- ✓ Better educational value showing how different queueing models affect retail operations

## Implementation Order ✅
1. ✓ Data model updates - COMPLETED
2. ✓ Customer generation logic - COMPLETED
3. ✓ Simulation engine changes - COMPLETED 
4. ✓ Visual representation - COMPLETED
5. ✓ Metrics updates - COMPLETED
6. ✓ UI component updates - COMPLETED
7. ✓ Animation and transition effects - COMPLETED
8. ✓ Performance optimization - COMPLETED

## Metrics to Validate Success ✅
- ✓ No more pileup of hundreds of customers at any single counter
- ✓ More balanced utilization across all checkout stations
- ✓ Reasonable queue length at all times
- ✓ Visual clarity of customer flow in the simulation
- ✓ Improved performance metrics (wait time, throughput)
- ✓ Smooth animations even with high customer volumes

## Technical Implementation Details

### Core Components to Modify
1. `SimulationEngine` - Add main queue management and routing logic
2. `LayoutEditor` - Add visualization for the single-line queue
3. `Customer` - Add properties for queue preference and status

### Animation Requirements
- Use CSS transitions or React Spring for smooth queue animations
- Implement requestAnimationFrame for performance-critical animations
- Add configurable animation speed tied to simulation speed

### Configuration Options
- Self-checkout preference probability
- Queue visualization style (linear, serpentine, etc.)
- Queue position in the store layout
- Maximum queue length before customer abandonment


# Current progress
