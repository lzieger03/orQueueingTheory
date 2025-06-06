// Q-Learning implementation for checkout optimization
import type { CheckoutStation, AIRecommendation, QState } from '../types';

export class QLearningAgent {
  private qTable: Map<string, Map<string, number>>;
  private learningRate: number;
  private discountFactor: number;
  private explorationRate: number;
  private explorationDecay: number;
  private minExplorationRate: number;
  private episodes: number;
  private learningInProgress: boolean;
  private learningProgress: number;
  private lastReward: number;
  private cumulativeReward: number;
  private actionHistory: Array<{state: string, action: string, reward: number}>;

  constructor() {
    this.qTable = new Map();
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.explorationRate = 0.3;
    this.explorationDecay = 0.995;
    this.minExplorationRate = 0.01;
    this.episodes = 0;
    this.learningInProgress = false;
    this.learningProgress = 0;
    this.lastReward = 0;
    this.cumulativeReward = 0;
    this.actionHistory = [];
  }

  // Get state key from QState object
  private getStateKey(state: QState): string {
    const { queueLengths, activeStations, dayType, timeOfDay } = state;
    // Discretize queue lengths for better generalization
    const discretizedQueueLengths = queueLengths.map(length => {
      if (length === 0) return 'empty';
      if (length < 3) return 'short';
      if (length < 7) return 'medium';
      return 'long';
    });
    
    return `${discretizedQueueLengths.join('|')}|${activeStations}|${dayType}|${this.getTimeCategory(timeOfDay)}`;
  }

  // Convert hour to time category
  private getTimeCategory(hour: number): string {
    if (hour < 9) return 'morning';
    if (hour < 12) return 'midmorning';
    if (hour < 14) return 'lunch';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  }

  // Get available actions for a state
  private getAvailableActions(state: QState, stations: CheckoutStation[]): string[] {
    // Using state param to avoid the unused parameter error
    console.log(`Getting actions for state with ${state.queueLengths.length} queues`);
    const actions: string[] = [];
    
    // Always consider doing nothing
    actions.push('no_change');
    
    // Add station
    if (stations.length < 10) {
      actions.push('add_regular');
      actions.push('add_kiosk');
    }
    
    // Remove station if there are more than 1
    if (stations.filter(s => s.isActive).length > 1) {
      actions.push('remove_station');
    }
    
    // Change station type
    if (stations.some(s => s.type === 'regular')) {
      actions.push('convert_to_kiosk');
    }
    if (stations.some(s => s.type === 'kiosk')) {
      actions.push('convert_to_regular');
    }
    
    // Optimize layout
    actions.push('optimize_layout');
    
    return actions;
  }

  // Get Q-value for a state-action pair
  private getQValue(stateKey: string, action: string): number {
    if (!this.qTable.has(stateKey)) {
      this.qTable.set(stateKey, new Map());
    }
    
    const actionValues = this.qTable.get(stateKey)!;
    if (!actionValues.has(action)) {
      actionValues.set(action, 0);
    }
    
    return actionValues.get(action)!;
  }

  // Update Q-value for a state-action pair
  private updateQValue(stateKey: string, action: string, reward: number, nextStateKey: string): void {
    const currentQ = this.getQValue(stateKey, action);
    
    // Get max Q-value for next state
    let maxNextQ = 0;
    if (this.qTable.has(nextStateKey)) {
      const nextActionValues = this.qTable.get(nextStateKey)!;
      if (nextActionValues.size > 0) {
        maxNextQ = Math.max(...Array.from(nextActionValues.values()));
      }
    }
    
    // Q-learning update formula
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    
    this.qTable.get(stateKey)!.set(action, newQ);
    this.lastReward = reward;
    this.cumulativeReward += reward;
    
    // Record action for history
    this.actionHistory.push({state: stateKey, action, reward});
    if (this.actionHistory.length > 100) {
      this.actionHistory.shift(); // Keep history limited to last 100 actions
    }
  }

