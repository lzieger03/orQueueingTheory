// Discrete-event simulation engine for M/M/c queueing system
import type {
  Customer,
  CheckoutStation,
  SimulationEvent,
  SimulationParams,
  Metrics
} from '../types';
import { realStoreData } from '../data/realData';

export class SimulationEngine {
  private eventQueue: SimulationEvent[] = [];
  private currentTime: number = 0;
  private customers: Customer[] = [];
  private stations: CheckoutStation[] = [];
  private mainQueue: Customer[] = []; // Single line queue for regular checkouts
  private params: SimulationParams;
  private metrics: Metrics;
  private customerId: number = 0;
  private eventId: number = 0;
  
  // Tracking variables for realistic metrics
  private totalQueueLengthTime: number = 0; // Sum of (queue_length * time_interval)
  private totalUtilizationTime: number = 0; // Sum of (utilization * time_interval) 
  private lastUpdateTime: number = 0;
  private queueLengthHistory: Array<{time: number, length: number}> = [];
  private previousCustomerSatisfaction?: number; // Store previous satisfaction for smoothing

  constructor(stations: CheckoutStation[], params: SimulationParams) {
    this.stations = [...stations];
    this.params = params;
    this.metrics = this.initializeMetrics();
    this.reset();
  }

  private initializeMetrics(): Metrics {
    return {
      averageWaitTime: 0,
      averageQueueLength: 0,
      serverUtilization: 0,
      utilization: 0,
      throughput: 0,
      totalCustomersServed: 0,
      totalCustomersAbandoned: 0,
      peakQueueLength: 0,
      customersInSystem: 0,
      customerSatisfaction: 100,
      score: 0
    };
  }

  reset(): void {
    this.eventQueue = [];
    this.currentTime = 0;
    this.customers = [];
    this.mainQueue = []; // Reset main queue
    this.customerId = 0;
    this.eventId = 0;
    this.metrics = this.initializeMetrics();
    
    // Reset tracking variables for realistic metrics
    this.totalQueueLengthTime = 0;
    this.totalUtilizationTime = 0;
    this.lastUpdateTime = 0;
    this.queueLengthHistory = [];
    this.previousCustomerSatisfaction = undefined;
    
    // Clear all station queues
    this.stations.forEach(station => {
      station.queue = [];
      station.servingCustomer = null;
    });

    // Schedule first customer arrival
    this.scheduleNextArrival();
    
    // Initialize metrics for real-time display
    this.updateMetrics();
  }

  // Break scheduling functionality has been removed

  private scheduleNextArrival(): void {
    // Check if we've reached the maximum number of customers
    const customersInSystem = this.customers.filter(c => !c.serviceEndTime).length;
    if (customersInSystem >= this.params.maxCustomers) {
      // Schedule a retry after a short delay
      this.addEvent({
        id: `event_${this.eventId++}`,
        type: 'arrival',
        time: this.currentTime + 5, // Try again in 5 seconds
        customerId: `retry_${this.customerId}`
      });
      return;
    }
    
    // Convert arrival rate from customers per hour to customers per second
    // for the exponential distribution (simulation time is in seconds)
    const arrivalRatePerSecond = this.params.arrivalRate / 3600;
    
    // Exponential distribution for arrival times (Poisson process)
    const interArrivalTime = this.exponentialRandom(arrivalRatePerSecond);
    const arrivalTime = this.currentTime + interArrivalTime;
    
    if (arrivalTime < this.params.simulationDuration * 60) {
      this.addEvent({
        id: `event_${this.eventId++}`,
        type: 'arrival',
        time: arrivalTime,
        customerId: `customer_${this.customerId++}`
      });
    }
  }

  private addEvent(event: SimulationEvent): void {
    // Insert event in chronological order
    let insertIndex = this.eventQueue.findIndex(e => e.time > event.time);
    if (insertIndex === -1) {
      this.eventQueue.push(event);
    } else {
      this.eventQueue.splice(insertIndex, 0, event);
    }
  }

  /**
   * Generate exponentially distributed random numbers with safeguards
   * @param rate The rate parameter (λ) where mean = 1/λ
   * @returns A random value from exponential distribution
   */
  private exponentialRandom(rate: number): number {
    // Ensure rate is positive and not too small to avoid extreme values
    const safeRate = Math.max(0.0001, rate);
    
    // Standard exponential distribution formula
    // Using 1 - Math.random() to avoid Math.log(0)
    const value = -Math.log(1 - Math.random()) / safeRate;
    
    // Trim extreme values that can occur with exponential distribution
    // (no more than 5 times the mean to avoid extreme outliers)
    const mean = 1 / safeRate;
    const maxValue = mean * 5;
    
    return Math.min(value, maxValue);
  }

