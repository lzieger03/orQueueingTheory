// Utility functions for the checkout layout game
import type { CheckoutStation, Customer, Metrics, Position, Size } from '../types';

export class GameUtils {
  /**
   * Format time from seconds to human-readable string
   */
  static formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Format numbers with appropriate precision
   */
  static formatNumber(value: number, decimals: number = 1): string {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(decimals);
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  /**
   * Calculate distance between two positions
   */
  static calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if two rectangles overlap
   */
  static checkOverlap(
    pos1: Position, size1: Size,
    pos2: Position, size2: Size
  ): boolean {
    return !(
      pos1.x + size1.width < pos2.x ||
      pos2.x + size2.width < pos1.x ||
      pos1.y + size1.height < pos2.y ||
      pos2.y + size2.height < pos1.y
    );
  }

  /**
   * Snap position to grid
   */
  static snapToGrid(position: Position, gridSize: number = 20): Position {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    };
  }

  /**
   * Generate unique ID
   */
  static generateId(prefix: string = 'item'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate performance score based on metrics
   */
  static calculatePerformanceScore(metrics: Metrics): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    breakdown: {
      waitTime: number;
      utilization: number;
      satisfaction: number;
    };
  } {
    // Scoring weights
    const weights = {
      waitTime: 0.4,
      utilization: 0.3,
      satisfaction: 0.3
    };

    // Calculate component scores (0-100)
    const waitTimeScore = Math.max(0, 100 - (metrics.averageWaitTime / 300) * 100);
    const utilizationScore = Math.min(100, metrics.serverUtilization * 100);
    const satisfactionScore = metrics.customerSatisfaction * 100;

    // Weighted overall score
    const overallScore = 
      waitTimeScore * weights.waitTime +
      utilizationScore * weights.utilization +
      satisfactionScore * weights.satisfaction;

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    else grade = 'F';

    return {
      score: Math.round(overallScore),
      grade,
      breakdown: {
        waitTime: Math.round(waitTimeScore),
        utilization: Math.round(utilizationScore),
        satisfaction: Math.round(satisfactionScore)
      }
    };
  }

  /**
   * Get color for metric value based on thresholds
   */
  static getMetricColor(value: number, thresholds: {
    excellent: number;
    good: number;
    fair: number;
  }, higherIsBetter: boolean = true): string {
    if (higherIsBetter) {
      if (value >= thresholds.excellent) return '#22c55e'; // green
      if (value >= thresholds.good) return '#f59e0b'; // yellow
      if (value >= thresholds.fair) return '#ef4444'; // red
      return '#dc2626'; // dark red
    } else {
      if (value <= thresholds.excellent) return '#22c55e'; // green
      if (value <= thresholds.good) return '#f59e0b'; // yellow
      if (value <= thresholds.fair) return '#ef4444'; // red
      return '#dc2626'; // dark red
    }
  }

