import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { requestLoan } from '../../services/loanService';
import { getMyGroups } from '../../services/groupService';
import type { Group } from '../../services/groupService';

interface LoanRequestFormProps {
  groupId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LoanRequestForm: React.FC<LoanRequestFormProps> = ({
  groupId: initialGroupId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || '');
  const [amount, setAmount] = useState<number>(0);
  const [purpose, setPurpose] = useState<string>('');
  const [duration, setDuration] = useState<number>(30); // Default 30 days
  
  // Derived state
  const selectedGroup = groups.find(g => g._id === selectedGroupId);
  const maxLoanAmount = selectedGroup 
    ? (selectedGroup.loanSettings?.maxLoanPercentage || 80) / 100 * (selectedGroup.balance || 0)
    : 0;
  const maxDuration = selectedGroup?.loanSettings?.maxLoanTerm || 90; // Default 90 days
  
  // Fetch user's groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await getMyGroups();
        if (response.success) {
          // Filter groups where loans are enabled
          const eligibleGroups = [...response.data.memberGroups, ...response.data.managedGroups]
            .filter(group => group.loanSettings?.enabled);
          
          setGroups(eligibleGroups);
          
          // Auto-select group if only one is available or if initialGroupId is provided
          if (initialGroupId) {
            setSelectedGroupId(initialGroupId);
          } else if (eligibleGroups.length === 1) {
            setSelectedGroupId(eligibleGroups[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch groups:', error);
        setError('Failed to load your groups. Please try again.');
      }
    };
    
    fetchGroups();
  }, [initialGroupId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroupId) {
      setError('Please select a group');
      return;
    }
    
    if (amount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }
    
    if (amount > maxLoanAmount) {
      setError(`Amount exceeds the maximum allowed (${formatCurrency(maxLoanAmount)})`);
      return;
    }
    
    if (!purpose.trim()) {
      setError('Please provide a purpose for the loan');
      return;
    }
    
    if (duration <= 0) {
      setError('Duration must be greater than zero');
      return;
    }
    
    if (duration > maxDuration) {
      setError(`Duration exceeds the maximum allowed (${maxDuration} days)`);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await requestLoan({
        groupId: selectedGroupId,
        amount,
        purpose,
        duration
      });
      
      if (response.success) {
        setSuccess(true);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } else {
          // Navigate to loans page after a delay
          setTimeout(() => {
            navigate('/member/loans');
          }, 2000);
        }
      } else {
        setError(response.message || 'Failed to submit loan request');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred while submitting your loan request');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate interest and total repayment
  const calculateLoanDetails = () => {
    if (!selectedGroup || amount <= 0) {
      return { interest: 0, totalRepayment: 0 };
    }
    
    const interestRate = selectedGroup.loanSettings?.interestRate || 5;
    const interest = (amount * interestRate / 100) * (duration / 30); // Monthly interest rate
    const totalRepayment = amount + interest;
    
    return { interest, totalRepayment };
  };
  
  const { interest, totalRepayment } = calculateLoanDetails();
  
  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <Check className="mr-2 h-5 w-5" />
            Loan Request Submitted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            Your loan request for {formatCurrency(amount)} has been submitted successfully.
            {selectedGroup?.loanSettings?.requiresVoting 
              ? ' It will now go through the group voting process.' 
              : ' It is now pending approval from the group manager.'}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate('/member/loans')}>
            View My Loans
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Request a Loan</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <select
              id="group"
              className="w-full p-2 border rounded-md"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              disabled={!!initialGroupId || isLoading}
              required
            >
              <option value="">Select a group</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>{group.name}</option>
              ))}
            </select>
            {groups.length === 0 && (
              <p className="text-xs text-amber-600">
                You don't have any groups with loans enabled.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (RWF)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              max={maxLoanAmount}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={!selectedGroupId || isLoading}
              required
            />
            {selectedGroupId && (
              <p className="text-xs text-gray-500">
                Maximum amount: {formatCurrency(maxLoanAmount)}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="Explain why you need this loan..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              disabled={!selectedGroupId || isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={maxDuration}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={!selectedGroupId || isLoading}
              required
            />
            {selectedGroupId && (
              <p className="text-xs text-gray-500">
                Maximum duration: {maxDuration} days
              </p>
            )}
          </div>
          
          {selectedGroupId && amount > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium mb-2">Loan Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Principal Amount:</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interest ({selectedGroup?.loanSettings?.interestRate || 5}%):</span>
                  <span>{formatCurrency(interest)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Repayment:</span>
                  <span>{formatCurrency(totalRepayment)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Due Date:</span>
                  <span>{new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel ? onCancel : () => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading || !selectedGroupId || amount <= 0 || !purpose.trim() || duration <= 0}
          >
            {isLoading ? 'Submitting...' : 'Request Loan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoanRequestForm; 