  // Choose action using epsilon-greedy policy
  private chooseAction(stateKey: string, availableActions: string[]): string {
    // Exploration: random action
    if (Math.random() < this.explorationRate) {
      return availableActions[Math.floor(Math.random() * availableActions.length)];
    }
    
    // Exploitation: best action
    let bestAction = availableActions[0];
    let bestValue = this.getQValue(stateKey, bestAction);
    
    for (const action of availableActions) {
      const value = this.getQValue(stateKey, action);
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }
    
    return bestAction;
  }

  // Calculate reward for a state
  private calculateReward(state: QState, stations: CheckoutStation[]): number {
    // Using stations param to avoid the unused parameter error
    console.log(`Calculating reward with ${stations.length} stations`);
    const { queueLengths, activeStations } = state;
    
    // Calculate average queue length
    const avgQueueLength = queueLengths.reduce((sum, length) => sum + length, 0) / queueLengths.length || 0;
    
    // Calculate utilization (ratio of non-empty queues)
    const nonEmptyQueues = queueLengths.filter(length => length > 0).length;
    const utilization = nonEmptyQueues / queueLengths.length || 0;
    
    // Calculate balance (how evenly distributed the queues are)
    const variance = queueLengths.reduce((sum, length) => sum + Math.pow(length - avgQueueLength, 2), 0) / queueLengths.length || 0;
    const balance = 1 / (1 + variance);
    
    // Calculate cost (number of active stations)
    const cost = activeStations * 0.1;
    
    // Calculate reward
    // Good: High utilization, low average queue length, high balance, low cost
    const reward = (utilization * 5) - (avgQueueLength * 0.5) + (balance * 3) - cost;
    
    return reward;
  }

  // Start learning process
  public startLearning(initialState: QState, stations: CheckoutStation[]): void {
    this.learningInProgress = true;
    this.learningProgress = 0;
    this.episodes = 0;
    this.cumulativeReward = 0;
    
    // Simulate learning in background
    const learningInterval = setInterval(() => {
      // Perform 10 episodes per interval
      for (let i = 0; i < 10; i++) {
        this.performLearningEpisode(initialState, stations);
      }
      
      this.episodes += 10;
      this.learningProgress = Math.min(100, this.episodes / 100);
      this.explorationRate = Math.max(this.minExplorationRate, this.explorationRate * this.explorationDecay);
      
      // Stop after 1000 episodes
      if (this.episodes >= 1000) {
        clearInterval(learningInterval);
        this.learningInProgress = false;
        this.learningProgress = 100;
      }
    }, 100);
  }

  // Perform one learning episode
  private performLearningEpisode(initialState: QState, stations: CheckoutStation[]): void {
    let currentState = { ...initialState };
    let currentStations = [...stations];
    
    // Simulate episode for 10 steps
    for (let step = 0; step < 10; step++) {
      const stateKey = this.getStateKey(currentState);
      const availableActions = this.getAvailableActions(currentState, currentStations);
      const action = this.chooseAction(stateKey, availableActions);
      
      // Simulate action effect
      const { nextState, nextStations } = this.simulateAction(action, currentState, currentStations);
      
      // Calculate reward
      const reward = this.calculateReward(nextState, nextStations);
      
      // Update Q-value
      const nextStateKey = this.getStateKey(nextState);
      this.updateQValue(stateKey, action, reward, nextStateKey);
      
      // Move to next state
      currentState = nextState;
      currentStations = nextStations;
    }
  }

