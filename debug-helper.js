
// Debug helper - temporarily add to browser console
window.debugStartSimulation = function() {
  // Add a station programmatically
  const event = new CustomEvent('debugAddStation', { 
    detail: { 
      type: 'regular',
      position: { x: 100, y: 100 }
    }
  });
  document.dispatchEvent(event);
  
  // Start simulation after short delay
  setTimeout(() => {
    const startBtn = document.querySelector('button');
    if (startBtn && startBtn.textContent.includes('Start')) {
      startBtn.click();
      console.log('Debug: Started simulation');
    }
  }, 1000);
};

// Auto-trigger on page load for debugging
setTimeout(() => {
  if (window.location.href.includes('localhost')) {
    console.log('Debug mode activated. Use window.debugStartSimulation() to add station and start simulation');
  }
}, 2000);
