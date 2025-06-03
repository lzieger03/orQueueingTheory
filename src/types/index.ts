// Core game types for the Checkout Layout Game

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Checkout station types (clothing stores typically don't have express lanes)
export type CheckoutType = 'regular' | 'kiosk';

export interface CheckoutStation {
  id: string;
  type: CheckoutType;
  position: Position;
  size: Size;
  isActive: boolean;
  servingCustomer: Customer | null;
  queue: Customer[];
  serviceTime: number; // Mean service time in seconds
  maxQueueLength?: number; // Maximum queue length for this station
  onBreak: boolean; // Whether this station is currently on break
}

// Customer representation
export interface Customer {
  id: string;
  arrivalTime: number;
  serviceStartTime?: number;
  serviceEndTime?: number;
  waitTime?: number;
  itemCount: number;
  paymentMethod: 'cash' | 'card' | 'voucher';
  totalValue?: number; // Total purchase value
  prefersSelfCheckout?: boolean; // Whether customer prefers self-checkout kiosks
  inMainQueue?: boolean; // Whether customer is in main queue or individual station queue
}

// Simulation parameters for clothing stores
export interface SimulationParams {
  arrivalRate: number; // Customers per minute
  serviceTimeRegular?: number; // Mean service time for regular checkout
  serviceTimeKiosk?: number; // Mean service time for kiosk
  dayType: 'weekday' | 'weekend';
  simulationDuration: number; // In minutes
  maxCustomers: number;
  breakInterval?: number; // Minutes between breaks (0 = no breaks)
  breakDuration?: number; // Break length in minutes
}

// Performance metrics
export interface Metrics {
  averageWaitTime: number; // Wₛ - Average waiting time in system
  averageQueueLength: number; // Lₛ - Average number in system
  serverUtilization: number; // ρ - Server utilization ratio
  utilization: number; // Alias for serverUtilization
  throughput: number; // Customers served per hour
  totalCustomersServed: number;
  totalCustomersAbandoned: number;
  peakQueueLength: number;
  customersInSystem: number; // Current number of customers in system
  customerSatisfaction: number; // Based on wait time
  score: number; // Overall performance score (0-100)
}

// Simulation events
export type EventType = 'arrival' | 'serviceStart' | 'serviceEnd' | 'breakStart' | 'breakEnd';

export interface SimulationEvent {
  id: string;
  type: EventType;
  time: number;
  customerId?: string;
  stationId?: string;
  data?: any;
}

// Game state
export type GameState = 'editing' | 'simulating' | 'paused' | 'complete';

export interface GameStore {
  state: GameState;
  stations: CheckoutStation[];
  customers: Customer[];
  mainQueue: Customer[]; // Centralized queue for customers waiting for regular checkout
  metrics: Metrics;
  simulationParams: SimulationParams;
  currentTime: number;
  eventQueue: SimulationEvent[];
  isAIEnabled: boolean;
  aiRecommendations: AIRecommendation[];
  simulationHistory: SimulationData[];
}

// AI/ML types
export interface QState {
  queueLengths: number[];
  activeStations: number;
  dayType: string; // Make this string to be more flexible
  timeOfDay: number; // Hour of day 0-23
}

export interface QAction {
  type: 'openStation' | 'closeStation' | 'adjustBreaks';
  stationId?: string;
  value?: number;
}

export interface AIRecommendation {
  id?: string;
  type: 'layout' | 'staffing' | 'breaks' | 'add_station' | 'remove_station' | 'change_type' | 'move_station' | 'no_change';
  description: string;
  expectedImprovement?: number; // Percentage improvement in metrics
  confidence: number; // 0-1
  action?: QAction; // Optional since some recommendations don't have it
  // Additional properties for internal use
  impact: string;
  priority: 'low' | 'medium' | 'high';
  newType?: 'regular' | 'kiosk';
  newPosition?: Position;
}

// Store layout
export interface StoreLayout {
  id: string;
  name: string;
  size: Size;
  stations: CheckoutStation[];
  createdAt: Date;
  metrics?: Metrics;
}

// Drag and drop types
export interface DragItem {
  type: string;
  stationType: CheckoutType;
  id?: string;
}

// Chart data types
export interface ChartDataPoint {
  time: number;
  waitTime: number;
  queueLength: number;
  utilization: number;
  throughput: number;
}

// Break schedule
export interface BreakSchedule {
  stationId: string;
  startTime: number;
  duration: number; // In minutes
  type: 'break' | 'lunch';
}

// Payment method distribution
export interface PaymentMethodStats {
  cash: number;
  card: number;
  voucher: number;
}

// Real-world data integration
export interface HistoricalData {
  date: Date;
  dayType: 'weekday' | 'weekend';
  hourlyArrivalRates: number[];
  averageServiceTimes: {
    regular: number;
    kiosk: number;
  };
  paymentMethodDistribution: PaymentMethodStats;
  peakHours: number[];
  regularStations: number; // Number of regular stations
}

// Historical simulation data for charting
export interface SimulationData {
  timestamp: number;
  averageWaitTime: number;
  throughput: number;
  utilization: number;
  queueLength: number;
  customersServed: number;
}
