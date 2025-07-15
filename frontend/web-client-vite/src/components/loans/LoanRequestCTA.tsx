import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CreditCard, ArrowRight } from 'lucide-react';

interface LoanRequestCTAProps {
  groupName?: string;
  maxLoanAmount?: number;
  currency?: string;
  onRequestLoan: () => void;
  className?: string;
}

const LoanRequestCTA: React.FC<LoanRequestCTAProps> = ({
  groupName = 'your group',
  maxLoanAmount,
  currency = 'RWF',
  onRequestLoan,
  className = '',
}) => {
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className={`border-primary-100 ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-primary-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Need funds for your project?</h2>
          
          <p className="text-gray-600 mb-6 max-w-md">
            As a member of {groupName}, you can request a loan 
            {maxLoanAmount ? ` up to ${formatCurrency(maxLoanAmount)}` : ''} 
            to help with your financial needs.
          </p>
          
          <div className="space-y-4 w-full max-w-xs">
            <Button 
              className="w-full flex items-center justify-center"
              onClick={onRequestLoan}
            >
              Request a Loan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <p className="text-xs text-gray-500">
              Loans are subject to group policy and approval by group managers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanRequestCTA; 