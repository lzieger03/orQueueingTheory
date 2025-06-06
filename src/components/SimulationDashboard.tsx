// filepath: /Users/lars/Downloads/improved_checkoutGame/checkoutGame/checkoutGame/src/components/SimulationDashboard.tsx
// Improved SimulationDashboard component with realistic Operations Research metrics
import React from 'react';
import { Activity, Clock, Users, TrendingUp, DollarSign, BarChart2 } from 'lucide-react';
import type { CheckoutStation } from '../types';
import { OperationsResearchMath } from '../utils/operationsResearchMath';

interface CurrentMetrics {
  averageWaitTime: number;
  throughput: number;
  utilization: number;
  customersInSystem: number;
  score?: number;
  totalCustomersServed?: number;
  customerSatisfaction?: number;
  [key: string]: any; // Allow additional properties
}

interface SimulationDashboardProps {
  stations: CheckoutStation[];
  currentMetrics: CurrentMetrics;
}

export const SimulationDashboard: React.FC<SimulationDashboardProps> = ({
  stations,
  currentMetrics,
}) => {
  // Add error handling wrapper to prevent crashes
  try {
    // Station utilization data
    const stationsArray = Array.isArray(stations) ? stations : [];

  // Calculate Operations Research metrics using centralized methods
  const regularStations = stationsArray.filter(s => s.type === 'regular' && s.isActive).length;
  const kioskStations = stationsArray.filter(s => s.type === 'kiosk' && s.isActive).length;
  const totalStations = regularStations + kioskStations;
  
  // M/M/c queue model calculations
  const lambda = currentMetrics.throughput || 0; // arrival rate
  const mu = totalStations > 0 ? (lambda / (currentMetrics.utilization || 0.01)) / totalStations : 0; // service rate per server
  const rho = totalStations > 0 ? lambda / (totalStations * mu) : 0; // traffic intensity
  
  // Use centralized wait time calculation - convert engine seconds to minutes for display
  const avgWaitTimeMinutes = OperationsResearchMath.convertSecondsToMinutes(
    currentMetrics.averageWaitTime || 0
  );
  
  // Little's Law calculations
  const L = currentMetrics.customersInSystem || 0; // average number of customers in system
  const Lq = L - ((currentMetrics.utilization || 0) * totalStations); // average queue length
  
  // Probability of zero customers in system (p0) for M/M/c model
  let p0 = 0;
  if (totalStations > 0 && rho < 1) {
    let sum = 0;
    for (let n = 0; n < totalStations; n++) {
      sum += Math.pow(lambda / mu, n) / factorial(n);
    }
    const lastTerm = Math.pow(lambda / mu, totalStations) / (factorial(totalStations) * (1 - rho));
    p0 = 1 / (sum + lastTerm);
  }
  
  // Probability of waiting (probability that all servers are busy)
  const pWait = totalStations > 0 && rho < 1 ? 
    (Math.pow(lambda / mu, totalStations) * p0) / (factorial(totalStations) * (1 - rho)) : 
    1;
  
  // Helper function for factorial calculation
  function factorial(n: number): number {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  return (
    <div className="bg-gray-700 rounded-lg shadow-sm border border-gray-600 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">Operations Research Dashboard</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Activity className="w-4 h-4 animate-pulse text-green-400" />
          <span>M/M/c Queueing Model</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-lg hover:bg-blue-600/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200">Avg Wait Time (Wq)</p>
              <p className="text-2xl font-bold text-blue-100">
                {avgWaitTimeMinutes.toFixed(1)}m
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-xs text-blue-300 mt-1">Little's Law: Wq = Lq/λ</p>
        </div>

        <div className="bg-green-600/20 border border-green-500/30 p-4 rounded-lg hover:bg-green-600/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-200">Throughput (λ)</p>
              <p className="text-2xl font-bold text-green-100">
                {lambda.toFixed(0)}/hr
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-xs text-green-300 mt-1">Arrival rate per hour</p>
        </div>

        <div className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-lg hover:bg-purple-600/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-200">Utilization (ρ)</p>
              <p className="text-2xl font-bold text-purple-100">
                {(rho * 100).toFixed(0)}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-xs text-purple-300 mt-1">ρ = λ/(c·μ)</p>
        </div>

        <div className="bg-orange-600/20 border border-orange-500/30 p-4 rounded-lg hover:bg-orange-600/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-200">Customers In System (L)</p>
              <p className="text-2xl font-bold text-orange-100">
                {L.toFixed(1)}
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-400" />
          </div>
          <p className="text-xs text-orange-300 mt-1">Little's Law: L = λW</p>
        </div>
      </div>

      {/* Advanced OR Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-lg hover:bg-indigo-600/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-200">Queue Length (Lq)</p>
              <p className="text-2xl font-bold text-indigo-100">
                {Lq.toFixed(1)}
              </p>
            </div>
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-xs text-indigo-300 mt-1">Average number in queue</p>
        </div>

        <div className="bg-pink-600/20 border border-pink-500/30 p-4 rounded-lg hover:bg-pink-600/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-200">Service Rate (μ)</p>
              <p className="text-2xl font-bold text-pink-100">
                {mu.toFixed(1)}/hr
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-xs text-pink-300 mt-1">Per server service rate</p>
        </div>

        <div className="bg-yellow-600/20 border border-yellow-500/30 p-4 rounded-lg hover:bg-yellow-600/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-200">Wait Probability</p>
              <p className="text-2xl font-bold text-yellow-100">
                {(pWait * 100).toFixed(0)}%
              </p>
            </div>
            <BarChart2 className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-xs text-yellow-300 mt-1">Prob. of waiting in queue</p>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg hover:bg-gray-650 transition-all duration-300">
        <h4 className="text-md font-medium text-gray-200 mb-6">Performance Indicators</h4>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-600/50 rounded-lg">
            <div className="text-3xl font-bold mb-2">
              {rho < 0.7 ? '🟢' : rho < 0.9 ? '🟡' : '🔴'}
            </div>
            <p className="text-sm text-gray-300 font-medium">System Load</p>
            <p className="text-xs text-gray-400 mt-1">
              {rho < 0.7 ? 'Optimal' : rho < 0.9 ? 'Moderate' : 'High'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-600/50 rounded-lg">
            <div className="text-3xl font-bold mb-2">
              {avgWaitTimeMinutes < 3 ? '🟢' : avgWaitTimeMinutes < 7 ? '🟡' : '🔴'}
            </div>
            <p className="text-sm text-gray-300 font-medium">Wait Time</p>
            <p className="text-xs text-gray-400 mt-1">
              {avgWaitTimeMinutes < 3 ? 'Excellent' : avgWaitTimeMinutes < 7 ? 'Good' : 'Poor'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-600/50 rounded-lg">
            <div className="text-3xl font-bold mb-2">
              {lambda > 100 ? '🟢' : lambda > 60 ? '🟡' : '🔴'}
            </div>
            <p className="text-sm text-gray-300 font-medium">Efficiency</p>
            <p className="text-xs text-gray-400 mt-1">
              {lambda > 100 ? 'High' : lambda > 60 ? 'Medium' : 'Low'}
            </p>
          </div>
        </div>
      </div>

      {/* OR Theory Explanation */}
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
        <h4 className="text-md font-medium text-gray-200 mb-3">Operations Research Theory</h4>
        <p className="text-sm text-gray-300 mb-3">
          This dashboard uses an M/M/c queueing model from Operations Research theory to analyze checkout performance.
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
          <div>
            <p><strong>λ (lambda)</strong>: Customer arrival rate</p>
            <p><strong>μ (mu)</strong>: Service rate per server</p>
            <p><strong>c</strong>: Number of servers ({totalStations})</p>
            <p><strong>ρ (rho)</strong>: Traffic intensity (λ/cμ)</p>
          </div>
          <div>
            <p><strong>L</strong>: Average number in system</p>
            <p><strong>Lq</strong>: Average queue length</p>
            <p><strong>W</strong>: Average time in system</p>
            <p><strong>Wq</strong>: Average wait time in queue</p>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error rendering simulation dashboard:', error);
    return (
      <div className="bg-gray-700 rounded-lg shadow-sm border border-gray-600 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-100">Operations Research Dashboard</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Activity className="w-4 h-4 text-red-400" />
            <span>Chart Rendering Error</span>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center">
          <p className="text-gray-400 mb-4">There was an error rendering the charts. Try refreshing the page.</p>
          <p className="text-xs text-gray-500">Error details: {String(error).slice(0, 100)}</p>
        </div>
      </div>
    );
  }
};
