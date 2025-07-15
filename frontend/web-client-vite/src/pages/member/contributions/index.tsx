import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import ContributionForm from '../../../components/payments/ContributionForm';
import PaymentMethodSelector from '../../../components/payments/PaymentMethodSelector';
import type { PaymentProvider } from '../../../components/payments/PaymentMethodSelector';
import ContributionConfirmation from '../../../components/payments/ContributionConfirmation';
import OverdueContributionAlert from '../../../components/payments/OverdueContributionAlert';
import { Plus, Calendar, AlertTriangle, CreditCard } from 'lucide-react';

const ContributionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('make-contribution');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentProvider>('MTN');
  
  // Mock data for overdue contributions
  const overdueContributions = [
    {
      id: 'oc1',
      groupId: 'g1',
      groupName: 'Community Savings Group',
      amount: 5000,
      currency: 'RWF',
      dueDate: '2023-05-05',
      daysOverdue: 7,
      penalties: 500
    },
    {
      id: 'oc2',
      groupId: 'g2',
      groupName: 'Women Entrepreneurs',
      amount: 10000,
      currency: 'RWF',
      dueDate: '2023-05-03',
      daysOverdue: 9
    }
  ];
  
  // Handle contribution payment
  const handleContribute = (contributionId: string, groupId: string) => {
    console.log(`Pay contribution ${contributionId} for group ${groupId}`);
    setActiveTab('make-contribution');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
          <p className="text-gray-600">Manage your group contributions and payments</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Make Contribution
          </Button>
        </div>
      </div>
      
      {/* Overdue Contributions Alert */}
      <OverdueContributionAlert 
        overdueContributions={overdueContributions}
        onContribute={handleContribute}
      />
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="make-contribution" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Make Contribution</span>
            <span className="sm:hidden">Contribute</span>
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Payment Methods</span>
            <span className="sm:hidden">Methods</span>
          </TabsTrigger>
          <TabsTrigger value="confirmation-demo" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Confirmation Demo</span>
            <span className="sm:hidden">Demo</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Make Contribution Tab */}
        <TabsContent value="make-contribution" className="space-y-4">
          <ContributionForm />
        </TabsContent>
        
        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Select your preferred payment method for contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <PaymentMethodSelector 
                  selectedMethod={selectedPaymentMethod}
                  onMethodChange={setSelectedPaymentMethod}
                  availableMethods={['MTN', 'AIRTEL', 'BANK', 'CARD']}
                />
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Selected Payment Method</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm">
                      You selected: <span className="font-medium">{selectedPaymentMethod}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      In a real application, this would be saved as your default payment method.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Confirmation Demo Tab */}
        <TabsContent value="confirmation-demo" className="space-y-4">
          <ContributionConfirmation
            transactionId="TX12345678"
            amount={15000}
            currency="RWF"
            phoneNumber="+250781234567"
            paymentMethod="MTN Mobile Money"
            groupName="Community Savings Group"
            cyclePeriod="Cycle 1 (May 1, 2023 - May 31, 2023)"
            onMakeAnother={() => setActiveTab('make-contribution')}
            onViewHistory={() => console.log('View history clicked')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContributionsPage; 