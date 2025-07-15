import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { PaymentProvider } from './PaymentMethodSelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import ContributionConfirmation from './ContributionConfirmation';

interface Group {
  id: string;
  name: string;
  contributionAmount: number;
  contributionFrequency: string;
  contributionDeadline: number;
  currency: string;
}

interface ContributionCycle {
  id: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  status: 'upcoming' | 'active' | 'overdue' | 'completed';
  amountDue: number;
  isPaid: boolean;
}

interface ContributionFormProps {
  groupId?: string;
  onSuccess?: () => void;
  isOverdue?: boolean;
}

const ContributionForm: React.FC<ContributionFormProps> = ({
  groupId: initialGroupId,
  onSuccess,
  isOverdue = false
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [cycles, setCycles] = useState<ContributionCycle[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || '');
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('MTN');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');

  // Load groups and contribution cycles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, these would be API calls
        // For demo purposes, we'll simulate data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock groups data
        const mockGroups: Group[] = [
          {
            id: 'g1',
            name: 'Community Savings Group',
            contributionAmount: 5000,
            contributionFrequency: 'monthly',
            contributionDeadline: 5,
            currency: 'RWF'
          },
          {
            id: 'g2',
            name: 'Women Entrepreneurs',
            contributionAmount: 10000,
            contributionFrequency: 'biweekly',
            contributionDeadline: 3,
            currency: 'RWF'
          }
        ];
        
        setGroups(mockGroups);
        
        // If initial group ID is provided, set it as selected
        if (initialGroupId) {
          setSelectedGroupId(initialGroupId);
          
          // Load cycles for the selected group
          await loadCycles(initialGroupId);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load groups data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [initialGroupId]);

  // Load cycles when group selection changes
  const loadCycles = async (groupId: string) => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the selected group
      const selectedGroup = groups.find(g => g.id === groupId);
      
      if (!selectedGroup) {
        throw new Error('Selected group not found');
      }
      
      // Create mock cycles based on the group
      const today = new Date();
      const mockCycles: ContributionCycle[] = [
        {
          id: 'c1',
          cycleNumber: 1,
          startDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
          endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
          dueDate: new Date(today.getFullYear(), today.getMonth(), selectedGroup.contributionDeadline).toISOString(),
          status: 'active',
          amountDue: selectedGroup.contributionAmount,
          isPaid: false
        }
      ];
      
      // Add an overdue cycle if isOverdue is true
      if (isOverdue) {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        mockCycles.unshift({
          id: 'c0',
          cycleNumber: 0,
          startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString(),
          endDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString(),
          dueDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), selectedGroup.contributionDeadline).toISOString(),
          status: 'overdue',
          amountDue: selectedGroup.contributionAmount,
          isPaid: false
        });
      }
      
      setCycles(mockCycles);
      
      // Select the first cycle by default
      if (mockCycles.length > 0) {
        setSelectedCycleId(mockCycles[0].id);
        setAmount(mockCycles[0].amountDue);
      }
    } catch (error) {
      console.error('Error loading cycles:', error);
      toast.error('Failed to load contribution cycles');
    } finally {
      setLoading(false);
    }
  };

  // Handle group selection change
  const handleGroupChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    setSelectedCycleId('');
    setAmount(0);
    
    if (groupId) {
      await loadCycles(groupId);
    } else {
      setCycles([]);
    }
  };

  // Handle cycle selection change
  const handleCycleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cycleId = e.target.value;
    setSelectedCycleId(cycleId);
    
    // Update amount based on the selected cycle
    const cycle = cycles.find(c => c.id === cycleId);
    if (cycle) {
      setAmount(cycle.amountDue);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!selectedGroupId) {
        newErrors.group = 'Please select a group';
      }
      
      if (!selectedCycleId) {
        newErrors.cycle = 'Please select a contribution cycle';
      }
    } else if (step === 2) {
      if (!phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^\+?[0-9]{10,15}$/.test(phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateForm()) {
      setStep(step + 1);
    }
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
      
      // Generate a mock transaction ID
      const mockTransactionId = `TX${Date.now().toString().slice(-8)}`;
      setTransactionId(mockTransactionId);
      
      setSuccess(true);
      toast.success('Contribution payment initiated successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast.error('Failed to process contribution payment');
    } finally {
      setSubmitting(false);
    }
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

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get selected group
  const getSelectedGroup = (): Group | undefined => {
    return groups.find(g => g.id === selectedGroupId);
  };

  // Get selected cycle
  const getSelectedCycle = (): ContributionCycle | undefined => {
    return cycles.find(c => c.id === selectedCycleId);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render success state
  if (success) {
    const selectedGroup = getSelectedGroup();
    const selectedCycle = getSelectedCycle();
    const cyclePeriod = selectedCycle ? 
      `Cycle ${selectedCycle.cycleNumber} (${formatDate(selectedCycle.startDate)} - ${formatDate(selectedCycle.endDate)})` : 
      undefined;
    
    return (
      <ContributionConfirmation
        transactionId={transactionId}
        amount={amount}
        currency={selectedGroup?.currency}
        phoneNumber={phoneNumber}
        paymentMethod={paymentMethod === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money'}
        groupName={selectedGroup?.name || ''}
        cyclePeriod={cyclePeriod}
        onMakeAnother={() => {
          setSuccess(false);
          setStep(1);
          setPhoneNumber('');
          setTransactionId('');
        }}
        onViewHistory={() => {
          // In a real app, this would navigate to the contribution history page
          toast.info('Navigating to contribution history...');
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make Contribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <div className="flex">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className="mx-2 border-t border-gray-300 w-8 self-center"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className="mx-2 border-t border-gray-300 w-8 self-center"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step {step} of 3
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Select Group and Cycle */}
          {step === 1 && (
            <div className="space-y-4">
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

              {/* Cycle Selection */}
              {selectedGroupId && (
                <div>
                  <label htmlFor="cycle" className="block text-sm font-medium text-gray-700 mb-1">
                    Contribution Cycle *
                  </label>
                  <select
                    id="cycle"
                    name="cycle"
                    className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.cycle ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={selectedCycleId}
                    onChange={handleCycleChange}
                  >
                    <option value="">Select a cycle</option>
                    {cycles.map(cycle => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.status === 'overdue' ? '⚠️ ' : ''}
                        Cycle {cycle.cycleNumber} ({formatDate(cycle.startDate)} - {formatDate(cycle.endDate)})
                        {cycle.status === 'overdue' ? ' - Overdue' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.cycle && (
                    <p className="mt-1 text-sm text-red-600">{errors.cycle}</p>
                  )}
                </div>
              )}

              {/* Contribution Details */}
              {selectedCycleId && (
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Contribution Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Group</p>
                      <p className="text-sm font-medium text-gray-900">{getSelectedGroup()?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount Due</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(amount, getSelectedGroup()?.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getSelectedCycle()?.dueDate ? formatDate(getSelectedCycle()!.dueDate) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`text-sm font-medium ${
                        getSelectedCycle()?.status === 'overdue' ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {getSelectedCycle()?.status.charAt(0).toUpperCase() + getSelectedCycle()?.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Overdue Warning */}
              {selectedCycleId && getSelectedCycle()?.status === 'overdue' && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Overdue Contribution</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          This contribution is past its due date. Please make the payment as soon as possible
                          to avoid any penalties.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!selectedGroupId || !selectedCycleId}
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
              
              <div className="space-y-4">
                {/* Payment Provider Selection */}
                <PaymentMethodSelector 
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                  availableMethods={['MTN', 'AIRTEL']}
                />

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+250..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the phone number linked to your {paymentMethod === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money'} account
                  </p>
                </div>

                {/* Payment Summary */}
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">Contribution Amount</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(amount, getSelectedGroup()?.currency)}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">Transaction Fee</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(0, getSelectedGroup()?.currency)}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">Total</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(amount, getSelectedGroup()?.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!phoneNumber}
                >
                  Review Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Payment</h3>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Payment Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Group</p>
                    <p className="text-sm font-medium text-gray-900">{getSelectedGroup()?.name}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Contribution Cycle</p>
                    <p className="text-sm font-medium text-gray-900">
                      Cycle {getSelectedCycle()?.cycleNumber} ({getSelectedCycle() && formatDate(getSelectedCycle()!.startDate)} - {getSelectedCycle() && formatDate(getSelectedCycle()!.endDate)})
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(amount, getSelectedGroup()?.currency)}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900">
                      {paymentMethod === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900">{phoneNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Payment Information</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        You will receive a prompt on your phone to complete the payment.
                        Please follow the instructions to authorize the transaction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ContributionForm; 