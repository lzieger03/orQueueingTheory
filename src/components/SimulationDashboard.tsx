// Improved SimulationDashboard component with realistic Operations Research metrics
import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Clock, Users, TrendingUp, DollarSign, BarChart2 } from 'lucide-react';
import type { SimulationData, CheckoutStation } from '../types';

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
  simulationData: SimulationData[];
  stations: CheckoutStation[];
  currentMetrics: CurrentMetrics;
}

export const SimulationDashboard: React.FC<SimulationDashboardProps> = ({
  simulationData,
  stations,
  currentMetrics,
}) => {
  // Prepare data for charts
  const timeSeriesData = simulationData.map((data) => ({
    time: data.timestamp / 60, // timestamp in minutes
    waitTime: data.averageWaitTime,
    throughput: data.throughput,
    utilization: data.utilization * 100,
    queueLength: data.queueLength,
  }));

  // Station utilization data
  const stationsArray = Array.isArray(stations) ? stations : [];
  
  // Calculate individual station utilization based on queue length and serving status
  const stationData = stationsArray.map((station, index) => {
    // Calculate individual station utilization based on queue length and serving status
    const stationUtilization = station.servingCustomer ? 100 : 0;
    
    return {
      name: `${station.type === 'regular' ? 'Regular' : 'Self-Service'} ${index + 1}`,
      utilization: stationUtilization,
      customers: station.queue.length + (station.servingCustomer ? 1 : 0),
    };
  });

  // Calculate Operations Research metrics
  const regularStations = stationsArray.filter(s => s.type === 'regular' && s.isActive).length;
  const kioskStations = stationsArray.filter(s => s.type === 'kiosk' && s.isActive).length;
  const totalStations = regularStations + kioskStations;
  
  // M/M/c queue model calculations
  const lambda = currentMetrics.throughput || 0; // arrival rate
  const mu = totalStations > 0 ? (lambda / (currentMetrics.utilization || 0.01)) / totalStations : 0; // service rate per server
  const rho = totalStations > 0 ? lambda / (totalStations * mu) : 0; // traffic intensity
  
  // Little's Law calculations
  const L = currentMetrics.customersInSystem || 0; // average number of customers in system
  const Lq = L - (currentMetrics.utilization * totalStations); // average queue length
  // const W = lambda > 0 ? L / lambda : 0; // average time in system (unused)
  const Wq = lambda > 0 ? Lq / lambda : 0; // average wait time in queue
  
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
                {Wq.toFixed(1)}m
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

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Wait Time Trend */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg hover:bg-gray-750 transition-all duration-300">
          <h4 className="text-md font-medium text-gray-200 mb-4">Wait Time Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
              <XAxis dataKey="time" stroke="rgba(156,163,175,0.6)" label={{ value: 'Time (min)', position: 'insideBottom', offset: -5, fill: 'rgba(156,163,175,0.6)' }} />
              <YAxis stroke="rgba(156,163,175,0.6)" label={{ value: 'Wait Time (min)', angle: -90, position: 'insideLeft', fill: 'rgba(156,163,175,0.6)' }} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)} min`, 'Wait Time']}
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '1px solid #6B7280',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Line
                type="monotone"
                dataKey="waitTime"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Throughput Trend */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg hover:bg-gray-750 transition-all duration-300">
          <h4 className="text-md font-medium text-gray-200 mb-4">Throughput Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
              <XAxis dataKey="time" stroke="rgba(156,163,175,0.6)" label={{ value: 'Time (min)', position: 'insideBottom', offset: -5, fill: 'rgba(156,163,175,0.6)' }} />
              <YAxis stroke="rgba(156,163,175,0.6)" label={{ value: 'Customers/hr', angle: -90, position: 'insideLeft', fill: 'rgba(156,163,175,0.6)' }} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(0)}/hr`, 'Throughput']}
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '1px solid #6B7280',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Line
                type="monotone"
                dataKey="throughput"
                stroke="#10B981"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Station Utilization */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg hover:bg-gray-750 transition-all duration-300">
          <h4 className="text-md font-medium text-gray-200 mb-4">Station Utilization</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} stroke="rgba(156,163,175,0.6)" />
              <YAxis stroke="rgba(156,163,175,0.6)" label={{ value: 'Utilization (%)', angle: -90, position: 'insideLeft', fill: 'rgba(156,163,175,0.6)' }} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Utilization']}
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '1px solid #6B7280',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Bar
                dataKey="utilization"
                fill="#8B5CF6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* System Overview */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg hover:bg-gray-750 transition-all duration-300">
          <h4 className="text-md font-medium text-gray-200 mb-4">System Overview</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
              <XAxis dataKey="time" stroke="rgba(156,163,175,0.6)" label={{ value: 'Time (min)', position: 'insideBottom', offset: -5, fill: 'rgba(156,163,175,0.6)' }} />
              <YAxis stroke="rgba(156,163,175,0.6)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '1px solid #6B7280',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="utilization"
                stroke="#A78BFA"
                strokeWidth={3}
                name="Utilization %"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="queueLength"
                stroke="#F87171"
                strokeWidth={3}
                name="Queue Length"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
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
              {Wq < 3 ? '🟢' : Wq < 7 ? '🟡' : '🔴'}
            </div>
            <p className="text-sm text-gray-300 font-medium">Wait Time</p>
            <p className="text-xs text-gray-400 mt-1">
              {Wq < 3 ? 'Excellent' : Wq < 7 ? 'Good' : 'Poor'}
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
};