  /**
   * Validate station placement
   */
  static validateStationPlacement(
    station: CheckoutStation,
    existingStations: CheckoutStation[],
    storeSize: Size
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Ensure existingStations is an array
    const stationsArray = Array.isArray(existingStations) ? existingStations : [];

    // Check bounds
    if (station.position.x < 0 || station.position.y < 0) {
      errors.push('Station must be placed within store boundaries');
    }
    if (station.position.x + station.size.width > storeSize.width ||
        station.position.y + station.size.height > storeSize.height) {
      errors.push('Station extends beyond store boundaries');
    }

    // Check overlaps
    for (const existing of stationsArray) {
      if (existing.id !== station.id) {
        if (this.checkOverlap(
          station.position, station.size,
          existing.position, existing.size
        )) {
          errors.push(`Station overlaps with ${existing.type} station`);
          break;
        }
      }
    }

    // Check minimum spacing
    const minSpacing = 20;
    for (const existing of stationsArray) {
      if (existing.id !== station.id) {
        const distance = this.calculateDistance(
          {
            x: station.position.x + station.size.width / 2,
            y: station.position.y + station.size.height / 2
          },
          {
            x: existing.position.x + existing.size.width / 2,
            y: existing.position.y + existing.size.height / 2
          }
        );
        
        if (distance < minSpacing) {
          errors.push('Station too close to existing station');
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate queue positions for a station
   * @param station The checkout station
   * @param maxVisible Maximum number of customers to show in the queue visualization
   */
  static calculateQueuePositions(
    station: CheckoutStation,
    maxVisible: number = 8
  ): Position[] {
    const positions: Position[] = [];
    
    // No queue, no positions
    if (!station.queue || station.queue.length === 0) return positions;
    
    // Calculate queue direction (left/right/up/down based on station position)
    let queueDirection = 'down'; // Default direction
    
    // Calculate queue starting point
    let startX = station.position.x + station.size.width / 2 - 8; // Center horizontally
    let startY = station.position.y + station.size.height + 10;
    const spacing = 15;
    
    // Add positions for each customer, limited by maxVisible
    for (let i = 0; i < Math.min(station.queue.length, maxVisible); i++) {
      switch (queueDirection) {
        case 'down':
          positions.push({
            x: startX,
            y: startY + (i * spacing)
          });
          break;
        // Other directions could be added in the future
      }
    }
    
    return positions;
  }

  /**
   * Calculate positions for main queue in a serpentine pattern
   */
  static calculateMainQueuePositions(queue: any[], centerX: number = 300, centerY: number = 200): {
    positions: Position[];
    width: number;
    height: number;
    path: string;
  } {
    const customerSpacing = 10; // Space between customers
    const rowWidth = 200; // Width of each row
    const rowHeight = 30; // Height of each row
    const customersPerRow = Math.floor(rowWidth / customerSpacing);
    const positions: Position[] = [];
    
    // Calculate the number of rows needed
    const numRows = Math.ceil(queue.length / customersPerRow);
    const totalWidth = rowWidth;
    const totalHeight = numRows * rowHeight;
    
    // Calculate starting position to center the queue
    const startX = centerX - rowWidth / 2;
    const startY = centerY - totalHeight / 2;
    
    // Generate SVG path for the serpentine queue
    let path = `M ${startX} ${startY + rowHeight/2}`;
    
    for (let i = 0; i < numRows; i++) {
      if (i % 2 === 0) {
        // Left to right
        path += ` H ${startX + rowWidth}`;
        if (i < numRows - 1) {
          path += ` C ${startX + rowWidth + 20} ${startY + rowHeight/2 + i * rowHeight}, ${startX + rowWidth + 20} ${startY + rowHeight/2 + (i+1) * rowHeight}, ${startX + rowWidth} ${startY + rowHeight/2 + (i+1) * rowHeight}`;
        }
      } else {
        // Right to left
        path += ` H ${startX}`;
        if (i < numRows - 1) {
          path += ` C ${startX - 20} ${startY + rowHeight/2 + i * rowHeight}, ${startX - 20} ${startY + rowHeight/2 + (i+1) * rowHeight}, ${startX} ${startY + rowHeight/2 + (i+1) * rowHeight}`;
        }
      }
    }
    
    // Calculate positions for each customer along the path
    for (let i = 0; i < queue.length; i++) {
      const row = Math.floor(i / customersPerRow);
      const posInRow = i % customersPerRow;
      
      if (row % 2 === 0) {
        // Left to right
        positions.push({
          x: startX + posInRow * customerSpacing,
          y: startY + row * rowHeight + rowHeight/2
        });
      } else {
        // Right to left
        positions.push({
          x: startX + rowWidth - (posInRow * customerSpacing),
          y: startY + row * rowHeight + rowHeight/2
        });
      }
    }
    
    return { 
      positions, 
      width: totalWidth, 
      height: totalHeight, 
      path 
    };
  }

  /**
   * Generate random customer characteristics
   */
  static generateRandomCustomer(id: string): Omit<Customer, 'arrivalTime'> {
    const itemCount = Math.floor(Math.random() * 30) + 1;
    const paymentMethods: ('cash' | 'card' | 'voucher')[] = ['cash', 'card', 'voucher'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // Determine if customer prefers self-checkout based on:
    // 1. Fewer items (more likely to use self-checkout)
    // 2. Card payments (more likely than cash/voucher)
    let selfCheckoutProbability = 0.3; // Base 30% probability
    
    // Adjust based on item count (fewer items = higher probability)
    if (itemCount <= 5) selfCheckoutProbability += 0.3;
    else if (itemCount <= 10) selfCheckoutProbability += 0.1;
    else if (itemCount >= 20) selfCheckoutProbability -= 0.2;
    
    // Adjust based on payment method
    if (paymentMethod === 'card') selfCheckoutProbability += 0.1;
    if (paymentMethod === 'cash') selfCheckoutProbability -= 0.15;
    if (paymentMethod === 'voucher') selfCheckoutProbability -= 0.2;
    
    // Ensure probability is within bounds
    selfCheckoutProbability = Math.max(0.05, Math.min(0.95, selfCheckoutProbability));
    
    // Determine preference
    const prefersSelfCheckout = Math.random() < selfCheckoutProbability;
    
    return {
      id,
      itemCount,
      paymentMethod,
      prefersSelfCheckout,
      inMainQueue: !prefersSelfCheckout // Start in main queue if not preferring self-checkout
    };
  }

  /**
   * Export layout configuration
   */
  static exportLayout(stations: CheckoutStation[]): string {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      stations: stations.map(station => ({
        id: station.id,
        type: station.type,
        position: station.position,
        size: station.size,
        isActive: station.isActive,
        serviceTime: station.serviceTime
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import layout configuration
   */
  static importLayout(jsonString: string): CheckoutStation[] {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.stations || !Array.isArray(data.stations)) {
        throw new Error('Invalid layout format');
      }

      return data.stations.map((stationData: any) => ({
        ...stationData,
        servingCustomer: null,
        queue: []
      }));
    } catch (error) {
      throw new Error('Failed to parse layout data');
    }
  }

  /**
   * Calculate layout efficiency score
   */
  static calculateLayoutEfficiency(stations: CheckoutStation[], storeSize: Size): number {
    const totalStationArea = stations.reduce((sum, station) => {
      return sum + (station.size.width * station.size.height);
    }, 0);

    const storeArea = storeSize.width * storeSize.height;
    const utilizationRatio = totalStationArea / storeArea;

    // Optimal utilization is around 30-40%
    const optimalRatio = 0.35;
    const efficiency = 1 - Math.abs(utilizationRatio - optimalRatio) / optimalRatio;

    return Math.max(0, Math.min(1, efficiency));
  }
}

export default GameUtils;
