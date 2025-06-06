// Test script to verify AI Learning functionality
// Run this in the browser console after loading the application

console.log('🧪 Testing AI Learning Functionality...');

// Test 1: Check if AI components are loaded
const testAIComponents = () => {
  console.log('📝 Test 1: Checking AI components...');
  
  // Look for the Brain button (AI Advisor toggle)
  const brainButton = document.querySelector('button[title*="AI"], button:has(svg.lucide-brain)');
  console.log('Brain button found:', !!brainButton);
  
  if (brainButton) {
    brainButton.click();
    console.log('✅ AI Advisor panel opened');
    
    // Wait for AI Advisor to load
    setTimeout(() => {
      const learningTab = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes('Learning')
      );
      
      if (learningTab) {
        learningTab.click();
        console.log('✅ Learning tab opened');
        
        // Look for Start Learning button
        setTimeout(() => {
          const startButton = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent?.includes('Start Learning')
          );
          
          if (startButton) {
            console.log('✅ Start Learning button found');
            console.log('🚀 Clicking Start Learning button...');
            startButton.click();
            
            // Monitor for learning progress
            setTimeout(() => {
              console.log('📊 Checking learning progress...');
              const progressElements = document.querySelectorAll('[class*="progress"], [class*="metric"]');
              console.log('Progress elements found:', progressElements.length);
              
              // Look for episode counter
              const episodeElement = Array.from(document.querySelectorAll('div')).find(el => 
                el.textContent?.includes('Episodes:')
              );
              
              if (episodeElement) {
                console.log('✅ Episodes counter found:', episodeElement.textContent);
              }
              
            }, 2000);
          } else {
            console.log('❌ Start Learning button not found');
          }
        }, 1000);
      } else {
        console.log('❌ Learning tab not found');
      }
    }, 1000);
  } else {
    console.log('❌ Brain button not found');
  }
};

// Test 2: Direct API test (if components are available)
const testAIDirectly = () => {
  console.log('📝 Test 2: Testing AI directly...');
  
  // Try to access the AI agent from React DevTools or global scope
  if (window.React) {
    console.log('✅ React is available');
    
    // This is a manual test - user should check console for learning logs
    console.log('💡 After clicking Start Learning, check console for:');
    console.log('   - "HandleStartLearning called!"');
    console.log('   - "QLearningAgent.startLearning called!"');
    console.log('   - "Running episodes X to Y"');
    console.log('   - Learning progress updates');
  }
};

// Run tests
console.log('🎯 Running AI Learning Tests...');
console.log('📋 Test Plan:');
console.log('1. Add checkout stations to the layout first');
console.log('2. Open AI Advisor panel');
console.log('3. Click Start Learning button');
console.log('4. Monitor console for learning progress');

// Start automated tests
testAIComponents();
setTimeout(testAIDirectly, 5000);

console.log('📝 Manual Testing Instructions:');
console.log('1. Ensure you have at least one checkout station in the layout');
console.log('2. Click the Brain icon to open AI Advisor');
console.log('3. Switch to "Learning" tab');
console.log('4. Click "Start Learning" button');
console.log('5. Watch the console for learning progress logs');
console.log('6. Verify that metrics update: Episodes, Exploration Rate, etc.');
