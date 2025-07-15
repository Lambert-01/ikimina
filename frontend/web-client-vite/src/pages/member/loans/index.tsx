import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import LoanRequestCTA from '../../../components/loans/LoanRequestCTA';
import LoanRequestForm from '../../../components/loans/LoanRequestForm';
import ActiveLoanCard from '../../../components/loans/ActiveLoanCard';
import { Plus, History, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

interface Loan {
  id: string;
  amount: number;
  currency: string;
  disbursementDate: string;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  totalPaid: number;
  totalRemaining: number;
  repaymentProgress: number;
  status: 'current' | 'overdue' | 'grace';
  daysOverdue?: number;
  groupId: string;
  groupName: string;
}

interface LoanHistory {
  id: string;
  amount: number;
  currency: string;
  disbursementDate: string;
  completionDate: string;
  status: 'completed' | 'denied' | 'cancelled';
  groupName: string;
}

const LoanRequestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active-loans');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [loanHistory, setLoanHistory] = useState<LoanHistory[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if there's a group ID in the URL params
        const groupId = searchParams.get('group');
        if (groupId) {
          setSelectedGroupId(groupId);
        }
        
        // Mock active loans data
        const mockActiveLoans: Loan[] = [
          {
            id: 'loan1',
            amount: 50000,
            currency: 'RWF',
            disbursementDate: '2023-04-15',
            nextPaymentDate: '2023-06-15',
            nextPaymentAmount: 4500,
            totalPaid: 9000,
            totalRemaining: 45500,
            repaymentProgress: 16,
            status: 'current',
            groupId: 'g1',
            groupName: 'Community Savings Group'
          }
        ];
        
        // Mock loan history data
        const mockLoanHistory: LoanHistory[] = [
          {
            id: 'hist1',
            amount: 30000,
            currency: 'RWF',
            disbursementDate: '2022-10-01',
            completionDate: '2023-03-01',
            status: 'completed',
            groupName: 'Community Savings Group'
          },
          {
            id: 'hist2',
            amount: 15000,
            currency: 'RWF',
            disbursementDate: '2022-05-15',
            completionDate: '2022-08-15',
            status: 'completed',
            groupName: 'Women Entrepreneurs'
          },
          {
            id: 'hist3',
            amount: 25000,
            currency: 'RWF',
            disbursementDate: '',
            completionDate: '2022-04-10',
            status: 'denied',
            groupName: 'Community Savings Group'
          }
        ];
        
        setActiveLoans(mockActiveLoans);
        setLoanHistory(mockLoanHistory);
        
        // If there are no active loans, default to the request tab
        if (mockActiveLoans.length === 0) {
          setActiveTab('request-loan');
        }
      } catch (error) {
        console.error('Error fetching loan data:', error);
        toast.error('Failed to load loan data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams]);

  const handleRequestLoan = () => {
    setShowRequestForm(true);
    setActiveTab('request-loan');
  };

  const handleMakePayment = (loanId: string) => {
    toast.info(`Navigating to payment for loan ${loanId}`);
    // In a real app, this would navigate to the payment page
  };

  const handleViewLoanDetails = (loanId: string) => {
    toast.info(`Viewing details for loan ${loanId}`);
    // In a real app, this would navigate to the loan details page
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full">
        {/* Skeleton loading state */}
        <div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
          <div className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600">Manage your loans and make new requests</p>
        </div>
        <div className="mt-4 md:mt-0">
          {activeLoans.length === 0 && (
            <Button className="flex items-center" onClick={handleRequestLoan}>
              <Plus className="h-4 w-4 mr-2" />
              Request a Loan
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="active-loans" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Active Loans</span>
            <span className="sm:hidden">Active</span>
          </TabsTrigger>
          <TabsTrigger value="request-loan" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Request Loan</span>
            <span className="sm:hidden">Request</span>
          </TabsTrigger>
          <TabsTrigger value="loan-history" className="flex items-center">
            <History className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Loan History</span>
            <span className="sm:hidden">History</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Active Loans Tab */}
        <TabsContent value="active-loans" className="space-y-4">
          {activeLoans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeLoans.map(loan => (
                <ActiveLoanCard
                  key={loan.id}
                  id={loan.id}
                  amount={loan.amount}
                  currency={loan.currency}
                  disbursementDate={loan.disbursementDate}
                  nextPaymentDate={loan.nextPaymentDate}
                  nextPaymentAmount={loan.nextPaymentAmount}
                  totalPaid={loan.totalPaid}
                  totalRemaining={loan.totalRemaining}
                  repaymentProgress={loan.repaymentProgress}
                  status={loan.status}
                  daysOverdue={loan.daysOverdue}
                  groupName={loan.groupName}
                  onMakePayment={() => handleMakePayment(loan.id)}
                  onViewDetails={() => handleViewLoanDetails(loan.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <CreditCard className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No active loans</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any active loans at the moment
              </p>
              <div className="mt-6">
                <Button onClick={handleRequestLoan}>
                  Request a Loan
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Request Loan Tab */}
        <TabsContent value="request-loan" className="space-y-4">
          {showRequestForm ? (
            <LoanRequestForm
              groupId={selectedGroupId || undefined}
              onSuccess={() => {
                setShowRequestForm(false);
                setActiveTab('active-loans');
              }}
              onCancel={() => setShowRequestForm(false)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LoanRequestCTA
                groupName="your savings group"
                maxLoanAmount={100000}
                onRequestLoan={handleRequestLoan}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Loan Eligibility</CardTitle>
                  <CardDescription>
                    Information about your loan eligibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-green-800">You are eligible for loans</h3>
                      <p className="mt-1 text-sm text-green-700">
                        Based on your contribution history and group policies, you can request a loan.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Maximum Loan Amount</span>
                        <span className="text-sm font-medium">RWF 100,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Interest Rate</span>
                        <span className="text-sm font-medium">5% per annum</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Maximum Repayment Period</span>
                        <span className="text-sm font-medium">12 months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Guarantor Required</span>
                        <span className="text-sm font-medium">Yes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Loan History Tab */}
        <TabsContent value="loan-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loan History</CardTitle>
              <CardDescription>
                Your past loans and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loanHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Group
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Disbursement Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completion Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loanHistory.map((loan) => (
                        <tr key={loan.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{loan.groupName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(loan.amount, loan.currency)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(loan.disbursementDate)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(loan.completionDate)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${loan.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                loan.status === 'denied' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No loan history available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanRequestPage; 