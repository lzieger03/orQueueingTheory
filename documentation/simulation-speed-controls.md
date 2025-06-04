# Simulation Speed Controls

## Overview
The Checkout Layout Game now features improved simulation speed controls that allow users to adjust how quickly the simulation runs. This is particularly useful for:

1. Slowing down the simulation to observe detailed customer movement
2. Speeding up the simulation to quickly see results
3. Finding the optimal speed for different devices and use cases

## Speed Control Options

The simulation speed control is located at the top of the game interface. It's a blue button labeled "Simulation Speed" with the current speed setting displayed.

- Click the button to cycle through available speed settings
- **Set your preferred speed before starting the simulation**
- The speed can be changed at any time (before, during, or when paused)
- Speed options range from 0.1x (ultra slow) to 10x (very fast)

## Implementation Details
The simulation speed affects:
- Customer animation timings
- Queue processing speed
- Visual feedback elements

The default speed is 1.0x, which represents normal speed. Values below 1.0x slow down the simulation, while values above 1.0x speed it up.

## Technical Notes
- Speed changes are handled by the `updateSimulationSpeed` function in `useGameState.ts`
- Animation timing is adjusted dynamically based on the current speed value
- The simulation engine processes more steps per frame at higher speeds

## Troubleshooting
If the simulation speed control is not responding:
1. Ensure the game is either running or paused (not in editing mode)
2. Check the browser console for any errors related to speed changes
3. Try restarting the simulation

## Additional Features
- Your preferred simulation speed is now saved automatically between sessions
- Ultra-slow 0.1x speed is available for detailed analysis of customer movement
- Visual indicator reminds you to set speed before starting the simulation
- Main queue now positioned at the bottom of the screen for better visibility
- Enhanced animations at very slow speeds (0.1x, 0.25x) for improved clarity

## Future Improvements
- Add keyboard shortcuts for changing simulation speed
- Implement fine-grained speed control with a slider
- Add ability to reset to default speed with a single click
