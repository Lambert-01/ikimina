import React from 'react';

export type PaymentProvider = 'MTN' | 'AIRTEL' | 'BANK' | 'CARD';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentProvider;
  onMethodChange: (method: PaymentProvider) => void;
  availableMethods?: PaymentProvider[];
  className?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  availableMethods = ['MTN', 'AIRTEL'],
  className = '',
}) => {
  // Helper function to check if a method is available
  const isMethodAvailable = (method: PaymentProvider): boolean => {
    return availableMethods.includes(method);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Payment Method
      </label>
      
      <div className="grid grid-cols-2 gap-4">
        {/* MTN Mobile Money */}
        {isMethodAvailable('MTN') && (
          <div
            className={`border rounded-md p-4 cursor-pointer transition-colors ${
              selectedMethod === 'MTN' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onMethodChange('MTN')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center">
                  <span className="font-bold text-black">MTN</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">MTN Mobile Money</p>
                <p className="text-xs text-gray-500">Fast & convenient</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Airtel Money */}
        {isMethodAvailable('AIRTEL') && (
          <div
            className={`border rounded-md p-4 cursor-pointer transition-colors ${
              selectedMethod === 'AIRTEL' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onMethodChange('AIRTEL')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="font-bold text-white">AIR</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Airtel Money</p>
                <p className="text-xs text-gray-500">Fast & convenient</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Bank Transfer */}
        {isMethodAvailable('BANK') && (
          <div
            className={`border rounded-md p-4 cursor-pointer transition-colors ${
              selectedMethod === 'BANK' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onMethodChange('BANK')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="font-bold text-white">BANK</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
                <p className="text-xs text-gray-500">2-3 business days</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Card Payment */}
        {isMethodAvailable('CARD') && (
          <div
            className={`border rounded-md p-4 cursor-pointer transition-colors ${
              selectedMethod === 'CARD' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onMethodChange('CARD')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="font-bold text-white">CARD</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Card Payment</p>
                <p className="text-xs text-gray-500">Visa, Mastercard, etc.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSelector; 