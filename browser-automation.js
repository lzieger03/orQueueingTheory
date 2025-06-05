// Browser console script to add stations and start simulation programmatically
// Copy and paste this in the browser console to test customer animation

console.log('🎯 Customer Animation Debug Script');

// Function to add test stations programmatically
function addTestStations() {
  console.log('📝 Adding test stations...');
  
  // Try to find and click the settings button (gear icon)
  const settingsButton = document.querySelector('button[class*="gear"], button[class*="settings"], svg[class*="Settings"]')?.closest('button');
  
  if (settingsButton) {
    console.log('⚙️ Found settings button, clicking...');
    settingsButton.click();
    
    // Wait a moment for palette to appear
    setTimeout(() => {
      // Look for station add buttons
      const stationButtons = document.querySelectorAll('button[class*="station"], button:has(span:contains("Regular")), button:has(span:contains("Self-Service"))');
      
      if (stationButtons.length > 0) {
        console.log(`🏪 Found ${stationButtons.length} station buttons, clicking first one...`);
        stationButtons[0].click();
        
        // Add another station after a short delay
        setTimeout(() => {
          if (stationButtons[1]) {
            console.log('🏪 Adding second station...');
            stationButtons[1].click();
          }
          
          // Try to start simulation
          setTimeout(startSimulation, 1000);
        }, 500);
      } else {
        console.log('❌ No station buttons found');
        console.log('Available buttons:', document.querySelectorAll('button'));
      }
    }, 500);
  } else {
    console.log('❌ Settings button not found');
    console.log('Available buttons:', document.querySelectorAll('button'));
  }
}

// Function to start simulation
function startSimulation() {
  console.log('▶️ Attempting to start simulation...');
  
  // Look for start button (Play icon or "Start" text)
  const startButton = document.querySelector('button:has(svg[class*="Play"]), button:contains("Start"), button[class*="start"]');
  
  if (startButton) {
    console.log('🚀 Found start button, clicking...');
    startButton.click();
    
    // Monitor for debug logs
    setTimeout(monitorCustomers, 2000);
  } else {
    console.log('❌ Start button not found');
    console.log('Looking for buttons with Play icon or Start text...');
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach((btn, i) => {
      console.log(`Button ${i}:`, btn.textContent, btn.className);
    });
  }
}

// Function to monitor customer data
function monitorCustomers() {
  console.log('👀 Monitoring customer data...');
  
  // Look for customer icons in the DOM
  const customerIcons = document.querySelectorAll('.customer-icon, [class*="customer"]');
  console.log(`Found ${customerIcons.length} customer elements in DOM`);
  
  // Check if React DevTools can access state
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools available for deeper inspection');
  }
  
  // Set up periodic monitoring
  const monitorInterval = setInterval(() => {
    const customers = document.querySelectorAll('.customer-icon, [class*="customer"]');
    const stationElements = document.querySelectorAll('[class*="station"]');
    
    console.log(`👥 Customers in DOM: ${customers.length}`);
    console.log(`🏪 Stations in DOM: ${stationElements.length}`);
    
    if (customers.length > 0) {
      console.log('✅ Customers found! Animation working!');
      customers.forEach((customer, i) => {
        console.log(`Customer ${i}:`, customer.style.cssText, customer.className);
      });
      clearInterval(monitorInterval);
    }
  }, 2000);
  
  // Stop monitoring after 30 seconds
  setTimeout(() => {
    clearInterval(monitorInterval);
    console.log('⏰ Monitoring stopped');
  }, 30000);
}

// Manual helpers
window.addTestStations = addTestStations;
window.startSimulation = startSimulation;
window.monitorCustomers = monitorCustomers;

console.log('🔧 Debug functions added to window:');
console.log('- addTestStations() - Add stations and start simulation');
console.log('- startSimulation() - Start simulation manually');
console.log('- monitorCustomers() - Monitor customer elements');
console.log('');
console.log('💡 Run addTestStations() to automatically add stations and start simulation');