  private createCustomer(customerId: string): Customer {
    // Use real clothing store data for customer characteristics
    const storeData = this.params.dayType === 'weekend' 
      ? realStoreData.weekend 
      : realStoreData.weekday;
    
    // Generate realistic item count based on real data
    // Weekday: avg 3.6 items, Weekend: avg 1.5 items
    const avgItems = storeData.avgItemsPerCustomer;
    const itemCount = Math.max(1, Math.round(avgItems + (Math.random() - 0.5) * 3));
    
    // Use real payment method distribution
    const paymentMethods: ('cash' | 'card' | 'voucher')[] = ['cash', 'card', 'voucher'];
    const paymentWeights = [
      storeData.paymentDistribution.cash,
      storeData.paymentDistribution.card,
      storeData.paymentDistribution.voucher
    ];
    
    let paymentMethod = paymentMethods[0];
    const rand = Math.random();
    let cumWeight = 0;
    for (let i = 0; i < paymentMethods.length; i++) {
      cumWeight += paymentWeights[i];
      if (rand <= cumWeight) {
        paymentMethod = paymentMethods[i];
        break;
      }
    }

    // Estimate purchase value (clothing stores typically $20-150 per transaction)
    const baseValue = 25 + Math.random() * 100; // $25-125 base
    const totalValue = baseValue + (itemCount - 1) * (15 + Math.random() * 25); // Additional items
    
    // IMPROVED CUSTOMER PREFERENCE LOGIC BASED ON REQUIREMENTS
    // 1. Barzahlung nur an normalen Kassen
    // 2. Kunden mit Karte/Mobile zu etwa 50% Selbstbedienung, wenn sie weniger als 5 Artikel haben
    let prefersSelfCheckout = false;
    
    // Cash payment customers always go to regular checkout
    if (paymentMethod === 'cash') {
      prefersSelfCheckout = false;
    } 
    // Card/voucher customers with fewer than 5 items have ~55% chance of preferring self-checkout
    else if ((paymentMethod === 'card' || paymentMethod === 'voucher') && itemCount < 5) {
      prefersSelfCheckout = Math.random() < 0.55; // Slightly over 50%
    }
    // All other cases: prefer regular checkout
    else {
      prefersSelfCheckout = false;
    }

    return {
      id: customerId,
      arrivalTime: this.currentTime,
      itemCount,
      paymentMethod,
      totalValue,
      prefersSelfCheckout,
      inMainQueue: false
    };
  }

  /**
   * Find the best kiosk station for self-checkout customers
   */
  private findBestKioskStation(_customer: Customer): CheckoutStation | null {
    // FIXED: Check if there are any kiosk stations at all
    const kioskStations = this.stations.filter(s => s.isActive && s.type === 'kiosk');
    if (kioskStations.length === 0) return null;
    
    // FIXED: Check if all kiosk stations are at capacity
    const availableKiosks = kioskStations.filter(station => {
      // Check if the station has reached its maximum queue length
      // Default max queue length of 5 if not specified
      const maxQueueLength = station.maxQueueLength || 5;
      return station.queue.length < maxQueueLength;
    });

    if (availableKiosks.length === 0) return null;
    
    // Find the kiosk with the shortest queue
    return availableKiosks.reduce((shortest, current) => {
      return current.queue.length < shortest.queue.length ? current : shortest;
    }, availableKiosks[0]);
  }

  /**
   * Find the best regular checkout station for customers in main queue
   */
  private findBestRegularCheckout(): CheckoutStation | null {
    const availableRegular = this.stations.filter(station => {
      // Must be active, regular type, and not serving a customer
      if (!station.isActive || station.type !== 'regular' || station.servingCustomer) return false;
      return true;
    });

    if (availableRegular.length === 0) return null;
    
    // Simply find the station with the shortest queue
    return availableRegular.reduce((shortest, current) => {
      return current.queue.length < shortest.queue.length ? current : shortest;
    }, availableRegular[0]);
  }

