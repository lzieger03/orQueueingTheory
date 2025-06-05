// Advanced Analytics Dashboard with detailed performance insights
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, Target, AlertTriangle } from 'lucide-react';
import type { Metrics, CheckoutStation, Customer, SimulationData } from '../types';
import { OperationsResearchMath } from '../utils/operationsResearchMath';

interface AdvancedAnalyticsDashboardProps {
  currentMetrics: Metrics;
  simulationData: SimulationData[];
  stations: CheckoutStation[];
  customers: Customer[];
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  target?: number;
}

export function AdvancedAnalyticsDashboard({ 
  currentMetrics, 
  simulationData, 
  stations, 
  customers
}: AdvancedAnalyticsDashboardProps) {
  // Calculate advanced metrics
  const advancedMetrics = useMemo(() => {
    const recentData = simulationData.slice(-20); // Last 20 data points
    const previousMetrics = recentData.length > 1 ? recentData[recentData.length - 2] : null;
    
    // Calculate trends
    const waitTimeTrend = previousMetrics 
      ? ((currentMetrics.averageWaitTime - previousMetrics.averageWaitTime) / Math.max(1, previousMetrics.averageWaitTime)) * 100
      : 0;
    
    const throughputTrend = previousMetrics
      ? ((currentMetrics.throughput - previousMetrics.throughput) / Math.max(1, previousMetrics.throughput)) * 100
      : 0;
      
    const utilizationTrend = previousMetrics
      ? ((currentMetrics.utilization - previousMetrics.utilization) / Math.max(1, previousMetrics.utilization)) * 100
      : 0;
    
    // Station efficiency analysis
    const activeStations = stations.filter(s => s.isActive);
    const busyStations = activeStations.filter(s => s.servingCustomer);
    const stationEfficiency = activeStations.length > 0 ? (busyStations.length / activeStations.length) * 100 : 0;
    
    // Customer flow analysis
    const servedCustomers = customers.filter(c => c.serviceEndTime);
    const avgServiceTime = servedCustomers.length > 0 
      ? servedCustomers.reduce((sum, c) => sum + ((c.serviceEndTime! - c.serviceStartTime!) || 0), 0) / servedCustomers.length
      : 0;
    
    // Queue balance analysis
    const queueLengths = stations.map(s => s.queue.length);
    const maxQueue = Math.max(...queueLengths);
    const minQueue = Math.min(...queueLengths);
    const queueBalance = maxQueue > 0 ? (1 - (maxQueue - minQueue) / maxQueue) * 100 : 100;
    
    return {
      waitTimeTrend,
      throughputTrend,
      utilizationTrend,
      stationEfficiency,
      avgServiceTime,
      queueBalance
    };
  }, [currentMetrics, simulationData, stations, customers]);

  // Metric cards configuration
  const metricCards: MetricCard[] = [
    {
      title: 'Average Wait Time',
      value: `${OperationsResearchMath.convertSecondsToMinutes(currentMetrics.averageWaitTime).toFixed(1)}m`,
      change: advancedMetrics.waitTimeTrend,
      trend: advancedMetrics.waitTimeTrend > 5 ? 'up' : advancedMetrics.waitTimeTrend < -5 ? 'down' : 'stable',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-blue-400',
      target: 2 // 2 minutes target
    },
    {
      title: 'Throughput',
      value: `${currentMetrics.throughput.toFixed(1)}/hr`,
      change: advancedMetrics.throughputTrend,
      trend: advancedMetrics.throughputTrend > 5 ? 'up' : advancedMetrics.throughputTrend < -5 ? 'down' : 'stable',
      icon: <Users className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      title: 'Station Utilization',
      value: `${(currentMetrics.utilization * 100).toFixed(1)}%`,
      change: advancedMetrics.utilizationTrend,
      trend: advancedMetrics.utilizationTrend > 5 ? 'up' : advancedMetrics.utilizationTrend < -5 ? 'down' : 'stable',
      icon: <Target className="w-5 h-5" />,
      color: 'text-yellow-400'
    },
    {
      title: 'Queue Balance',
      value: `${advancedMetrics.queueBalance.toFixed(1)}%`,
      change: 0,
      trend: 'stable',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-purple-400'
    }
  ];

  // Customer satisfaction distribution
  const satisfactionData = [
    { name: 'Excellent', value: currentMetrics.customerSatisfaction > 90 ? currentMetrics.customerSatisfaction - 90 : 0, fill: '#10B981' },
    { name: 'Good', value: currentMetrics.customerSatisfaction > 70 ? Math.min(20, currentMetrics.customerSatisfaction - 70) : 0, fill: '#F59E0B' },
    { name: 'Fair', value: currentMetrics.customerSatisfaction > 50 ? Math.min(20, currentMetrics.customerSatisfaction - 50) : 0, fill: '#EF4444' },
    { name: 'Poor', value: currentMetrics.customerSatisfaction <= 50 ? 50 - currentMetrics.customerSatisfaction : 0, fill: '#DC2626' }
  ];

  // Station performance data
  const stationData = stations.map(station => ({
    name: `${station.type} ${station.id.split('_')[1]}`,
    utilization: station.servingCustomer ? 100 : 0,
    queueLength: station.queue.length,
    efficiency: station.queue.length === 0 && !station.servingCustomer ? 100 : 
                station.servingCustomer ? 90 - Math.min(station.queue.length * 10, 40) : 
                Math.max(0, 60 - station.queue.length * 15)
  }));

  // Performance trend data - ensure consistent metrics with better validation
  const trendData = (Array.isArray(simulationData) && simulationData.length > 0)
    ? simulationData.slice(-20).map((data, index) => {
        // Validate all data points with fallbacks
        const safeData = {
          averageWaitTime: data.averageWaitTime || 0,
          throughput: data.throughput || 0,
          utilization: data.utilization || 0,
          customerSatisfaction: 'customerSatisfaction' in data ? (data as any).customerSatisfaction : undefined
        };
        
        // Convert wait time to minutes for consistent display using centralized method
        const waitTimeMinutes = OperationsResearchMath.convertSecondsToMinutes(safeData.averageWaitTime);
        
        // Try to use satisfaction from data if available, otherwise calculate from wait time
        // This ensures consistency with the main metrics
        let satisfaction;
        if (safeData.customerSatisfaction !== undefined) {
          satisfaction = safeData.customerSatisfaction;
        } else {
          // Fallback calculation based on wait time - inverse relationship
          satisfaction = Math.max(0, 100 - (waitTimeMinutes * 20));
        }
        
        return {
          time: `${Math.floor(index * 0.5)}m`,
          waitTime: waitTimeMinutes,
          throughput: safeData.throughput,
          utilization: safeData.utilization * 100,
          satisfaction: satisfaction
        };
      })
    : Array.from({ length: 5 }, (_, i) => ({ 
        time: `${i}m`, 
        waitTime: 0, 
        throughput: 0, 
        utilization: 0, 
        satisfaction: 0 
      })); // Provide fallback data for empty simulation data

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-gray-700 ${metric.color}`}>
                {metric.icon}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-100">{metric.value}</div>
                <div className="text-sm text-gray-400">{metric.title}</div>
              </div>
            </div>
            
            {/* Trend indicator */}
            <div className="mt-3 flex items-center justify-between">
              <div className={`flex items-center text-sm ${
                metric.trend === 'up' ? 'text-green-400' : 
                metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {metric.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> :
                 metric.trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> :
                 <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>}
                {Math.abs(metric.change).toFixed(1)}%
              </div>
              
              {/* Target indicator */}
              {metric.target && (
                <div className="text-xs text-gray-500">
                  Target: {metric.target}m
                </div>
              )}
            </div>
            
            {/* Progress bar for targets */}
            {metric.target && (
              <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full ${
                    parseFloat(metric.value) <= metric.target ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (parseFloat(metric.value) / metric.target) * 100)}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wait Time & Throughput Trends */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4" style={{ minHeight: '350px' }}>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Performance Trends</h3>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    color: '#F3F4F6'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="waitTime" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Wait Time (min)"
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="throughput" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Throughput (/hr)"
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Station Performance */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Station Performance</h3>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    color: '#F3F4F6'
                  }} 
                />
                <Legend />
                <Bar dataKey="efficiency" fill="#F59E0B" name="Efficiency %" isAnimationActive={true} />
                <Bar dataKey="queueLength" fill="#EF4444" name="Queue Length" isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Utilization Heatmap & Customer Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Over Time */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Utilization Pattern</h3>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    color: '#F3F4F6'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#8B5CF6" 
                  fill="url(#utilizationGradient)"
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                <defs>
                  <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Satisfaction Breakdown */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Customer Satisfaction</h3>
          <div className="flex items-center justify-center">
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Overall Score */}
          <div className="text-center mt-4">
            <div className="text-3xl font-bold text-gray-100">
              {currentMetrics.customerSatisfaction.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Overall Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Performance Alert */}
          {currentMetrics.averageWaitTime > 180 && (
            <div className="flex items-center p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-red-300">High Wait Times</div>
                <div className="text-xs text-red-400">Consider adding more stations</div>
              </div>
            </div>
          )}
          
          {/* Efficiency Insight */}
          {advancedMetrics.queueBalance < 70 && (
            <div className="flex items-center p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <Target className="w-5 h-5 text-yellow-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-yellow-300">Unbalanced Queues</div>
                <div className="text-xs text-yellow-400">Redistribute stations for better flow</div>
              </div>
            </div>
          )}
          
          {/* Success Insight */}
          {currentMetrics.customerSatisfaction > 85 && currentMetrics.throughput > 30 && (
            <div className="flex items-center p-3 bg-green-900/30 border border-green-700 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-green-300">Excellent Performance</div>
                <div className="text-xs text-green-400">Your layout is highly optimized!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
