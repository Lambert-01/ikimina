import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { CalendarClock, AlertTriangle, CreditCard, ArrowRight } from 'lucide-react';

interface ActiveLoanProps {
  id: string;
  amount: number;
  currency?: string;
  disbursementDate: string;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  totalPaid: number;
  totalRemaining: number;
  repaymentProgress: number;
  status: 'current' | 'overdue' | 'grace';
  daysOverdue?: number;
  groupName: string;
  onMakePayment?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

const ActiveLoanCard: React.FC<ActiveLoanProps> = ({
  id,
  amount,
  currency = 'RWF',
  disbursementDate,
  nextPaymentDate,
  nextPaymentAmount,
  totalPaid,
  totalRemaining,
  repaymentProgress,
  status,
  daysOverdue = 0,
  groupName,
  onMakePayment,
  onViewDetails,
  className = '',
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

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color and text
  const getStatusDetails = () => {
    switch (status) {
      case 'overdue':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          text: `Overdue by ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}`,
        };
      case 'grace':
        return {
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: <CalendarClock className="h-5 w-5 text-amber-500" />,
          text: 'In grace period',
        };
      default:
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CreditCard className="h-5 w-5 text-green-500" />,
          text: 'Current',
        };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <Card className={`${className} ${statusDetails.borderColor}`}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Loan Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Active Loan</h3>
              <p className="text-sm text-gray-500">{groupName}</p>
            </div>
            <div className={`px-3 py-1 rounded-full flex items-center ${statusDetails.bgColor} ${statusDetails.color}`}>
              {statusDetails.icon}
              <span className="ml-1.5 text-xs font-medium">{statusDetails.text}</span>
            </div>
          </div>
          
          {/* Loan Amount and Progress */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</h4>
              <span className="text-sm font-medium">{repaymentProgress}% repaid</span>
            </div>
            <Progress value={repaymentProgress} className="h-2" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Paid: {formatCurrency(totalPaid)}</span>
              <span className="text-xs text-gray-500">Remaining: {formatCurrency(totalRemaining)}</span>
            </div>
          </div>
          
          {/* Loan Details */}
          <div className="bg-gray-50 rounded-md p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Disbursement Date</span>
              <span className="text-sm font-medium">{formatDate(disbursementDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Next Payment Due</span>
              <span className={`text-sm font-medium ${status === 'overdue' ? 'text-red-600' : ''}`}>
                {formatDate(nextPaymentDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Next Payment Amount</span>
              <span className="text-sm font-medium">{formatCurrency(nextPaymentAmount)}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {onMakePayment && (
              <Button 
                className="flex-1 flex items-center justify-center"
                onClick={onMakePayment}
              >
                Make Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {onViewDetails && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onViewDetails}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveLoanCard; 