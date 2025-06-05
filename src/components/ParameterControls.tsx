// Parameter Controls component for adjusting simulation settings
import type { SimulationParams } from '../types';
import { realStoreData } from '../data/realData';
import { GameUtils } from '../utils/gameUtils';

interface ParameterControlsProps {
  params: SimulationParams;
  onUpdate: (updates: Partial<SimulationParams>) => void;
  disabled: boolean;
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  disabled: boolean;
  description?: string;
}

function SliderControl({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  unit, 
  onChange, 
  disabled,
  description 
}: SliderControlProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-200">{label}</label>
        <span className="text-sm text-gray-400 font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50 slider-thumb"
      />
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
    </div>
  );
}

export function ParameterControls({ params, onUpdate, disabled }: ParameterControlsProps) {
  // Function to update parameters based on real store data when day type changes
  const handleDayTypeChange = (dayType: 'weekday' | 'weekend') => {
    const storeData = realStoreData[dayType];
    onUpdate({ 
      dayType,
      serviceTimeRegular: storeData.avgServiceTime,
      serviceTimeKiosk: Math.round(storeData.avgServiceTime * 1.2),
      arrivalRate: dayType === 'weekday' ? 26 : 46, // Based on real customer counts converted to customers/hour
    });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6 text-gray-100">Simulation Parameters</h3>
      
      <div className="space-y-8">
        {/* Day Type */}
        <div>
          <label className="text-sm font-medium text-gray-200 mb-3 block">Day Type</label>
          <div className="flex space-x-3">
            <button
              onClick={() => handleDayTypeChange('weekday')}
              disabled={disabled}
              className={`flex-1 py-3 px-4 text-sm rounded-lg transition-all duration-300 border ${
                params.dayType === 'weekday'
                  ? 'bg-blue-600/30 border-blue-500/50 text-blue-100 shadow-lg'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              📅 Weekday
              <div className="text-xs text-gray-400 mt-1">82s avg, breaks, 22 customers</div>
            </button>
            <button
              onClick={() => handleDayTypeChange('weekend')}
              disabled={disabled}
              className={`flex-1 py-3 px-4 text-sm rounded-lg transition-all duration-300 border ${
                params.dayType === 'weekend'
                  ? 'bg-purple-600/30 border-purple-500/50 text-purple-100 shadow-lg'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              🎉 Weekend
              <div className="text-xs text-gray-400 mt-1">49s avg, no breaks, 37 customers</div>
            </button>
          </div>
        </div>

        {/* Arrival Rate */}
        <SliderControl
          label="Arrival Rate"
          value={params.arrivalRate}
          min={1}
          max={150}
          step={1}
          unit=" customers/hour"
          onChange={(value) => onUpdate({ arrivalRate: value })}
          disabled={disabled}
          description="How many customers arrive per hour"
        />

        {/* Service Times */}
        <div className="space-y-6">
          <h4 className="text-sm font-semibold text-gray-200">⚙️ Service Times</h4>
          
          <SliderControl
            label="Regular Checkout"
            value={params.serviceTimeRegular || 75} // Default to 75 seconds
            min={30}
            max={150}
            step={5}
            unit="s"
            onChange={(value) => onUpdate({ serviceTimeRegular: value })}
            disabled={disabled}
            description="Average time to serve one customer at staffed checkout"
          />

          <SliderControl
            label="Self-Service Kiosk"
            value={params.serviceTimeKiosk || 90} // Default to 90 seconds
            min={40}
            max={180}
            step={5}
            unit="s"
            onChange={(value) => onUpdate({ serviceTimeKiosk: value })}
            disabled={disabled}
            description="Customer self-checkout time (typically slower for clothing)"
          />
        </div>

        {/* Simulation Duration */}
        <SliderControl
          label="Simulation Duration"
          value={params.simulationDuration}
          min={15}
          max={180}
          step={15}
          unit=" minutes"
          onChange={(value) => onUpdate({ simulationDuration: value })}
          disabled={disabled}
          description="How long to run the simulation"
        />

        {/* Max Customers */}
        <SliderControl
          label="Max Customers"
          value={params.maxCustomers}
          min={100}
          max={2000}
          step={100}
          unit=""
          onChange={(value) => onUpdate({ maxCustomers: value })}
          disabled={disabled}
          description="Maximum customers to simulate"
        />

        {/* Preset Scenarios */}
        <div>
          <h4 className="text-sm font-semibold text-gray-200 mb-4">🎯 Quick Scenarios</h4>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => onUpdate({
                arrivalRate: 90,
                simulationDuration: 30,
                dayType: 'weekday'
              })}
              disabled={disabled}
              className="p-4 text-left text-sm bg-red-600/20 hover:bg-red-600/30 rounded-lg border border-red-500/30 transition-all duration-300 disabled:opacity-50"
            >
              <div className="font-medium text-red-100">🚨 Rush Hour</div>
              <div className="text-red-200 text-xs">High traffic, short duration</div>
            </button>

            <button
              onClick={() => onUpdate({
                arrivalRate: 30,
                simulationDuration: 120,
                dayType: 'weekday'
              })}
              disabled={disabled}
              className="p-4 text-left text-sm bg-green-600/20 hover:bg-green-600/30 rounded-lg border border-green-500/30 transition-all duration-300 disabled:opacity-50"
            >
              <div className="font-medium text-green-100">✅ Normal Day</div>
              <div className="text-green-200 text-xs">Moderate traffic, long duration</div>
            </button>

            <button
              onClick={() => onUpdate({
                arrivalRate: 72,
                simulationDuration: 90,
                dayType: 'weekend'
              })}
              disabled={disabled}
              className="p-4 text-left text-sm bg-purple-600/20 hover:bg-purple-600/30 rounded-lg border border-purple-500/30 transition-all duration-300 disabled:opacity-50"
            >
              <div className="font-medium text-purple-100">🛍️ Weekend Shopping</div>
              <div className="text-purple-200 text-xs">Weekend pattern simulation</div>
            </button>
          </div>
        </div>

        {/* Parameter Summary */}
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <h4 className="text-sm font-semibold text-gray-200 mb-3">📊 Expected Load</h4>
          <div className="text-sm text-gray-300 space-y-2">
            <div className="flex justify-between p-2 bg-gray-600/50 rounded">
              <span>Total customers:</span>
              <span className="font-mono">~{Math.round((params.arrivalRate * params.simulationDuration) / 60)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-600/50 rounded">
              <span>Peak rate:</span>
              <span className="font-mono">{params.arrivalRate} customers/hour</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-600/50 rounded">
              <span>Duration:</span>
              <span className="font-mono">{GameUtils.formatTime(params.simulationDuration * 60)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
