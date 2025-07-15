import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { CheckCircle } from 'lucide-react';

interface ContributionConfirmationProps {
  transactionId: string;
  amount: number;
  currency?: string;
  phoneNumber: string;
  paymentMethod: string;
  groupName: string;
  cyclePeriod?: string;
  onMakeAnother?: () => void;
  onViewHistory?: () => void;
}

const ContributionConfirmation: React.FC<ContributionConfirmationProps> = ({
  transactionId,
  amount,
  currency = 'RWF',
  phoneNumber,
  paymentMethod,
  groupName,
  cyclePeriod,
  onMakeAnother,
  onViewHistory
}) => {
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Initiated</h2>
          <p className="mt-2 text-gray-600">
            Your contribution payment has been initiated. Please check your phone to complete the transaction.
          </p>
          
          <div className="mt-6 bg-gray-50 p-4 rounded-md">
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="text-sm font-medium text-gray-900">{transactionId}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Group</p>
                <p className="text-sm font-medium text-gray-900">{groupName}</p>
              </div>
              {cyclePeriod && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Cycle Period</p>
                  <p className="text-sm font-medium text-gray-900">{cyclePeriod}</p>
                </div>
              )}
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="text-sm font-medium text-gray-900">{paymentMethod}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-sm font-medium text-gray-900">{phoneNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-3">
            <div className="bg-blue-50 p-4 rounded-md text-left">
              <p className="text-sm text-blue-800 font-medium">What happens next?</p>
              <ul className="mt-2 text-sm text-blue-700 list-disc pl-5 space-y-1">
                <li>You will receive a prompt on your phone to authorize the payment</li>
                <li>Once authorized, the funds will be transferred to your group's account</li>
                <li>You will receive a confirmation SMS with your receipt details</li>
                <li>Your contribution will be marked as paid in the system</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
              {onMakeAnother && (
                <Button onClick={onMakeAnother} variant="outline">
                  Make Another Contribution
                </Button>
              )}
              {onViewHistory && (
                <Button onClick={onViewHistory}>
                  View Contribution History
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributionConfirmation; 