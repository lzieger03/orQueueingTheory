// Enhanced Customer Preference Legend with detailed explanations
import { Info } from 'lucide-react';

interface CustomerPreferenceLegendProps {
  className?: string;
}

export function CustomerPreferenceLegend({ className = '' }: CustomerPreferenceLegendProps) {
  const legends = [
    {
      color: 'bg-yellow-500',
      ringColor: 'ring-yellow-300',
      label: 'Cash Payment',
      icon: '💵',
      description: 'Customers paying with cash - prefer human cashiers',
      prefersSelfCheckout: false
    },
    {
      color: 'bg-purple-500', 
      ringColor: 'ring-purple-300',
      label: 'Voucher Payment',
      icon: '🎫',
      description: 'Customers with vouchers/coupons - need cashier assistance',
      prefersSelfCheckout: false
    },
    {
      color: 'bg-green-500',
      ringColor: 'ring-green-300', 
      label: 'Card + Self-Checkout',
      icon: '🤖💳',
      description: 'Tech-savvy customers who prefer self-service kiosks',
      prefersSelfCheckout: true
    },
    {
      color: 'bg-blue-500',
      ringColor: 'ring-blue-300',
      label: 'Card + Regular',
      icon: '👤💳',
      description: 'Card-paying customers who prefer human service',
      prefersSelfCheckout: false
    }
  ];

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-blue-400" />
        <h4 className="text-sm font-semibold text-gray-200">Customer Types & Behavior</h4>
      </div>
      
      <div className="space-y-3">
        {legends.map((legend, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${legend.color} ring-2 ${legend.ringColor} flex-shrink-0 relative`}>
              {/* Payment method indicator */}
              <span className="absolute -bottom-1 -right-1 text-xs leading-none">
                {legend.icon.includes('💳') ? '💳' : legend.icon.includes('💵') ? '💵' : '🎫'}
              </span>
              
              {/* Preference indicator */}
              {legend.prefersSelfCheckout && (
                <span className="absolute -top-1 -left-1 text-xs leading-none">🤖</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200">{legend.label}</span>
                <span className="text-xs">{legend.icon}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{legend.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional indicators */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <h5 className="text-xs font-semibold text-gray-300 mb-2">Special Indicators</h5>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-3 h-3 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">!</span>
            <span>15+ items (high-volume customer)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="animate-pulse">⚡</span>
            <span>Currently being served</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>🤖</span>
            <span>Prefers self-checkout kiosks</span>
          </div>
        </div>
      </div>
      
      {/* Tips section */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <h5 className="text-xs font-semibold text-gray-300 mb-2">Optimization Tips</h5>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Cash/voucher customers need regular checkout stations</li>
          <li>• Self-checkout kiosks are faster for card-paying customers</li>
          <li>• Express lanes work best for customers with &lt;15 items</li>
          <li>• Balance regular vs. self-service stations based on customer mix</li>
        </ul>
      </div>
    </div>
  );
}