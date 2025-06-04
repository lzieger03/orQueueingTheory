# Simulation Speed Implementation

## Overview
This document describes the technical implementation of the simulation speed control in the Checkout Layout Game, focusing on how the simulation speed affects the event processing and animation timing.

## Technical Implementation

### Core Simulation Speed Algorithm

The simulation speed implementation has been enhanced to properly handle both fast and slow speeds. The core implementation is in `useGameState.ts` in the animation loop:

```typescript
// Apply simulation speed - determine if we should step the simulation in this frame
const currentTime = performance.now();
const timeSinceLastStep = currentTime - lastStepTime;

// Calculate step interval - higher for slower speeds, lower for faster speeds
const speed = state.context.simulationSpeed;
const baseStepInterval = 200;  // base interval in ms
const stepInterval = speed < 1 
  ? baseStepInterval / speed  // Slower: increase interval (e.g. 0.5 speed = 400ms interval)
  : Math.max(50, baseStepInterval / speed); // Faster: decrease interval with a min of 50ms

// Determine if we should step in this frame based on elapsed time and speed
let shouldStep = false;
if (lastStepTime === 0 || timeSinceLastStep >= stepInterval) {
  shouldStep = true;
  setLastStepTime(currentTime);
}

if (shouldStep) {
  // For speeds < 1, we need to potentially skip some frames
  const willStepThisFrame = speed < 1 
    ? Math.random() < speed // Probabilistic approach for slow speeds
    : true;
    
  if (willStepThisFrame) {
    // Calculate steps to perform based on speed
    const stepsToPerform = speed <= 1 
      ? 1 
      : Math.max(1, Math.floor(speed));
    
    // Perform the simulation steps
    for (let i = 0; i < stepsToPerform && hasMore; i++) {
      hasMore = simulationEngine.step();
    }
  }
}
```

### Handling Slow Speeds (< 1.0x)

For simulation speeds less than 1.0x, two mechanisms are used:

1. **Increased Step Interval**: The time between simulation steps is inversely proportional to the speed. For example:
   - At 1.0x speed: 200ms between steps
   - At 0.5x speed: 400ms between steps
   - At 0.1x speed: 2000ms between steps

2. **Probabilistic Step Skipping**: For each animation frame where a step would normally occur, there's a probability equal to the speed that the step will actually be processed. For example:
   - At 0.5x speed: 50% chance of processing a step
   - At 0.1x speed: 10% chance of processing a step

This combination of techniques ensures a smooth visual experience while accurately representing slower speeds.

### Handling Fast Speeds (> 1.0x)

For simulation speeds greater than 1.0x, two mechanisms are used:

1. **Decreased Step Interval**: The time between processing steps is reduced proportionally to the speed, with a minimum of 50ms to prevent excessive CPU usage.

2. **Multiple Steps Per Frame**: The number of simulation steps processed in each animation frame is proportional to the speed. For example:
   - At 2.0x speed: 2 steps per frame
   - At 5.0x speed: 5 steps per frame
   - At 10.0x speed: 10 steps per frame

### Animation Timing

All animations in the UI (customer movements, queue visualizations, etc.) adapt their duration based on the simulation speed:

```typescript
const animationTime = Math.max(0.5, 2.5 / simulationSpeed);
```

This formula ensures that animations are faster at higher simulation speeds and slower at lower simulation speeds, but never too fast or too slow to be visually comprehensible.

### Enhanced Animation at Very Slow Speeds

For ultra-slow speeds (0.1x and 0.25x), special animation techniques are applied:

1. **Special Animation Keyframes**: A more detailed animation is used with more keyframes and enhanced visual effects:

```css
@keyframes slowQueueFlow {
  0% { transform: translateY(0) scale(1); box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
  25% { transform: translateY(-2px) scale(1.03); box-shadow: 0 0 8px rgba(255, 255, 255, 0.6); }
  50% { transform: translateY(-4px) scale(1.06); box-shadow: 0 0 12px rgba(255, 255, 255, 0.8); }
  75% { transform: translateY(-2px) scale(1.03); box-shadow: 0 0 8px rgba(255, 255, 255, 0.6); }
  100% { transform: translateY(0) scale(1); box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
}
```

2. **Dynamic Animation Duration**: Animation durations are calculated dynamically based on the simulation speed:

```typescript
animationDuration: `${Math.max(3, 3 / Math.min(simulationSpeed, 1))}s`
```

3. **Conditional Animation Class**: Special animation classes are applied specifically for slow speeds:

```tsx
className={`customer-icon customer-waiting ${simulationSpeed <= 0.25 ? 'slow-motion-queue' : ''}`}
```

## Performance Considerations

- At very high speeds (e.g., 10x), the simulation may become CPU-intensive as multiple steps are processed per frame.
- At very low speeds (e.g., 0.1x), the simulation uses fewer CPU resources, but animations may appear choppy due to the probabilistic step skipping.
- The minimum step interval of 50ms helps prevent browser performance issues at high speeds.

## User Preference Storage

The user's preferred simulation speed is stored in localStorage:

```typescript
localStorage.setItem('simulationSpeed', speed.toString());
```

And retrieved when the component mounts:

```typescript
useEffect(() => {
  const savedSpeed = localStorage.getItem('simulationSpeed');
  if (savedSpeed && !isNaN(parseFloat(savedSpeed))) {
    onSpeedChange(parseFloat(savedSpeed));
  }
}, []);
```

This ensures the user's preferred simulation speed persists between sessions.
