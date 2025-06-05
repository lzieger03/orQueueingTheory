// Sample refactoring of MetricsPanel.tsx to use centralized OR math

import React from 'react';
import { Clock, TrendingUp, Activity, Users, DollarSign, Smile } from 'lucide-react';
import type { Metrics, CheckoutStation, Customer } from '../types';
import { OperationsResearchMath } from '../utils/operationsResearchMath';

interface MetricsPanelProps {
  metrics?: Metrics;
  currentTime: number;
  stations: CheckoutStation[];
  mainQueue?: Customer[];
}

/**
 * Refactored MetricsPanel using centralized Operations Research math
 */
export function MetricsPanel({ metrics, currentTime, stations, mainQueue = [] }: MetricsPanelProps) {
  
  // ============ USING CENTRALIZED OR MATH ============
  
  // Use centralized method to calculate queue metrics instead of scattered calculations
  const queueMetrics = OperationsResearchMath.calculateQueueMetrics(
    stations,
    mainQueue,
    currentTime,
    0 // We don't have totalQueueLengthTime here, so use current state only
  );

  // Calculate real-time utilization using centralized method
  const calculatedUtilization = OperationsResearchMath.calculateServerUtilization(
    stations,
    currentTime,
    0, // No time-weighted data available in component
    0, // No previous utilization for smoothing in component context
    0  // No smoothing in real-time display
  );

  // Use centralized customer satisfaction if we had the required data
  // For demo, we'll show how it would be called:
  /*
  const satisfaction = OperationsResearchMath.calculateCustomerSatisfaction(
    (metrics?.averageWaitTime || 0) / 60, // Convert to minutes
    queueMetrics.averageQueueLength,
    0, // abandonment rate would come from metrics
    undefined, // no previous satisfaction for smoothing
    0.7 // smoothing factor
  );
  */

  // Safe metric values with fallbacks using centralized calculations where applicable
  const safeMetrics = {
    averageWaitTime: metrics?.averageWaitTime || 0,
    throughput: metrics?.throughput || 0,
    utilization: metrics?.utilization || calculatedUtilization,
    customersInSystem: metrics?.customersInSystem || queueMetrics.customersInSystem,
    totalCustomersServed: metrics?.totalCustomersServed || 0,
    customerSatisfaction: metrics?.customerSatisfaction || 100,
    score: metrics?.score || 0
  };

  // ============ PERFORMANCE SCORING USING CENTRALIZED MATH ============
  
  // Use centralized performance scoring
  const waitTimeMinutes = safeMetrics.averageWaitTime / 60;
  const waitTimeScore = OperationsResearchMath.calculateWaitTimeScore(waitTimeMinutes);
  const utilizationScore = OperationsResearchMath.calculateUtilizationScore(safeMetrics.utilization);
  
  // Calculate color coding based on performance scores
  const getWaitTimeColor = () => {
    if (waitTimeScore >= 75) return 'bg-emerald-600/20 border-emerald-500/30';
    if (waitTimeScore >= 50) return 'bg-yellow-600/20 border-yellow-500/30';
    return 'bg-red-600/20 border-red-500/30';
  };

  const getUtilizationColor = () => {
    if (utilizationScore >= 90) return 'bg-emerald-600/20 border-emerald-500/30';
    if (utilizationScore >= 70) return 'bg-yellow-600/20 border-yellow-500/30';
    return 'bg-red-600/20 border-red-500/30';
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <MetricCard
        title="Avg Wait Time"
        value={`${waitTimeMinutes.toFixed(1)}m`}
        icon={<Clock className="w-5 h-5 text-blue-400" />}
        color={getWaitTimeColor()}
        description={`Minutes per customer (Score: ${waitTimeScore.toFixed(0)})`}
        score={waitTimeScore}
      />
      <MetricCard
        title="Throughput"
        value={`${safeMetrics.throughput.toFixed(0)}/hr`}
        icon={<TrendingUp className="w-5 h-5 text-green-400" />}
        color="bg-green-600/20 border-green-500/30"
        description="Customers served/hr"
      />
      <MetricCard
        title="Utilization"
        value={`${(safeMetrics.utilization * 100).toFixed(0)}%`}
        icon={<Activity className="w-5 h-5 text-purple-400" />}
        color={getUtilizationColor()}
        description={`Server busy % (Score: ${utilizationScore.toFixed(0)})`}
        score={utilizationScore}
      />
      <MetricCard
        title="Main Queue"
        value={`${queueMetrics.mainQueueLength}`}
        icon={<Users className="w-5 h-5 text-indigo-400" />}
        color="bg-indigo-600/20 border-indigo-500/30"
        description="Customers in central queue"
      />
      <MetricCard
        title="Station Queues"
        value={`${queueMetrics.stationQueueLength}`}
        icon={<Users className="w-5 h-5 text-orange-400" />}
        color="bg-orange-600/20 border-orange-500/30"
        description="At individual stations"
      />
      <MetricCard
        title="Customers Served"
        value={`${safeMetrics.totalCustomersServed}`}
        icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        color="bg-emerald-600/20 border-emerald-500/30"
        description="Total completed transactions"
      />
      <MetricCard
        title="Customer Satisfaction"
        value={`${safeMetrics.customerSatisfaction.toFixed(0)}%`}
        icon={<Smile className="w-5 h-5 text-yellow-400" />}
        color="bg-yellow-600/20 border-yellow-500/30"
        description="Based on wait times"
      />
      <MetricCard
        title="Overall Score"
        value={`${safeMetrics.score.toFixed(0)}`}
        icon={<Activity className="w-5 h-5 text-red-400" />}
        color="bg-red-600/20 border-red-500/30"
        description="Performance rating"
      />
      <MetricCard
        title="Time Elapsed"
        value={`${(currentTime / 60).toFixed(0)}m`}
        icon={<Clock className="w-5 h-5 text-gray-400" />}
        color="bg-gray-600/20 border-gray-500/30"
        description="Minutes elapsed"
      />
    </div>
  );
}

