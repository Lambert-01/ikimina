import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { makeContribution, getPaymentMethods } from '../../services/paymentService';
import type { PaymentMethod } from '../../services/paymentService';
import type { Group } from '../../services/groupService';

interface ContributionFormProps {
  group: Group;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ContributionForm: React.FC<ContributionFormProps> = ({
  group, 
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const [amount, setAmount] = useState<number>(group.contributionSettings?.amount || 0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [reference, setReference] = useState<string>('');

  // Fetch payment methods on mount
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await getPaymentMethods();
        if (response.success) {
          setPaymentMethods(response.data || []);
        
          // Auto-select primary payment method if available
          const primaryMethod = response.data?.find((method: PaymentMethod) => method.isPrimary);
          if (primaryMethod) {
            setSelectedPaymentMethod(primaryMethod._id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      }
    };
    
    fetchPaymentMethods();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the selected payment method details
      const method = paymentMethods.find(m => m._id === selectedPaymentMethod);
      
      const response = await makeContribution({
        groupId: group._id,
        amount,
        paymentMethod: method?.provider || 'unknown',
        reference
      });
      
      if (response.success) {
      setSuccess(true);
      
        // Call onSuccess callback if provided
      if (onSuccess) {
          setTimeout(() => {
        onSuccess();
          }, 2000);
        } else {
          // Navigate to contributions page after a delay
          setTimeout(() => {
            navigate('/member/contributions');
          }, 2000);
        }
      } else {
        setError(response.message || 'Payment failed');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred while processing your payment');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <Check className="mr-2 h-5 w-5" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            Your contribution of {new Intl.NumberFormat('rw-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0
            }).format(amount)} to {group.name} has been received.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate('/member/contributions')}>
            View Contributions
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Make Contribution</CardTitle>
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
            <Input
              id="group"
              value={group.name}
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (RWF)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
            <p className="text-xs text-gray-500">
              Suggested contribution: {new Intl.NumberFormat('rw-RW', {
                style: 'currency',
                currency: 'RWF',
                minimumFractionDigits: 0
              }).format(group.contributionSettings?.amount || 0)}
                  </p>
                </div>

          <div className="space-y-3">
            <Label>Payment Method</Label>
            
            {paymentMethods.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700">
                  You don't have any payment methods set up yet.
                </p>
                <Button
                  variant="link" 
                  className="text-blue-700 p-0 h-auto text-sm"
                  onClick={() => navigate('/member/settings')}
                >
                  Add a payment method
                </Button>
              </div>
            ) : (
              <RadioGroup 
                value={selectedPaymentMethod} 
                onValueChange={setSelectedPaymentMethod}
              >
                {paymentMethods.map((method) => (
                  <div key={method._id} className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value={method._id} id={method._id} />
                    <Label htmlFor={method._id} className="flex items-center cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="font-medium">{method.provider}</p>
                        <p className="text-sm text-gray-500">{method.accountNumber}</p>
            </div>
                      {method.isPrimary && (
                        <span className="ml-auto text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
              </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              placeholder="e.g., June Contribution"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
                  </div>
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
            disabled={isLoading || paymentMethods.length === 0}
                >
            {isLoading ? 'Processing...' : 'Make Payment'}
                </Button>
        </CardFooter>
        </form>
    </Card>
  );
};

export default ContributionForm; 