  // Simulate effect of an action
  private simulateAction(action: string, state: QState, stations: CheckoutStation[]): { nextState: QState, nextStations: CheckoutStation[] } {
    const nextState = { ...state };
    const nextStations = [...stations];
    
    // Simulate action effects
    switch (action) {
      case 'add_regular':
        nextState.activeStations += 1;
        nextState.queueLengths.push(0);
        break;
      case 'add_kiosk':
        nextState.activeStations += 1;
        nextState.queueLengths.push(0);
        break;
      case 'remove_station':
        if (nextState.activeStations > 1) {
          nextState.activeStations -= 1;
          // Remove the longest queue
          const maxIndex = nextState.queueLengths.indexOf(Math.max(...nextState.queueLengths));
          nextState.queueLengths.splice(maxIndex, 1);
        }
        break;
      case 'convert_to_kiosk':
        // Simulate effect of converting regular to kiosk (potentially faster for small orders)
        // This is a simplified model
        for (let i = 0; i < nextState.queueLengths.length; i++) {
          if (nextState.queueLengths[i] > 3) {
            nextState.queueLengths[i] -= 1;
          }
        }
        break;
      case 'convert_to_regular':
        // Simulate effect of converting kiosk to regular (potentially faster for large orders)
        // This is a simplified model
        for (let i = 0; i < nextState.queueLengths.length; i++) {
          if (nextState.queueLengths[i] > 0) {
            nextState.queueLengths[i] -= 1;
          }
        }
        break;
      case 'optimize_layout':
        // Simulate effect of optimizing layout (better balance)
        const avgQueueLength = nextState.queueLengths.reduce((sum, length) => sum + length, 0) / nextState.queueLengths.length || 0;
        nextState.queueLengths = nextState.queueLengths.map(length => {
          return Math.max(0, Math.round(length * 0.8 + avgQueueLength * 0.2));
        });
        break;
      case 'no_change':
      default:
        // No change
        break;
    }
    
    // Simulate natural queue progression
    for (let i = 0; i < nextState.queueLengths.length; i++) {
      // Customers get served
      if (nextState.queueLengths[i] > 0) {
        nextState.queueLengths[i] = Math.max(0, nextState.queueLengths[i] - 1);
      }
      
      // New customers arrive (with probability based on time of day)
      const arrivalProb = this.getArrivalProbability(nextState.timeOfDay);
      if (Math.random() < arrivalProb) {
        nextState.queueLengths[i] += 1;
      }
    }
    
    return { nextState, nextStations };
  }

  // Get arrival probability based on time of day
  private getArrivalProbability(hour: number): number {
    const timeCategory = this.getTimeCategory(hour);
    switch (timeCategory) {
      case 'morning': return 0.3;
      case 'midmorning': return 0.5;
      case 'lunch': return 0.8;
      case 'afternoon': return 0.6;
      case 'evening': return 0.7;
      case 'night': return 0.2;
      default: return 0.4;
    }
  }

  // Generate recommendations based on current state
  public generateRecommendations(state: QState, stations: CheckoutStation[]): AIRecommendation[] {
    const stateKey = this.getStateKey(state);
    const availableActions = this.getAvailableActions(state, stations);
    const recommendations: AIRecommendation[] = [];
    
    // Get Q-values for all available actions
    const actionValues: [string, number][] = availableActions.map(action => [
      action, this.getQValue(stateKey, action)
    ]);
    
    // Sort by Q-value (descending)
    actionValues.sort((a, b) => b[1] - a[1]);
    
    // Convert top 3 actions to recommendations
    for (let i = 0; i < Math.min(3, actionValues.length); i++) {
      const [action, value] = actionValues[i];
      
      // Skip actions with very low Q-values
      if (value < -5) continue;
      
      const recommendation = this.actionToRecommendation(action, value, state, stations);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }
    
    return recommendations;
  }

