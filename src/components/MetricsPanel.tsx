// Improved MetricsPanel component for displaying accurate real-time performance metrics
import React from 'react';
import type { Metrics, CheckoutStation, Customer } from '../types';
import { Clock, Users, Activity, TrendingUp, DollarSign, Smile } from 'lucide-react';
import { OperationsResearchMath } from '../utils/operationsResearchMath';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

function MetricCard({ title, value, icon, color, description }: MetricCardProps) {
  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={color}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-100 mb-1">{value}</div>
      <div className="text-sm text-gray-300">{title}</div>
      {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
    </div>
  );
}

interface MetricsPanelProps {
  metrics: Metrics;
  currentTime: number;
  stations: CheckoutStation[];
  mainQueue?: Customer[]; // Add main queue prop
}

export function MetricsPanel({ metrics, currentTime, stations, mainQueue = [] }: MetricsPanelProps) {
  // Calculate real-time derived values with safety checks
  const safeStations = Array.isArray(stations) ? stations : [];
  const safeMainQueue = Array.isArray(mainQueue) ? mainQueue : [];
  
  // Calculate queue lengths
  const stationQueueLength = safeStations.reduce((sum, s) => sum + (s.queue?.length || 0), 0);
  const mainQueueLength = safeMainQueue.length;
  const totalQueueLength = stationQueueLength + mainQueueLength;
  
  // Calculate busy stations
  const busyStations = safeStations.filter(s => s.servingCustomer).length;
  const totalStations = safeStations.filter(s => s.isActive).length;
  const customersInSystem = totalQueueLength + busyStations;
  
  // Calculate utilization
  const calculatedUtilization = totalStations > 0 ? busyStations / totalStations : 0;

  // Safe metric values with fallbacks
  const safeMetrics = {
    averageWaitTime: metrics?.averageWaitTime || 0,
    throughput: metrics?.throughput || 0,
    utilization: metrics?.utilization || calculatedUtilization,
    customersInSystem: metrics?.customersInSystem || customersInSystem,
    totalCustomersServed: metrics?.totalCustomersServed || 0,
    customerSatisfaction: metrics?.customerSatisfaction || 100,
    score: metrics?.score || 0
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <MetricCard
        title="Avg Wait Time"
        value={`${OperationsResearchMath.convertSecondsToMinutes(safeMetrics.averageWaitTime).toFixed(1)}m`}
        icon={<Clock className="w-5 h-5 text-blue-400" />}
        color="bg-blue-600/20 p-2 rounded-lg"
        description="Minutes per customer"
      />
      <MetricCard
        title="Throughput"
        value={`${safeMetrics.throughput.toFixed(0)}/hr`}
        icon={<TrendingUp className="w-5 h-5 text-green-400" />}
        color="bg-green-600/20 p-2 rounded-lg"
        description="Customers served/hr"
      />
      <MetricCard
        title="Utilization"
        value={`${(safeMetrics.utilization * 100).toFixed(0)}%`}
        icon={<Activity className="w-5 h-5 text-purple-400" />}
        color="bg-purple-600/20 p-2 rounded-lg"
        description="Server busy %"
      />
      <MetricCard
        title="Main Queue"
        value={`${mainQueueLength}`}
        icon={<Users className="w-5 h-5 text-indigo-400" />}
        color="bg-indigo-600/20 p-2 rounded-lg"
        description="Customers in central queue"
      />
      <MetricCard
        title="Station Queues"
        value={`${stationQueueLength}`}
        icon={<Users className="w-5 h-5 text-orange-400" />}
        color="bg-orange-600/20 p-2 rounded-lg"
        description="At individual stations"
      />
      <MetricCard
        title="Customers Served"
        value={`${safeMetrics.totalCustomersServed}`}
        icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        color="bg-emerald-600/20 p-2 rounded-lg"
        description="Total completed transactions"
      />
      <MetricCard
        title="Customer Satisfaction"
        value={`${safeMetrics.customerSatisfaction.toFixed(0)}%`}
        icon={<Smile className="w-5 h-5 text-yellow-400" />}
        color="bg-yellow-600/20 p-2 rounded-lg"
        description="Based on wait times"
      />
      <MetricCard
        title="Overall Score"
        value={`${safeMetrics.score.toFixed(0)}`}
        icon={<Activity className="w-5 h-5 text-red-400" />}
        color="bg-red-600/20 p-2 rounded-lg"
        description="Performance rating"
      />
      <MetricCard
        title="Time Elapsed"
        value={`${(currentTime / 60).toFixed(0)}m`}
        icon={<Clock className="w-5 h-5 text-gray-400" />}
        color="bg-gray-600/20 p-2 rounded-lg"
        description="Minutes elapsed"
      />
    </div>
  );
}
