import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface GroupLoanPolicy {
  id: string;
  name: string;
  maxLoanAmount: number;
  minLoanAmount: number;
  interestRate: number;
  maxRepaymentPeriod: number;
  minRepaymentPeriod: number;
  currency: string;
  requiresGuarantor: boolean;
  requiresReason: boolean;
}

interface LoanRequestFormProps {
  groupId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LoanRequestForm: React.FC<LoanRequestFormProps> = ({
  groupId: initialGroupId,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [groups, setGroups] = useState<GroupLoanPolicy[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || '');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [repaymentPeriod, setRepaymentPeriod] = useState<number>(3);
  const [reason, setReason] = useState<string>('');
  const [guarantorName, setGuarantorName] = useState<string>('');
  const [guarantorPhone, setGuarantorPhone] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestId, setRequestId] = useState<string>('');

  // Load groups and loan policies
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock groups data
        const mockGroups: GroupLoanPolicy[] = [
          {
            id: 'g1',
            name: 'Community Savings Group',
            maxLoanAmount: 100000,
            minLoanAmount: 5000,
            interestRate: 5,
            maxRepaymentPeriod: 12,
            minRepaymentPeriod: 1,
            currency: 'RWF',
            requiresGuarantor: true,
            requiresReason: true
          },
          {
            id: 'g2',
            name: 'Women Entrepreneurs',
            maxLoanAmount: 200000,
            minLoanAmount: 10000,
            interestRate: 3,
            maxRepaymentPeriod: 24,
            minRepaymentPeriod: 3,
            currency: 'RWF',
            requiresGuarantor: false,
            requiresReason: true
          }
        ];
        
        setGroups(mockGroups);
        
        // If initial group ID is provided, set it as selected
        if (initialGroupId) {
          setSelectedGroupId(initialGroupId);
          
          // Set default loan amount to minimum
          const selectedGroup = mockGroups.find(g => g.id === initialGroupId);
          if (selectedGroup) {
            setLoanAmount(selectedGroup.minLoanAmount.toString());
            setRepaymentPeriod(selectedGroup.minRepaymentPeriod);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load group data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [initialGroupId]);

  // Handle group selection change
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    
    if (groupId) {
      const selectedGroup = groups.find(g => g.id === groupId);
      if (selectedGroup) {
        setLoanAmount(selectedGroup.minLoanAmount.toString());
        setRepaymentPeriod(selectedGroup.minRepaymentPeriod);
      }
    } else {
      setLoanAmount('');
      setRepaymentPeriod(3);
    }
    
    // Clear errors when changing groups
    setErrors({});
  };

  // Get selected group
  const getSelectedGroup = (): GroupLoanPolicy | undefined => {
    return groups.find(g => g.id === selectedGroupId);
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'RWF'): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate monthly payment
  const calculateMonthlyPayment = (): string => {
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup || !loanAmount || isNaN(Number(loanAmount))) return 'N/A';
    
    const principal = Number(loanAmount);
    const interestRate = selectedGroup.interestRate / 100 / 12; // Monthly interest rate
    const totalPayments = repaymentPeriod;
    
    // Simple interest calculation for demo purposes
    // In a real app, you might use more complex formulas
    const interest = principal * interestRate * totalPayments;
    const totalAmount = principal + interest;
    const monthlyPayment = totalAmount / totalPayments;
    
    return formatCurrency(monthlyPayment, selectedGroup.currency);
  };

  // Calculate total repayment
  const calculateTotalRepayment = (): string => {
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup || !loanAmount || isNaN(Number(loanAmount))) return 'N/A';
    
    const principal = Number(loanAmount);
    const interestRate = selectedGroup.interestRate / 100 / 12; // Monthly interest rate
    const totalPayments = repaymentPeriod;
    
    // Simple interest calculation
    const interest = principal * interestRate * totalPayments;
    const totalAmount = principal + interest;
    
    return formatCurrency(totalAmount, selectedGroup.currency);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const selectedGroup = getSelectedGroup();
    
    if (!selectedGroupId) {
      newErrors.group = 'Please select a group';
    }
    
    if (!loanAmount) {
      newErrors.loanAmount = 'Loan amount is required';
    } else if (selectedGroup) {
      const amount = Number(loanAmount);
      if (isNaN(amount)) {
        newErrors.loanAmount = 'Please enter a valid amount';
      } else if (amount < selectedGroup.minLoanAmount) {
        newErrors.loanAmount = `Minimum loan amount is ${formatCurrency(selectedGroup.minLoanAmount, selectedGroup.currency)}`;
      } else if (amount > selectedGroup.maxLoanAmount) {
        newErrors.loanAmount = `Maximum loan amount is ${formatCurrency(selectedGroup.maxLoanAmount, selectedGroup.currency)}`;
      }
    }
    
    if (selectedGroup?.requiresReason && !reason.trim()) {
      newErrors.reason = 'Please provide a reason for your loan request';
    }
    