  /**
   * Process the main queue - assign customers to available checkout stations
   */
  private processMainQueue(): void {
    // Check for available regular checkout stations
    while (this.mainQueue.length > 0) {
      const availableStation = this.findBestRegularCheckout();
      
      if (!availableStation) break; // No available stations
      
      // Move customer from main queue to station queue
      const customer = this.mainQueue.shift()!;
      customer.inMainQueue = false;
      availableStation.queue.push(customer);
      
      // If station is idle, start service immediately
      if (!availableStation.servingCustomer) {
        this.startService(availableStation);
      }
    }
  }

  private processArrival(event: SimulationEvent): void {
    // Handle retry events differently
    if (event.customerId!.startsWith('retry_')) {
      // Just try to schedule next arrival
      this.scheduleNextArrival();
      return;
    }
    
    const customer = this.createCustomer(event.customerId!);
    this.customers.push(customer);

    // Check if customer prefers self-checkout
    if (customer.prefersSelfCheckout) {
      // Find best kiosk station for self-checkout customers
      const kioskStation = this.findBestKioskStation(customer);
      
      if (kioskStation) {
        // FIXED: Double-check that the kiosk queue isn't too long before adding
        const maxQueueLength = kioskStation.maxQueueLength || 5;
        if (kioskStation.queue.length < maxQueueLength) {
          // Add customer directly to kiosk queue
          kioskStation.queue.push(customer);
          
          // Update peak queue length
          this.metrics.peakQueueLength = Math.max(
            this.metrics.peakQueueLength, 
            kioskStation.queue.length
          );

          // If station is idle, start service immediately
          if (!kioskStation.servingCustomer) {
            this.startService(kioskStation);
          }
        } else {
          // FIXED: Kiosk queue is full, redirect to main queue
          customer.inMainQueue = true;
          this.mainQueue.push(customer);
        }
      } else {
        // No available kiosk, add to main queue as fallback
        customer.inMainQueue = true;
        this.mainQueue.push(customer);
      }
    } else {
      // Regular checkout customer - add to main queue
      customer.inMainQueue = true;
      this.mainQueue.push(customer);
    }
    
    // FIXED: Check if kiosk queues are too long - customers might balk (leave) or be redirected
    const kioskStations = this.stations.filter(s => s.isActive && s.type === 'kiosk');
    for (const kiosk of kioskStations) {
      const maxQueueLength = kiosk.maxQueueLength || 5;
      // If kiosk queue exceeds 80% of max capacity, some customers might leave
      if (kiosk.queue.length > maxQueueLength * 0.8 && Math.random() < 0.3) {
        if (kiosk.queue.length > 0) {
          const balkingCustomer = kiosk.queue.pop();
          if (balkingCustomer) {
            this.metrics.totalCustomersAbandoned++;
            balkingCustomer.serviceEndTime = this.currentTime; // Mark as processed
          }
        }
      }
    }
    
    // Check if main queue is too long - customers might balk (leave)
    const totalCustomersWaiting = this.mainQueue.length + this.stations
      .filter(s => s.isActive)
      .reduce((sum, s) => sum + s.queue.length, 0);
    
    // Calculate balking probability based on queue length
    const mainQueueTooLong = this.mainQueue.length > 15; // Arbitrary threshold for balking
    const balkingThreshold = 0.7 + (Math.min(totalCustomersWaiting, 30) / 100); // 0.7-1.0 based on system load
    const balkingRandom = Math.random();
    
    // Some customers will leave if queues are too long
    if ((mainQueueTooLong || balkingRandom > balkingThreshold) && this.mainQueue.length > 10) {
      // Customer decides to leave (balking) - remove last customer from main queue
      if (this.mainQueue.length > 0) {
        const balkingCustomer = this.mainQueue.pop();
        if (balkingCustomer) {
          this.metrics.totalCustomersAbandoned++;
          balkingCustomer.serviceEndTime = this.currentTime; // Mark as processed
        }
      }
    }

    // Process the main queue - assign customers to available regular checkout stations
    this.processMainQueue();

    // Schedule next arrival
    this.scheduleNextArrival();
  }

