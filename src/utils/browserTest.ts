// Browser test runner for kiosk queue overflow prevention
// This script will run the simulation tests and display results in the browser console

import { runSimulationTest } from './simulationTest';

// Function to run tests and display results in browser
export function runBrowserTests() {
  console.group('🧪 CHECKOUT GAME SIMULATION VALIDATION - KIOSK QUEUE FIX');
  console.log('Running simulation validation tests with focus on kiosk queue overflow...');
  
  try {
    const testResult = runSimulationTest();
    
    console.log('\n=== VALIDATION RESULTS ===');
    if (testResult.isValid) {
      console.log('%c✅ All validation tests PASSED!', 'color: green; font-weight: bold');
      console.log('%cCustomer flow logic is working as expected and kiosk queues do not overflow.', 'color: green');
    } else {
      console.log('%c❌ Validation tests FAILED!', 'color: red; font-weight: bold');
      console.log('%cCustomer flow logic or kiosk queue management needs adjustment.', 'color: red');
    }
    
    console.log('\nDetailed Results:');
    console.log(`- Cash customers to regular checkout: ${testResult.stats.cashToRegularPercent.toFixed(1)}% (expected: 100%)`);
    console.log(`- Card customers < 5 items to self-checkout: ${testResult.stats.cardUnder5ToSelfPercent.toFixed(1)}% (expected: ~55%)`);
    console.log(`- Card customers >= 5 items to regular checkout: ${testResult.stats.cardOver5ToRegularPercent.toFixed(1)}% (expected: 100%)`);
    
    console.log('\nQueue Length Validation:');
    console.log(`- Kiosk queue lengths over time: ${testResult.stats.kioskQueueLengths.join(', ')}`);
    console.log(`- Maximum kiosk queue length: ${Math.max(...testResult.stats.kioskQueueLengths)}`);
    console.log(`- Kiosk queue overflow detected: ${testResult.stats.kioskQueueOverflow ? 'YES - PROBLEM!' : 'No - Fixed!'}`);
    
    return testResult;
  } catch (error) {
    console.error('Error running tests:', error);
    return { isValid: false, error };
  } finally {
    console.groupEnd();
  }
}

// Export the test function for use in UI
export const runTests = runBrowserTests;
