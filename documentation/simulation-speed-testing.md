# Simulation Speed Control Testing Guide

## Overview
This document provides testing procedures to validate the simulation speed control improvements in the Checkout Layout Game.

## Testing Checklist

### 1. Speed Control Availability
- [ ] **Pre-Simulation**: Speed control button is visible in edit mode before starting simulation
- [ ] **During Simulation**: Speed control remains accessible during simulation
- [ ] **Speed Persistence**: Selected speed is saved to localStorage and restored on page reload

### 2. Speed Options Validation
Test each speed setting to ensure proper functionality:

#### 0.1x Speed (Ultra Slow)
- [ ] Simulation runs visibly slower than normal speed
- [ ] Customer animations are extended (15s duration)
- [ ] Queue updates are less frequent but still visible
- [ ] Customer movement to counters is clearly visible
- [ ] Glowing effects appear on moving customers

#### 0.25x Speed (Very Slow)
- [ ] Simulation runs at quarter speed
- [ ] Customer animations use 8s duration
- [ ] Smooth transitions between queue states
- [ ] Customer walking animations are clearly visible

#### 0.5x Speed (Half Speed)
- [ ] Simulation runs at half the normal rate
- [ ] All animations scale proportionally
- [ ] Performance remains smooth

#### 1x Speed (Normal)
- [ ] Baseline speed - reference for comparison
- [ ] No animation modifications applied

#### 2x Speed (Fast)
- [ ] Simulation runs twice as fast
- [ ] Animations are faster but still visible
- [ ] Performance remains stable

#### 4x Speed (Very Fast)
- [ ] Simulation runs at maximum speed
- [ ] Quick progression through simulation states
- [ ] Performance optimization maintains stability

### 3. Visual Elements Testing

#### Main Queue Position
- [ ] Queue visualizer appears at bottom of PlayBoard (`bottom-8`)
- [ ] Queue is centered horizontally (`left-1/2 transform -translate-x-1/2`)
- [ ] Queue appears above other elements (`z-30`)
- [ ] Queue remains visible during all simulation phases

#### Customer Animations
- [ ] **Normal Speed**: Standard movement animations
- [ ] **Slow Speeds**: Enhanced animations with glow effects
- [ ] **Ultra Slow**: Maximum animation detail with enhanced visibility
- [ ] **Fast Speeds**: Compressed but still comprehensible animations

### 4. Performance Testing

#### Memory Usage
- [ ] No memory leaks during extended slow-speed simulations
- [ ] Stable performance across all speed settings
- [ ] Browser remains responsive during simulation

#### CPU Usage
- [ ] Acceptable CPU usage at all speeds
- [ ] No excessive processing during slow speeds
- [ ] Smooth frame rates maintained

### 5. User Experience Testing

#### Speed Control Interface
- [ ] Clear visual feedback for selected speed
- [ ] Intuitive speed selection process
- [ ] Immediate response to speed changes
- [ ] Consistent behavior across different scenarios

#### Animation Quality
- [ ] Smooth transitions at all speeds
- [ ] No jarring or choppy movements
- [ ] Appropriate visual feedback for speed changes
- [ ] Enhanced visibility at slow speeds doesn't interfere with fast speeds

## Test Scenarios

### Scenario 1: Learning Mode (Slow Speeds)
1. Set up a simple layout with 2-3 checkout counters
2. Set simulation speed to 0.1x
3. Start simulation
4. Observe:
   - Individual customer movements
   - Queue formation and progression
   - Service completion animations
   - Statistics updates

### Scenario 2: Analysis Mode (Normal Speed)
1. Create a complex layout with multiple counter types
2. Use 1x speed for baseline measurements
3. Record key metrics for comparison

### Scenario 3: Optimization Mode (Fast Speeds)
1. Test multiple layout configurations rapidly
2. Use 2x or 4x speed for quick iteration
3. Validate that essential information is still visible

### Scenario 4: Speed Switching
1. Start simulation at normal speed
2. Switch to slow speed during active simulation
3. Switch to fast speed
4. Verify smooth transitions without errors

## Expected Results

### Successful Implementation
- ✅ All speed settings function as intended
- ✅ Visual enhancements work correctly at slow speeds
- ✅ Performance remains stable across all speeds
- ✅ User preferences are saved and restored
- ✅ Queue positioning is optimal and visible

### Common Issues to Watch For
- ❌ Animation stuttering at slow speeds
- ❌ Queue visualizer obscured by other elements
- ❌ Performance degradation during extended slow simulations
- ❌ Speed settings not persisting between sessions
- ❌ Customer movement animations not scaling properly

## Debugging Tips

### If Slow Speeds Don't Work
1. Check browser console for JavaScript errors
2. Verify `useGameState.ts` speed calculation logic
3. Confirm CSS animation classes are properly applied

### If Animations Are Choppy
1. Check CSS animation durations match speed settings
2. Verify keyframe animations are properly defined
3. Test on different browsers/devices

### If Queue Is Not Visible
1. Verify CSS positioning classes in MainQueueVisualizer
2. Check z-index values for proper layering
3. Test on different screen sizes

## Performance Benchmarks

Target performance metrics:
- **Memory Usage**: < 100MB for 10-minute simulation
- **CPU Usage**: < 20% average during simulation
- **Frame Rate**: Stable 60fps at normal speeds, 30fps minimum at slow speeds
- **Responsiveness**: UI interactions respond within 100ms

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Testing

Additional considerations for mobile devices:
- [ ] Touch interactions work correctly
- [ ] Performance remains acceptable
- [ ] Layout remains usable on smaller screens
- [ ] Battery usage is reasonable during slow simulations