  private startService(station: CheckoutStation): void {
    if (station.queue.length === 0) return;

    const customer = station.queue.shift()!;
    station.servingCustomer = customer;
    customer.serviceStartTime = this.currentTime;
    customer.waitTime = this.currentTime - customer.arrivalTime;

    // Use real clothing store service time data
    const storeData = this.params.dayType === 'weekend' 
      ? realStoreData.weekend 
      : realStoreData.weekday;
    
    // Base service time from real data (82s weekday, 49s weekend)
    let baseServiceTime = storeData.avgServiceTime;
    
    // Adjust for station type (kiosks are typically slower for clothing)
    if (station.type === 'kiosk') {
      baseServiceTime *= 1.2; // Self-checkout 20% slower for clothing items
    }

    // Apply real-world payment method effects
    let serviceTimeMultiplier = 1.0;
    
    // Payment method effects based on real data patterns
    if (customer.paymentMethod === 'cash') {
      serviceTimeMultiplier *= 1.4; // Cash transactions take longer
    } else if (customer.paymentMethod === 'voucher') {
      serviceTimeMultiplier *= 1.6; // Voucher & Card combinations take longest
    }
    // Card payments are baseline (fastest)

    // Item count effects (realistic for clothing stores)
    const itemFactor = 1 + (customer.itemCount - 1) * 0.2; // Each additional item adds 20%
    serviceTimeMultiplier *= itemFactor;

    // Add some realistic variability (±25%)
    const variability = 0.75 + Math.random() * 0.5; // 0.75 to 1.25 multiplier
    serviceTimeMultiplier *= variability;

    // Apply exponential distribution with realistic multipliers
    let serviceTime = this.exponentialRandom(1 / baseServiceTime) * serviceTimeMultiplier;
    
    // Ensure service time is within realistic bounds for clothing retail
    // Minimum service time: 10 seconds (very quick item scan)
    // Maximum service time: 6 minutes (complex transaction with issues)
    const minServiceTime = 10;
    const maxServiceTime = 360;
    serviceTime = Math.max(minServiceTime, Math.min(maxServiceTime, serviceTime));

    const serviceEndTime = this.currentTime + serviceTime;
    this.addEvent({
      id: `event_${this.eventId++}`,
      type: 'serviceEnd',
      time: serviceEndTime,
      customerId: customer.id,
      stationId: station.id
    });
  }

  private processServiceEnd(event: SimulationEvent): void {
    const station = this.stations.find(s => s.id === event.stationId);
    if (!station || !station.servingCustomer) return;

    const customer = station.servingCustomer;
    customer.serviceEndTime = this.currentTime;
    
    // Update metrics
    this.metrics.totalCustomersServed++;
    
    // Clear station
    station.servingCustomer = null;

    // Start serving next customer if any in station's queue
    if (station.queue.length > 0) {
      this.startService(station);
    } else if (station.type === 'regular') {
      // If this is a regular station and it's now empty, check main queue
      this.processMainQueue();
    }
  }

  // Break handling methods have been removed

  /**
   * Process next event in the simulation
   * @returns boolean - true if there are more events, false if simulation is complete
   */
  step(): boolean {
    if (this.eventQueue.length === 0) {
      return false;
    }

    const event = this.eventQueue.shift()!;
    this.currentTime = event.time;

    // Process event based on type
    switch (event.type) {
      case 'arrival':
        this.processArrival(event);
        break;
      case 'serviceEnd':
        this.processServiceEnd(event);
        break;
    }

    // Update metrics after each event
    this.updateMetrics();

    // Check if simulation should end
    if (this.currentTime >= this.params.simulationDuration * 60) {
      return false;
    }

    return true;
  }

