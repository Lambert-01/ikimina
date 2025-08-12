import React from 'react';
import { 
  Calendar, 
  CreditCard, 
  AlertCircle, 
  CheckCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../ui/button';

interface ActiveLoanCardProps {
  id: string;
  amount: number;
  amountPaid: number;
  interestRate: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'active' | 'overdue' | 'paid';
  groupName: string;
  className?: string;
  onMakePayment?: (loanId: string) => void;
}

const ActiveLoanCard: React.FC<ActiveLoanCardProps> = ({
  id,
  amount,
  amountPaid,
  interestRate,
  dueDate,
  status,
  groupName,
  className,
  onMakePayment
}) => {
  const isOverdue = status === 'overdue';
  const isPending = status === 'pending';
  const isPaid = status === 'paid';
  const isActive = status === 'active' || status === 'approved';
  
  const remainingAmount = amount - amountPaid;
  const interestAmount = amount * (interestRate / 100);
  const totalToRepay = amount + interestAmount;
  const progressPercentage = Math.min(100, Math.round((amountPaid / totalToRepay) * 100));
  
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'approved':
      case 'active':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const handleMakePayment = () => {
    if (onMakePayment) {
      onMakePayment(id);
    }
  };

  return (
    <div className={`
      bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-card dark:shadow-dark-card overflow-hidden
      transition-all duration-300 hover:shadow-lg
      ${isOverdue ? 'border-red-200 dark:border-red-900/50' : ''}
      ${isPaid ? 'border-green-200 dark:border-green-900/50' : ''}
      ${className || ''}
    `}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
              {formatCurrency(amount)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              from {groupName}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Repayment progress</span>
            <span className="font-medium text-gray-900 dark:text-gray-300">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${isPaid ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-primary-500'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">Paid</p>
              <p className="font-medium text-gray-900 dark:text-gray-300">{formatCurrency(amountPaid)}</p>
            </div>
            <div className="text-sm text-right">
              <p className="text-gray-500 dark:text-gray-400">Remaining</p>
              <p className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-300'}`}>
                {formatCurrency(remainingAmount)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <CreditCard className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
            <span>Interest rate: <span className="font-medium">{interestRate}%</span></span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
            <div className="flex flex-col">
              <span className="text-gray-600 dark:text-gray-400">Due date:</span>
              <span className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-300'}`}>
                {isOverdue && <AlertCircle className="h-3 w-3 inline mr-1" />}
                {formatDate(dueDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-dark-background/50 px-5 py-3 border-t border-gray-200 dark:border-dark-border">
        {!isPaid && !isPending && (
          <Button 
            onClick={handleMakePayment}
            className="w-full"
            variant={isOverdue ? "destructive" : "default"}
          >
            Make Payment
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        )}
        
        {isPending && (
          <div className="text-center text-sm text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
            <Clock className="h-4 w-4 mr-1" />
            Awaiting approval
          </div>
        )}
        
        {isPaid && (
          <div className="text-center text-sm text-green-600 dark:text-green-400 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Loan fully repaid
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveLoanCard; 