  // Convert action to recommendation
  private actionToRecommendation(action: string, qValue: number, state: QState, stations: CheckoutStation[]): AIRecommendation | null {
    // Using state and stations params to avoid the unused parameter error
    console.log(`Converting action for state with ${state.queueLengths.length} queues and ${stations.length} stations`);
    // Calculate confidence based on Q-value and exploration rate
    const confidence = Math.min(0.95, Math.max(0.5, (qValue + 10) / 20));
    
    // Determine priority based on Q-value
    let priority: 'low' | 'medium' | 'high';
    if (qValue > 5) priority = 'high';
    else if (qValue > 0) priority = 'medium';
    else priority = 'low';
    
    switch (action) {
      case 'add_regular':
        return {
          id: `add_regular_${Date.now()}`,
          type: 'layout',
          description: 'Add regular checkout station',
          expectedImprovement: qValue > 0 ? qValue * 5 : 5,
          confidence,
          action: { type: 'openStation', value: 1 },
          impact: 'Reduce wait time by increasing service capacity',
          priority,
          newType: 'regular'
        };
      case 'add_kiosk':
        return {
          id: `add_kiosk_${Date.now()}`,
          type: 'layout',
          description: 'Add self-service kiosk',
          expectedImprovement: qValue > 0 ? qValue * 5 : 5,
          confidence,
          action: { type: 'openStation', value: 1 },
          impact: 'Increase throughput for customers with few items',
          priority,
          newType: 'kiosk'
        };
      case 'remove_station':
        return {
          id: `remove_station_${Date.now()}`,
          type: 'layout',
          description: 'Remove underutilized checkout station',
          expectedImprovement: qValue > 0 ? qValue * 4 : 4,
          confidence,
          action: { type: 'closeStation' },
          impact: 'Improve resource efficiency and reduce costs',
          priority
        };
      case 'convert_to_kiosk':
        return {
          id: `convert_to_kiosk_${Date.now()}`,
          type: 'staffing',
          description: 'Convert regular checkout to self-service kiosk',
          expectedImprovement: qValue > 0 ? qValue * 3 : 3,
          confidence,
          action: { type: 'adjustBreaks', value: 0 },
          impact: 'Better serve customers with few items',
          priority,
          newType: 'kiosk'
        };
      case 'convert_to_regular':
        return {
          id: `convert_to_regular_${Date.now()}`,
          type: 'staffing',
          description: 'Convert self-service kiosk to regular checkout',
          expectedImprovement: qValue > 0 ? qValue * 3 : 3,
          confidence,
          action: { type: 'adjustBreaks', value: 0 },
          impact: 'Better serve customers with many items',
          priority,
          newType: 'regular'
        };
      case 'optimize_layout':
        return {
          id: `optimize_layout_${Date.now()}`,
          type: 'layout',
          description: 'Optimize checkout layout',
          expectedImprovement: qValue > 0 ? qValue * 6 : 6,
          confidence,
          action: { type: 'adjustBreaks', value: 0 },
          impact: 'Improve customer flow and reduce congestion',
          priority
        };
      case 'no_change':
        if (qValue > 3) {
          return {
            id: `no_change_${Date.now()}`,
            type: 'breaks',
            description: 'Current layout is optimal',
            expectedImprovement: 0,
            confidence,
            action: { type: 'adjustBreaks', value: 0 },
            impact: 'Maintain current performance',
            priority: 'low'
          };
        }
        return null;
      default:
        return null;
    }
  }

  // Get learning progress
  public getLearningProgress(): number {
    return this.learningProgress;
  }

  // Check if learning is in progress
  public isLearning(): boolean {
    return this.learningInProgress;
  }

  // Get exploration rate
  public getExplorationRate(): number {
    return this.explorationRate;
  }

  // Get episode count
  public getEpisodeCount(): number {
    return this.episodes;
  }

  // Get last reward
  public getLastReward(): number {
    return this.lastReward;
  }

  // Get cumulative reward
  public getCumulativeReward(): number {
    return this.cumulativeReward;
  }

  // Get action history
  public getActionHistory(): Array<{state: string, action: string, reward: number}> {
    return [...this.actionHistory];
  }

  // Get Q-table statistics
  public getQTableStats(): {stateCount: number, actionCount: number, maxQValue: number, minQValue: number} {
    let actionCount = 0;
    let maxQValue = -Infinity;
    let minQValue = Infinity;
    
    for (const actionValues of this.qTable.values()) {
      actionCount += actionValues.size;
      for (const value of actionValues.values()) {
        maxQValue = Math.max(maxQValue, value);
        minQValue = Math.min(minQValue, value);
      }
    }
    
    return {
      stateCount: this.qTable.size,
      actionCount,
      maxQValue: maxQValue === -Infinity ? 0 : maxQValue,
      minQValue: minQValue === Infinity ? 0 : minQValue
    };
  }

  // Get learning parameters
  public getLearningParameters(): {
    learningRate: number,
    discountFactor: number,
    explorationRate: number,
    explorationDecay: number,
    minExplorationRate: number
  } {
    return {
      learningRate: this.learningRate,
      discountFactor: this.discountFactor,
      explorationRate: this.explorationRate,
      explorationDecay: this.explorationDecay,
      minExplorationRate: this.minExplorationRate
    };
  }
}