  /**
   * Update simulation metrics with realistic calculations
   */
  private updateMetrics(): void {
    const deltaTime = this.currentTime - this.lastUpdateTime;
    
    // Calculate current queue length (total customers waiting)
    const currentQueueLength = this.mainQueue.length + this.stations.reduce(
      (sum, s) => sum + s.queue.length, 0
    );
    
    // Update time-weighted queue length average
    if (deltaTime > 0) {
      this.totalQueueLengthTime += currentQueueLength * deltaTime;
      this.queueLengthHistory.push({time: this.currentTime, length: currentQueueLength});
    }
    
    // Calculate realistic average wait time from completed customers
    const completedCustomers = this.customers.filter(c => 
      c.waitTime !== undefined && c.serviceEndTime !== undefined
    );
    
    // Cap the maximum wait time to avoid unrealistic outliers
    // For clothing retail, wait times over 30 minutes are extremely rare
    const maxRealisticWaitTime = 1800; // 30 minutes in seconds
    
    if (completedCustomers.length > 0) {
      let totalRealisticWaitTime = 0;
      for (const customer of completedCustomers) {
        // Cap individual wait times to realistic maximum
        totalRealisticWaitTime += Math.min(customer.waitTime || 0, maxRealisticWaitTime);
      }
      this.metrics.averageWaitTime = totalRealisticWaitTime / completedCustomers.length;
    } else {
      this.metrics.averageWaitTime = 0;
    }
    
    // Calculate time-weighted average queue length (Little's Law)
    const elapsedTime = Math.max(1, this.currentTime);
    this.metrics.averageQueueLength = elapsedTime > 0 
      ? this.totalQueueLengthTime / elapsedTime 
      : 0;
    
    // Update peak queue length
    this.metrics.peakQueueLength = Math.max(this.metrics.peakQueueLength, currentQueueLength);
    
    // Calculate realistic server utilization
    const activeStations = this.stations.filter(s => s.isActive);
    const busyStations = activeStations.filter(s => s.servingCustomer !== null);
    
    // Calculate instantaneous utilization
    let instantaneousUtilization = 0;
    if (activeStations.length > 0) {
      // Consider queue length in utilization calculation for more realism
      const totalQueueSize = this.stations.reduce((sum, s) => sum + s.queue.length, 0) + this.mainQueue.length;
      
      // Base utilization on busy stations
      const baseUtilization = busyStations.length / activeStations.length;
      
      // Factor in waiting customers, but don't let utilization exceed 99%
      // This prevents utilization from getting stuck at 100%
      if (totalQueueSize > 0) {
        // Queue pressure increases utilization but caps below 100%
        const queuePressure = Math.min(0.15, totalQueueSize * 0.01);
        instantaneousUtilization = Math.min(0.99, baseUtilization + queuePressure);
      } else {
        instantaneousUtilization = baseUtilization;
      }
    }
    
    // Update time-weighted utilization
    if (deltaTime > 0) {
      this.totalUtilizationTime += instantaneousUtilization * deltaTime;
    }
    
    // Calculate average utilization over time with smoothing
    if (elapsedTime > 0) {
      const rawUtilization = this.totalUtilizationTime / elapsedTime;
      
      // Apply smoothing to utilization to avoid jumps
      if (this.metrics.serverUtilization > 0) {
        // 80% previous value, 20% new value for smoother changes
        this.metrics.serverUtilization = 0.8 * this.metrics.serverUtilization + 0.2 * rawUtilization;
      } else {
        this.metrics.serverUtilization = rawUtilization;
      }
    } else {
      this.metrics.serverUtilization = 0;
    }
    
    this.metrics.utilization = this.metrics.serverUtilization;
    
    // Calculate realistic throughput (customers served per hour)
    const servedCustomers = this.customers.filter(c => c.serviceEndTime !== undefined);
    const hoursElapsed = Math.max(0.05, this.currentTime / 3600); // Minimum 3 minutes to avoid unrealistic spikes
    
    // Only use actual throughput calculation after enough time has passed
    if (hoursElapsed >= 0.05) {
      // Calculate throughput based on actual customers served
      this.metrics.throughput = servedCustomers.length / hoursElapsed;
    } else {
      // For very early simulation, estimate based on station capacity
      const activeStations = this.stations.filter(s => s.isActive);
      // Use default service time if params value is undefined
      const serviceTime = this.params.serviceTimeRegular || 82; // Default to 82 seconds for regular checkout
      const avgServiceTimeHours = serviceTime / 3600; // Convert seconds to hours
      const theoreticalMaxThroughput = activeStations.length / avgServiceTimeHours;
      
      // Use a conservative estimate based on current progress
      if (servedCustomers.length > 0) {
        this.metrics.throughput = Math.min(theoreticalMaxThroughput * 0.7, servedCustomers.length / Math.max(0.05, hoursElapsed));
      } else {
        this.metrics.throughput = 0;
      }
    }
    
    // Update total customers served and abandoned
    this.metrics.totalCustomersServed = servedCustomers.length;
    // totalCustomersAbandoned is updated elsewhere when customers balk
    
    // Calculate customers currently in system
    const customersBeingServed = busyStations.length;
    this.metrics.customersInSystem = currentQueueLength + customersBeingServed;
    
    // Calculate realistic customer satisfaction based on multiple factors
    const avgWaitTimeMinutes = this.metrics.averageWaitTime / 60;
    
    // Base satisfaction on wait time (primary factor)
    let waitTimeSatisfaction = 0;
    if (avgWaitTimeMinutes <= 1) {
      waitTimeSatisfaction = 100; // Excellent service
    } else if (avgWaitTimeMinutes <= 2) {
      waitTimeSatisfaction = 90 - (avgWaitTimeMinutes - 1) * 10; // 90-80%
    } else if (avgWaitTimeMinutes <= 3) {
      waitTimeSatisfaction = 80 - (avgWaitTimeMinutes - 2) * 20; // 80-60%
    } else if (avgWaitTimeMinutes <= 5) {
      waitTimeSatisfaction = 60 - (avgWaitTimeMinutes - 3) * 15; // 60-30%
    } else {
      waitTimeSatisfaction = Math.max(0, 30 - (avgWaitTimeMinutes - 5) * 5); // <30%
    }
    
    // Factor in queue length (secondary factor)
    // Long queues decrease satisfaction even if service is fast
    const queueLengthPenalty = Math.min(15, this.metrics.averageQueueLength * 2);
    
    // Factor in abandonment rate (tertiary factor)
    const totalCustomers = this.metrics.totalCustomersServed + this.metrics.totalCustomersAbandoned;
    const abandonmentRate = totalCustomers > 0 ? 
      (this.metrics.totalCustomersAbandoned / totalCustomers) : 0;
    const abandonmentPenalty = abandonmentRate * 20; // Up to 20% penalty for high abandonment
    
    // Calculate final satisfaction
    this.metrics.customerSatisfaction = Math.max(0, Math.min(100, 
      waitTimeSatisfaction - queueLengthPenalty - abandonmentPenalty));
      
    // Apply smoothing to avoid satisfaction jumping around too much
    if (this.previousCustomerSatisfaction !== undefined) {
      this.metrics.customerSatisfaction = 
        0.7 * this.previousCustomerSatisfaction + 0.3 * this.metrics.customerSatisfaction;
    }
    
    // Store for next calculation
    this.previousCustomerSatisfaction = this.metrics.customerSatisfaction;
    
    // Calculate realistic overall score using weighted components
    const waitTimeScore = this.calculateWaitTimeScore(avgWaitTimeMinutes);
    const utilizationScore = this.calculateUtilizationScore(this.metrics.serverUtilization);
    const throughputScore = this.calculateThroughputScore(this.metrics.throughput);
    
    this.metrics.score = (waitTimeScore * 0.4) + (utilizationScore * 0.3) + (throughputScore * 0.3);
    
    // Update last update time
    this.lastUpdateTime = this.currentTime;
  }
  
