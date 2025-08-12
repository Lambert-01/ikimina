import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/button';
import type { OverdueContribution } from '../../services/paymentService';

interface OverdueContributionAlertProps {
  overdueContributions: OverdueContribution[];
  onMakePayment: (groupId: string) => void;
}

const OverdueContributionAlert: React.FC<OverdueContributionAlertProps> = ({
  overdueContributions,
  onMakePayment
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);
  
  if (dismissed || overdueContributions.length === 0) {
    return null;
  }
  
  const totalOverdue = overdueContributions.reduce((sum, item) => sum + item.amount, 0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                {overdueContributions.length === 1 
                  ? 'You have an overdue contribution' 
                  : `You have ${overdueContributions.length} overdue contributions`}
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Total amount overdue: <span className="font-medium">{formatCurrency(totalOverdue)}</span>
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setDismissed(true)}
              className="text-amber-500 hover:text-amber-700 hover:bg-amber-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4">
            {overdueContributions.length === 1 ? (
              <Button 
                variant="outline" 
                className="bg-white border-amber-300 text-amber-800 hover:bg-amber-50"
                onClick={() => onMakePayment(overdueContributions[0].groupId)}
              >
                Pay Now
              </Button>
            ) : (
              <div className="space-y-3">
                {overdueContributions.map((contribution) => (
                  <div 
                    key={contribution.groupId} 
                    className="flex justify-between items-center p-3 bg-white rounded-md border border-amber-100"
                  >
                    <div>
                      <p className="font-medium text-sm">{contribution.groupName}</p>
                      <p className="text-xs text-gray-500">
                        {contribution.daysOverdue} days overdue • {formatCurrency(contribution.amount)}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-amber-300 text-amber-800 hover:bg-amber-50"
                      onClick={() => onMakePayment(contribution.groupId)}
                    >
                      Pay
                    </Button>
                  </div>
                ))}
                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => onMakePayment(overdueContributions[0].groupId)}
                >
                  Pay All Overdue Contributions
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverdueContributionAlert; 