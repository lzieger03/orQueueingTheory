import { Clock, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface GameStatsDisplayProps {
  metrics: {
    averageWaitTime: number;
    throughput: number;
    utilization: number;
    customersInSystem: number;
    score: number;
  };
}

export function GameStatsDisplay({ metrics }: GameStatsDisplayProps) {
  const getPerformanceLevel = () => {
    const waitTime = metrics.averageWaitTime;
    const utilization = metrics.utilization;
    
    if (waitTime < 2 && utilization > 0.7 && utilization < 0.9) return 'excellent';
    if (waitTime < 4 && utilization > 0.6 && utilization < 0.95) return 'good';
    if (waitTime < 8 && utilization > 0.4) return 'fair';
    return 'poor';
  };

  const performanceLevel = getPerformanceLevel();
  
  const performanceConfig = {
    excellent: { 
      color: 'text-emerald-300', 
      bgColor: 'bg-emerald-500/20', 
      icon: CheckCircle, 
      label: 'Excellent',
      description: 'Optimal layout!'
    },
    good: { 
      color: 'text-blue-300', 
      bgColor: 'bg-blue-500/20', 
      icon: TrendingUp, 
      label: 'Good',
      description: 'Well optimized'
    },
    fair: { 
      color: 'text-yellow-300', 
      bgColor: 'bg-yellow-500/20', 
      icon: Activity, 
      label: 'Fair',
      description: 'Could improve'
    },
    poor: { 
      color: 'text-red-300', 
      bgColor: 'bg-red-500/20', 
      icon: AlertTriangle, 
      label: 'Poor',
      description: 'Needs optimization'
    }
  };

  const config = performanceConfig[performanceLevel];
  const IconComponent = config.icon;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Average Wait Time */}
      <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-xl border border-white/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/70 text-xs font-medium">Avg Wait Time</div>
            <div className="text-2xl font-bold text-white">
              {metrics.averageWaitTime.toFixed(1)}m
            </div>
          </div>
          <Clock className="w-6 h-6 text-blue-300" />
        </div>
        <div className="mt-2">
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
            metrics.averageWaitTime < 2 ? 'bg-emerald-500/30' :
            metrics.averageWaitTime < 5 ? 'bg-yellow-500/30' : 'bg-red-500/30'
          }`}>
            <div 
              className={`h-full transition-all duration-500 ${
                metrics.averageWaitTime < 2 ? 'bg-emerald-400' :
                metrics.averageWaitTime < 5 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(100, (metrics.averageWaitTime / 10) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Throughput */}
      <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-xl border border-white/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/70 text-xs font-medium">Throughput</div>
            <div className="text-2xl font-bold text-white">
              {metrics.throughput.toFixed(1)}/h
            </div>
          </div>
          <TrendingUp className="w-6 h-6 text-green-300" />
        </div>
        <div className="mt-2">
          <div className="w-full h-1.5 bg-green-500/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (metrics.throughput / 50) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Utilization */}
      <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-xl border border-white/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/70 text-xs font-medium">Utilization</div>
            <div className="text-2xl font-bold text-white">
              {(metrics.utilization * 100).toFixed(0)}%
            </div>
          </div>
          <Activity className="w-6 h-6 text-purple-300" />
        </div>
        <div className="mt-2">
          <div className="w-full h-1.5 bg-purple-500/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-400 transition-all duration-500"
              style={{ width: `${metrics.utilization * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Performance Rating */}
      <div className={`bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-xl border border-white/30 p-4 ${config.bgColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/70 text-xs font-medium">Performance</div>
            <div className={`text-lg font-bold ${config.color}`}>
              {config.label}
            </div>
            <div className="text-white/60 text-xs">
              {config.description}
            </div>
          </div>
          <IconComponent className={`w-6 h-6 ${config.color}`} />
        </div>
      </div>
    </div>
  );
}