  /**
   * Calculate wait time score (0-100) with realistic targets for retail
   */
  private calculateWaitTimeScore(waitTimeMinutes: number): number {
    if (waitTimeMinutes <= 1) return 100;
    if (waitTimeMinutes <= 2) return 90;
    if (waitTimeMinutes <= 3) return 75;
    if (waitTimeMinutes <= 5) return 50;
    if (waitTimeMinutes <= 7) return 25;
    return 0;
  }
  
  /**
   * Calculate utilization score (0-100) with optimal range for service
   */
  private calculateUtilizationScore(utilization: number): number {
    // Optimal utilization for service operations is 70-85%
    if (utilization >= 0.7 && utilization <= 0.85) {
      return 100;
    } else if (utilization >= 0.6 && utilization < 0.7) {
      return 70 + (utilization - 0.6) * 300; // Scale from 70-100
    } else if (utilization > 0.85 && utilization <= 0.95) {
      return 100 - (utilization - 0.85) * 500; // Scale from 100-50
    } else if (utilization < 0.6) {
      return utilization * 100 / 0.6; // Scale from 0-70
    } else {
      return Math.max(0, 50 - (utilization - 0.95) * 1000); // Rapidly decline after 95%
    }
  }
  
  /**
   * Calculate throughput score based on customer arrival rate
   */
  private calculateThroughputScore(throughput: number): number {
    // Target throughput should match or exceed arrival rate
    const targetThroughput = this.params.arrivalRate * 60; // Convert to customers per hour
    const efficiency = throughput / Math.max(1, targetThroughput);
    
    if (efficiency >= 0.95) return 100;
    if (efficiency >= 0.8) return 80 + (efficiency - 0.8) * 133; // 80-100
    if (efficiency >= 0.6) return 60 + (efficiency - 0.6) * 100; // 60-80
    return efficiency * 100; // 0-60
  }

  /**
   * Get current simulation time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): Metrics {
    return { ...this.metrics };
  }

  /**
   * Get all customers
   */
  getCustomers(): Customer[] {
    return [...this.customers];
  }

  /**
   * Get all stations
   */
  getStations(): CheckoutStation[] {
    return [...this.stations];
  }

  /**
   * Get main queue
   */
  getMainQueue(): Customer[] {
    return [...this.mainQueue];
  }
}
