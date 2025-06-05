// Browser console debug script for customer animation investigation
// Paste this in the browser console to monitor customer data in real-time

console.log('🔍 Customer Animation Debug Monitor Started');

// Override console.log to highlight our debug messages
const originalLog = console.log;
console.log = function(...args) {
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes('[DEBUG]') || args[0].includes('🎯') || args[0].includes('📊')) {
      originalLog.apply(console, ['%c' + args[0], 'color: #00ff00; font-weight: bold', ...args.slice(1)]);
    } else {
      originalLog.apply(console, args);
    }
  } else {
    originalLog.apply(console, args);
  }
};

// Monitor customer state changes
let lastCustomerCount = 0;
let lastMainQueueCount = 0;

setInterval(() => {
  // Try to access React DevTools or global state if available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('🔍 React DevTools detected - monitoring state changes...');
  }
}, 5000);

console.log('📝 Instructions:');
console.log('1. Add checkout stations using the gear icon');
console.log('2. Click "Start Simulation"');
console.log('3. Watch for debug messages with customer data');
console.log('4. Look for customer icons in the layout area');
