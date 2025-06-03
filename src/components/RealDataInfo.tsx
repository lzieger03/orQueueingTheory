// Real Data Info component to show users what actual store data is being used
import { realStoreData } from '../data/realData';
import { Info, Clock, Users, CreditCard } from 'lucide-react';

interface RealDataInfoProps {
  dayType: 'weekday' | 'weekend';
}

export function RealDataInfo({ dayType }: RealDataInfoProps) {
  const data = realStoreData[dayType];
  
  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-semibold text-blue-100">Real Clothing Store Data</h3>
        <span className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded">
          {dayType === 'weekday' ? 'Monday Data' : 'Saturday Data'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">
            {data.avgCustomers} customers/day
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">
            {data.avgServiceTime}s avg service
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">
            {Math.round(data.paymentDistribution.card * 100)}% card payments
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 text-center text-blue-400">👜</span>
          <span className="text-gray-300">
            {data.avgItemsPerCustomer} items/customer
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        Simulation uses real transaction data from a clothing store to model realistic customer behavior, 
        service times, and payment method distributions.
      </div>
    </div>
  );
}
