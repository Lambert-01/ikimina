import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Link } from 'react-router-dom';

interface OverdueContribution {
  id: string;
  groupId: string;
  groupName: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysOverdue: number;
  penalties?: number;
}

interface OverdueContributionAlertProps {
  overdueContributions: OverdueContribution[];
  onContribute?: (contributionId: string, groupId: string) => void;
  className?: string;
}

const OverdueContributionAlert: React.FC<OverdueContributionAlertProps> = ({
  overdueContributions,
  onContribute,
  className = '',
}) => {
  if (!overdueContributions || overdueContributions.length === 0) {
    return null;
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'RWF'): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={className}>
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-sm font-medium text-red-800">
                {overdueContributions.length === 1 
                  ? 'You have an overdue contribution' 
                  : `You have ${overdueContributions.length} overdue contributions`}
              </h3>
              
              <div className="mt-2">
                <div className="space-y-3">
                  {overdueContributions.map((contribution) => (
                    <div key={contribution.id} className="bg-white p-3 rounded-md border border-red-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{contribution.groupName}</p>
                          <p className="text-xs text-gray-500">
                            Due on {formatDate(contribution.dueDate)} ({contribution.daysOverdue} days overdue)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            {formatCurrency(contribution.amount, contribution.currency)}
                          </p>
                          {contribution.penalties && contribution.penalties > 0 && (
                            <p className="text-xs text-red-500">
                              +{formatCurrency(contribution.penalties, contribution.currency)} penalty
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        {onContribute ? (
                          <Button 
                            size="sm" 
                            onClick={() => onContribute(contribution.id, contribution.groupId)}
                          >
                            Pay Now
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            asChild
                          >
                            <Link to={`/dashboard/member/savings?group=${contribution.groupId}&contribution=${contribution.id}`}>
                              Pay Now
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 text-sm">
                <p className="text-red-700">
                  Please make your payments as soon as possible to avoid additional penalties.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverdueContributionAlert; 