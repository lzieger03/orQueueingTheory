'use client'; // this is neccessary for Next.js 13+ to use client components

// Enhanced Metrics Display - Minimal version for debugging
import type { CheckoutStation, Metrics } from '../types';

interface EnhancedMetricsDisplayProps {
  currentMetrics: Metrics;
  stations: CheckoutStation[];
}

export function EnhancedMetricsDisplay({ currentMetrics, stations }: EnhancedMetricsDisplayProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-100">System Analytics</h3>
      <div className="mt-4 text-gray-100">
        <p>Wait Time: {(currentMetrics.averageWaitTime / 60).toFixed(1)}m</p>
        <p>Throughput: {currentMetrics.throughput?.toFixed(0) || 0}/hr</p>
        <p>Active Stations: {stations.filter(s => s.isActive).length}</p>
      </div>
    </div>
  );
}
