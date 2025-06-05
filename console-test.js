// Quick Browser Console Test Script for Customer Animation
// Copy and paste this entire script into the browser console and press Enter

console.log('🎯 Starting Customer Animation Debug Test');
console.log('1. Looking for current state...');

// Check if there are any stations already
const stationElements = document.querySelectorAll('[class*="station"]');
console.log(`Found ${stationElements.length} station elements in DOM`);

// Check if there are customer elements
const customerElements = document.querySelectorAll('.customer-icon, [class*="customer"]');
console.log(`Found ${customerElements.length} customer elements in DOM`);

// Function to click the gear/settings button to open station palette
function openStationPalette() {
  console.log('2. Looking for settings/gear button...');
  
  // Try different selectors for the settings button
  const selectors = [
    'button:has(svg[class*="Settings"])',
    'button[class*="settings"]',
    'svg[class*="Settings"]',
    'button:has(.lucide-settings)',
    'button[aria-label*="settings"]'
  ];
  
  let settingsButton = null;
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        settingsButton = elements[0].closest ? elements[0].closest('button') : elements[0];
        console.log(`Found settings button with selector: ${selector}`);
        break;
      }
    } catch (e) {
      // Some selectors might not work in all browsers
    }
  }
  
  if (!settingsButton) {
    // Fallback: look for any button in the top-right area
    const allButtons = document.querySelectorAll('button');
    console.log(`No settings button found, checking ${allButtons.length} buttons...`);
    allButtons.forEach((btn, i) => {
      const rect = btn.getBoundingClientRect();
      console.log(`Button ${i}: "${btn.textContent?.trim()}" at (${rect.right}, ${rect.top})`);
      // Look for buttons in top-right corner
      if (rect.right > window.innerWidth - 100 && rect.top < 100) {
        settingsButton = btn;
        console.log(`Selecting button ${i} as potential settings button`);
      }
    });
  }
  
  if (settingsButton) {
    console.log('3. Clicking settings button...');
    settingsButton.click();
    setTimeout(addStation, 500);
  } else {
    console.log('❌ Could not find settings button');
    console.log('Available buttons:', Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()));
  }
}

// Function to add a station
function addStation() {
  console.log('4. Looking for station add buttons...');
  
  // Look for station type buttons
  const stationSelectors = [
    'button:contains("Regular")',
    'button:contains("Self-Service")', 
    'button:has(span:contains("Regular"))',
    'button:has(span:contains("Self-Service"))',
    'button[class*="station"]'
  ];
  
  let stationButton = null;
  
  // Custom contains selector since CSS :contains isn't standard
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    const text = btn.textContent?.toLowerCase() || '';
    if (text.includes('regular') || text.includes('checkout') || text.includes('🛒')) {
      stationButton = btn;
      console.log(`Found station button: "${btn.textContent?.trim()}"`);
      break;
    }
  }
  
  if (stationButton) {
    console.log('5. Adding station...');
    stationButton.click();
    setTimeout(startSimulation, 1000);
  } else {
    console.log('❌ Could not find station add button');
    console.log('Available buttons after settings click:', Array.from(buttons).map(b => b.textContent?.trim()));
  }
}

// Function to start the simulation
function startSimulation() {
  console.log('6. Looking for start/play button...');
  
  const buttons = document.querySelectorAll('button');
  let startButton = null;
  
  for (const btn of buttons) {
    const text = btn.textContent?.toLowerCase() || '';
    const hasPlayIcon = btn.querySelector('svg[class*="Play"]') !== null;
    
    if (text.includes('start') || hasPlayIcon || text.includes('▶') || btn.innerHTML.includes('Play')) {
      startButton = btn;
      console.log(`Found start button: "${btn.textContent?.trim()}" hasPlayIcon: ${hasPlayIcon}`);
      break;
    }
  }
  
  if (startButton) {
    console.log('7. Starting simulation...');
    startButton.click();
    setTimeout(monitorResults, 2000);
  } else {
    console.log('❌ Could not find start button');
    console.log('Available buttons:', Array.from(buttons).map(b => ({
      text: b.textContent?.trim(),
      hasPlay: !!b.querySelector('svg[class*="Play"]')
    })));
  }
}

// Function to monitor results
function monitorResults() {
  console.log('8. Monitoring for customer animation...');
  
  let checkCount = 0;
  const maxChecks = 15;
  
  const monitor = setInterval(() => {
    checkCount++;
    
    const customers = document.querySelectorAll('.customer-icon, [class*="customer"]');
    const stations = document.querySelectorAll('[class*="station"]');
    
    console.log(`Check ${checkCount}: ${customers.length} customers, ${stations.length} stations`);
    
    if (customers.length > 0) {
      console.log('✅ SUCCESS: Customer elements found!');
      customers.forEach((customer, i) => {
        const rect = customer.getBoundingClientRect();
        console.log(`Customer ${i}: position (${rect.left}, ${rect.top}), visible: ${rect.width > 0 && rect.height > 0}`);
      });
      clearInterval(monitor);
    } else if (checkCount >= maxChecks) {
      console.log('❌ No customers found after monitoring');
      clearInterval(monitor);
    }
  }, 1000);
}

// Start the automated test
console.log('🚀 Starting automated test in 2 seconds...');
setTimeout(openStationPalette, 2000);
