// Debug utility to test customer rendering
import { CheckoutStation } from '../types';

export const createTestStation = (): CheckoutStation => {
  return {
    id: 'debug-station-1',
    type: 'regular',
    position: { x: 200, y: 200 },
    size: { width: 80, height: 60 },
    isActive: true,
    servingCustomer: null,
    queue: [],
    serviceTime: 75,
    onBreak: false
  };
};

// Add to window for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).debugAddTestStation = () => {
    console.log('Debug: Adding test station...');
    const station = createTestStation();
    console.log('Test station:', station);
    
    // Dispatch event to add station
    const event = new CustomEvent('debugAddStation', { 
      detail: station
    });
    document.dispatchEvent(event);
  };
}
