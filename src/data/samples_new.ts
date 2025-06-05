// filepath: /Users/lars/Downloads/NewTest2/src/data/samples.ts
// Sample data and scenarios for the checkout layout game
import type { SimulationParams } from '../types';
import { realStoreData } from './realData';

// Achievement targets for metrics panel performance indicators
export const achievementTargets = {
  waitTime: {
    excellent: 20, // seconds
    good: 40,
    fair: 60,
  },
  utilization: {
    excellent: 0.95,
    good: 0.85,
    fair: 0.7,
  },
  satisfaction: {
    excellent: 0.95,
    good: 0.85,
    fair: 0.7,  
  },
};  

export const sampleHistoricalData = [
  // Weekday data (based on real Monday data)
  {
    date: new Date('2025-05-26'), // Monday
    dayType: 'weekday' as const,
    hourlyArrivalRates: [
      0.1, 0.1, 0.1, 0.1, 0.1, 0.2, // 0-5 AM (store closed)
      0.8, 1.2, 1.5, 1.8, 2.0, 2.2, // 6-11 AM (opening rush)
      2.8, 2.5, 2.0, 1.8, 2.2, 3.0, // 12-5 PM (lunch and afternoon)
      3.5, 2.8, 2.0, 1.5, 0.8, 0.3  // 6-11 PM (evening rush)
    ],
    averageServiceTimes: {
      regular: realStoreData.weekday.avgServiceTime, // 82 seconds from real data
      kiosk: Math.round(realStoreData.weekday.avgServiceTime * 1.2)   // 98 seconds
    },
    paymentMethodDistribution: realStoreData.weekday.paymentDistribution,
    peakHours: [12, 13, 17, 18, 19]
  },
  
  // Weekend data (based on real Saturday data)
  {
    date: new Date('2025-05-31'), // Saturday
    dayType: 'weekend' as const,
    hourlyArrivalRates: [
      0.1, 0.1, 0.1, 0.1, 0.1, 0.2, // 0-5 AM (store closed)
      1.5, 2.5, 4.0, 5.5, 6.5, 8.0, // 6-11 AM (weekend rush)
      10.0, 12.0, 11.0, 9.5, 8.5, 9.0, // 12-5 PM (peak shopping)
      8.5, 7.0, 5.5, 4.0, 2.5, 1.0  // 6-11 PM (evening wind down)
    ],
    averageServiceTimes: {
      regular: realStoreData.weekend.avgServiceTime, // 49 seconds from real data
      kiosk: Math.round(realStoreData.weekend.avgServiceTime * 1.15)    // 56 seconds (faster with help)
    },
    paymentMethodDistribution: realStoreData.weekend.paymentDistribution,
    peakHours: [11, 12, 13, 14, 15, 18, 19]
  }
];

export const defaultSimulationParams: SimulationParams = {
  arrivalRate: 0.44, // customers per minute (based on real weekday data: 22 customers in 8 hours = 0.0458/min)
  serviceTimeRegular: realStoreData.weekday.avgServiceTime, // 82 seconds from real data
  serviceTimeKiosk: Math.round(realStoreData.weekday.avgServiceTime * 1.2), // Kiosks 20% slower
  dayType: 'weekday',
  simulationDuration: 30, // minutes (30-minute simulation window)
  maxCustomers: 1000
};

// Real clothing store data based on CSV analysis
export const clothingStoreData = realStoreData;

export const storeLayouts = {
  small: {
    stations: [
      { id: 'station-1', type: 'regular' as const, position: { x: 100, y: 100 }, size: { width: 80, height: 60 }, isActive: true, servingCustomer: null, queue: [], serviceTime: realStoreData.weekday.avgServiceTime },
    ]
  },
  mixed: {
    stations: [
      { id: 'station-3', type: 'regular' as const, position: { x: 100, y: 100 }, size: { width: 80, height: 60 }, isActive: true, servingCustomer: null, queue: [], serviceTime: realStoreData.weekday.avgServiceTime },
      { id: 'station-4', type: 'regular' as const, position: { x: 250, y: 100 }, size: { width: 80, height: 60 }, isActive: true, servingCustomer: null, queue: [], serviceTime: realStoreData.weekday.avgServiceTime },
      { id: 'station-5', type: 'kiosk' as const, position: { x: 400, y: 100 }, size: { width: 60, height: 40 }, isActive: true, servingCustomer: null, queue: [], serviceTime: Math.round(realStoreData.weekday.avgServiceTime * 1.2) },
    ]
  }
};

export const tips = [
  'Real data shows weekdays average 82s service time vs 49s on weekends - staff work faster when busy!',
  'Weekend shoppers buy fewer items (1.5 avg) but there are 68% more customers than weekdays',
  'Cash payments take 40% longer than cards - voucher combinations take 60% longer',
  'Self-service kiosks help during peak times but customers need assistance with clothing tags',
  'Real stores take breaks every 90 minutes on weekdays but none on busy weekends',
  'Card payments dominate on weekends (89%) vs weekdays (59%) - plan accordingly',
  'Server utilization above 85% often leads to exponential wait time increases',
  'The optimal staffing depends on your target service level, not just minimizing cost',
  'Real data: Monday had 22 customers with 2 breaks, Saturday had 37 customers with no breaks',
  'Weekend customers prefer quick transactions - fewer items, more card payments'
];