// Enhanced MetricCard with performance scoring
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  score?: number; // Optional performance score
}

function MetricCard({ title, value, icon, color, description, score }: MetricCardProps) {
  return (
    <div className={`p-4 rounded-lg border backdrop-blur-sm ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-medium text-white">{title}</h3>
        </div>
        {score && (
          <div className="text-xs text-white/70">
            {score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴'}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/70">{description}</div>
      {score && (
        <div className="mt-2">
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                score >= 90 ? 'bg-emerald-400' : 
                score >= 70 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example of M/M/c theoretical comparison component
 */
interface TheoreticalComparisonProps {
  currentMetrics: Metrics;
  arrivalRate: number; // customers per minute
  serviceRate: number; // customers per minute per server
  serverCount: number;
}

export function TheoreticalComparison({ 
  currentMetrics, 
  arrivalRate, 
  serviceRate, 
  serverCount 
}: TheoreticalComparisonProps) {
  // Calculate theoretical metrics using centralized math
  const theoreticalMetrics = OperationsResearchMath.calculateMMcMetrics(
    arrivalRate * 60, // Convert to customers per hour
    serviceRate * 60, // Convert to customers per hour per server
    serverCount
  );

  // Compare with simulation using centralized math
  const comparison = OperationsResearchMath.compareSimulationWithTheory(
    theoreticalMetrics,
    currentMetrics
  );

  return (
    <div className="bg-white/10 rounded-lg p-4 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4">M/M/c Theoretical vs Simulation</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-2">Theoretical (M/M/c)</h4>
          <div className="space-y-1 text-sm text-white/70">
            <div>Wait Time: {(theoreticalMetrics.averageWaitTime / 60).toFixed(1)}m</div>
            <div>Queue Length: {theoreticalMetrics.averageQueueLength.toFixed(1)}</div>
            <div>Utilization: {(theoreticalMetrics.utilization * 100).toFixed(0)}%</div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-2">Simulation</h4>
          <div className="space-y-1 text-sm text-white/70">
            <div>Wait Time: {(currentMetrics.averageWaitTime / 60).toFixed(1)}m</div>
            <div>Queue Length: {currentMetrics.averageQueueLength.toFixed(1)}</div>
            <div>Utilization: {(currentMetrics.utilization * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="text-sm text-white/70">
          <div>Accuracy: {(comparison.accuracy * 100).toFixed(1)}%</div>
          <div className={`mt-1 ${comparison.accuracy > 0.8 ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {comparison.accuracy > 0.8 ? '✓ Good match with theory' : '⚠ Significant deviation from theory'}
          </div>
        </div>
      </div>
    </div>
  );
}