    if (selectedGroup?.requiresGuarantor) {
      if (!guarantorName.trim()) {
        newErrors.guarantorName = 'Guarantor name is required';
      }
      if (!guarantorPhone.trim()) {
        newErrors.guarantorPhone = 'Guarantor phone number is required';
      } else if (!/^\+?[0-9]{10,15}$/.test(guarantorPhone)) {
        newErrors.guarantorPhone = 'Please enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // In a real app, this would call the API
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock request ID
      const mockRequestId = `LR${Date.now().toString().slice(-8)}`;
      setRequestId(mockRequestId);
      
      setSuccess(true);
      toast.success('Loan request submitted successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting loan request:', error);
      toast.error('Failed to submit loan request');
    } finally {
      setSubmitting(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render success state
  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Loan Request Submitted</h2>
            <p className="mt-2 text-gray-600">
              Your loan request has been submitted for review. You will be notified once it's approved.
            </p>
            
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">Request ID: <span className="font-medium">{requestId}</span></p>
              <p className="text-sm text-gray-700 mt-1">Amount: <span className="font-medium">
                {formatCurrency(Number(loanAmount), getSelectedGroup()?.currency)}
              </span></p>
              <p className="text-sm text-gray-700 mt-1">Repayment Period: <span className="font-medium">
                {repaymentPeriod} {repaymentPeriod === 1 ? 'month' : 'months'}
              </span></p>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSuccess(false);
                  setLoanAmount('');
                  setReason('');
                  setGuarantorName('');
                  setGuarantorPhone('');
                }}
              >
                Make Another Request
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedGroup = getSelectedGroup();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Loan</CardTitle>
        <CardDescription>
          Fill out the form below to request a loan from your savings group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Selection */}
          <div>
            <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
              Select Group *
            </label>
            <select
              id="group"
              name="group"
              className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.group ? 'border-red-500' : 'border-gray-300'
              }`}
              value={selectedGroupId}
              onChange={handleGroupChange}
              disabled={!!initialGroupId}
            >
              <option value="">Select a group</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            {errors.group && (
              <p className="mt-1 text-sm text-red-600">{errors.group}</p>
            )}
          </div>

          {selectedGroupId && (
            <>
              {/* Loan Amount */}
              <div>
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {selectedGroup?.currency === 'RWF' ? 'RWF' : '$'}
                    </span>
                  </div>
                  <input
                    type="number"
                    name="loanAmount"
                    id="loanAmount"
                    className={`block w-full pl-12 pr-12 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.loanAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                {errors.loanAmount ? (
                  <p className="mt-1 text-sm text-red-600">{errors.loanAmount}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Min: {formatCurrency(selectedGroup?.minLoanAmount || 0, selectedGroup?.currency)} | 
                    Max: {formatCurrency(selectedGroup?.maxLoanAmount || 0, selectedGroup?.currency)}
                  </p>
                )}
              </div>

              {/* Repayment Period */}
              <div>
                <label htmlFor="repaymentPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                  Repayment Period (months) *
                </label>
                <input
                  type="range"
                  name="repaymentPeriod"
                  id="repaymentPeriod"
                  min={selectedGroup?.minRepaymentPeriod || 1}
                  max={selectedGroup?.maxRepaymentPeriod || 12}
                  step={1}
                  value={repaymentPeriod}
                  onChange={(e) => setRepaymentPeriod(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">{selectedGroup?.minRepaymentPeriod || 1} month</span>
                  <span className="text-sm font-medium">{repaymentPeriod} {repaymentPeriod === 1 ? 'month' : 'months'}</span>
                  <span className="text-xs text-gray-500">{selectedGroup?.maxRepaymentPeriod || 12} months</span>
                </div>
              </div>

              {/* Loan Purpose/Reason */}
              {selectedGroup?.requiresReason && (
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Purpose *
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.reason ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Please describe why you need this loan..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                  )}
                </div>
              )}

              {/* Guarantor Information */}
              {selectedGroup?.requiresGuarantor && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Guarantor Information</h3>
                  
                  <div>
                    <label htmlFor="guarantorName" className="block text-sm font-medium text-gray-700 mb-1">
                      Guarantor Name *
                    </label>
                    <input
                      type="text"
                      name="guarantorName"
                      id="guarantorName"
                      className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.guarantorName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Full name"
                      value={guarantorName}
                      onChange={(e) => setGuarantorName(e.target.value)}
                    />
                    {errors.guarantorName && (
                      <p className="mt-1 text-sm text-red-600">{errors.guarantorName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="guarantorPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Guarantor Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="guarantorPhone"
                      id="guarantorPhone"
                      className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.guarantorPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+250..."
                      value={guarantorPhone}
                      onChange={(e) => setGuarantorPhone(e.target.value)}
                    />
                    {errors.guarantorPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.guarantorPhone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Loan Summary */}
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Loan Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Loan Amount</p>
                    <p className="text-sm font-medium text-gray-900">
                      {loanAmount ? formatCurrency(Number(loanAmount), selectedGroup?.currency) : 'N/A'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Interest Rate</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedGroup?.interestRate}% per annum
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Repayment Period</p>
                    <p className="text-sm font-medium text-gray-900">
                      {repaymentPeriod} {repaymentPeriod === 1 ? 'month' : 'months'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Monthly Payment</p>
                    <p className="text-sm font-medium text-gray-900">
                      {calculateMonthlyPayment()}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">Total Repayment</p>
                      <p className="text-sm font-medium text-gray-900">
                        {calculateTotalRepayment()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions Notice */}
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        By submitting this request, you agree to the loan terms and conditions of your group.
                        Your request will be reviewed by the group managers before approval.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting || !selectedGroupId}
            >
              {submitting ? 'Submitting...' : 'Submit Loan Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoanRequestForm; 