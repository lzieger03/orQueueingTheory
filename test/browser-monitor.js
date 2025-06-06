// Real-time Customer Animation Monitor
// Paste this in browser console to monitor customer data flow

console.clear();
console.log('🔍 Customer Animation Monitor Started');
console.log('====================================');

// Override console.log to highlight our debug messages
const originalLog = console.log;
let customerDataLogs = [];

console.log = function(...args) {
  // Capture our debug messages
  const msg = args[0];
  if (typeof msg === 'string') {
    if (msg.includes('LayoutEditor props received') || 
        msg.includes('updateSimulation action') || 
        msg.includes('Sending UPDATE_SIMULATION')) {
      customerDataLogs.push({
        timestamp: Date.now(),
        message: msg,
        data: args.slice(1)
      });
      originalLog('%c' + msg, 'color: #00ff00; font-weight: bold', ...args.slice(1));
    } else {
      originalLog.apply(console, args);
    }
  } else {
    originalLog.apply(console, args);
  }
};

// Function to display current status
function showStatus() {
  const customers = document.querySelectorAll('.customer-icon, [class*="customer"]');
  const stations = document.querySelectorAll('[class*="station"]');
  const buttons = document.querySelectorAll('button');
  
  console.log('📊 Current Status:');
  console.log(`  • Customer elements in DOM: ${customers.length}`);
  console.log(`  • Station elements in DOM: ${stations.length}`);
  console.log(`  • Total buttons: ${buttons.length}`);
  console.log(`  • Debug logs captured: ${customerDataLogs.length}`);
  
  if (customers.length > 0) {
    console.log('👥 Customer Details:');
    customers.forEach((customer, i) => {
      const rect = customer.getBoundingClientRect();
      const styles = window.getComputedStyle(customer);
      console.log(`  Customer ${i}: pos(${rect.left.toFixed(0)}, ${rect.top.toFixed(0)}) size(${rect.width}x${rect.height}) visible:${styles.visibility} display:${styles.display}`);
    });
  }
  
  if (customerDataLogs.length > 0) {
    console.log('📈 Recent Debug Logs:');
    customerDataLogs.slice(-3).forEach((log, i) => {
      console.log(`  ${i + 1}. ${log.message}`);
    });
  }
}

// Function to help add stations
function helpAddStation() {
  console.log('🛠️ Station Addition Helper:');
  
  // Look for settings button
  const settingsBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.innerHTML.includes('Settings') || 
    btn.querySelector('svg[class*="Settings"]') ||
    btn.getBoundingClientRect().right > window.innerWidth - 100
  );
  
  if (settingsBtn) {
    console.log('⚙️ Found settings button, clicking...');
    settingsBtn.click();
    
    setTimeout(() => {
      const addButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent?.includes('Regular') || 
        btn.textContent?.includes('Self-Service') ||
        btn.innerHTML.includes('🛒') ||
        btn.innerHTML.includes('🖥️')
      );
      
      if (addButtons.length > 0) {
        console.log(`🏪 Found ${addButtons.length} station add buttons`);
        console.log('Click one of these to add a station:', addButtons.map(b => b.textContent?.trim()));
        
        // Auto-click first station type
        addButtons[0].click();
        console.log('✅ Added station automatically');
        
        setTimeout(helpStartSimulation, 1000);
      } else {
        console.log('❌ No station add buttons found after opening settings');
      }
    }, 500);
  } else {
    console.log('❌ Settings button not found');
    console.log('Available buttons:', Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()));
  }
}

// Function to help start simulation
function helpStartSimulation() {
  console.log('▶️ Simulation Start Helper:');
  
  const startBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Start') ||
    btn.querySelector('svg[class*="Play"]') ||
    btn.innerHTML.includes('▶')
  );
  
  if (startBtn) {
    console.log('🚀 Found start button, clicking...');
    startBtn.click();
    console.log('✅ Simulation started - watch for debug logs!');
    
    // Start monitoring
    setTimeout(() => {
      const monitor = setInterval(() => {
        showStatus();
      }, 3000);
      
      // Stop monitoring after 30 seconds
      setTimeout(() => clearInterval(monitor), 30000);
    }, 2000);
  } else {
    console.log('❌ Start button not found');
    console.log('Available buttons:', Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim(),
      hasPlay: !!b.querySelector('svg[class*="Play"]')
    })));
  }
}

// Add helper functions to window
window.showStatus = showStatus;
window.helpAddStation = helpAddStation;
window.helpStartSimulation = helpStartSimulation;

// Initial status
showStatus();

console.log('🎮 Available Commands:');
console.log('  • showStatus() - Show current DOM status');  
console.log('  • helpAddStation() - Auto-add a station');
console.log('  • helpStartSimulation() - Auto-start simulation');
console.log('');
console.log('💡 Quick Start: Run helpAddStation() to begin testing');
