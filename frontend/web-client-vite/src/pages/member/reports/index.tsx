import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { ReportFormat, DateRange } from '../../../components/reports/ReportExportOptions';
import ReportExportOptions from '../../../components/reports/ReportExportOptions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import { toast } from 'react-toastify';

interface ContributionData {
  month: string;
  amount: number;
  expected: number;
}

interface LoanData {
  month: string;
  borrowed: number;
  repaid: number;
}

interface SavingsSummary {
  totalContributed: number;
  expectedContribution: number;
  contributionRate: number;
  lastContribution: string;
  nextDueDate: string;
}

interface LoanSummary {
  totalBorrowed: number;
  totalRepaid: number;
  activeLoanAmount: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
}

const MemberReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contributions');
  const [contributionData, setContributionData] = useState<ContributionData[]>([]);
  const [loanData, setLoanData] = useState<LoanData[]>([]);
  const [savingsSummary, setSavingsSummary] = useState<SavingsSummary | null>(null);
  const [loanSummary, setLoanSummary] = useState<LoanSummary | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock contribution data
        const mockContributionData: ContributionData[] = [
          { month: 'Jan', amount: 15000, expected: 15000 },
          { month: 'Feb', amount: 15000, expected: 15000 },
          { month: 'Mar', amount: 15000, expected: 15000 },
          { month: 'Apr', amount: 20000, expected: 20000 },
          { month: 'May', amount: 20000, expected: 20000 },
          { month: 'Jun', amount: 0, expected: 20000 }
        ];
        
        // Mock loan data
        const mockLoanData: LoanData[] = [
          { month: 'Jan', borrowed: 0, repaid: 0 },
          { month: 'Feb', borrowed: 0, repaid: 0 },
          { month: 'Mar', borrowed: 50000, repaid: 0 },
          { month: 'Apr', borrowed: 0, repaid: 10000 },
          { month: 'May', borrowed: 0, repaid: 10000 },
          { month: 'Jun', borrowed: 0, repaid: 0 }
        ];
        
        // Mock savings summary
        const mockSavingsSummary: SavingsSummary = {
          totalContributed: 85000,
          expectedContribution: 105000,
          contributionRate: 81,
          lastContribution: '2023-05-01',
          nextDueDate: '2023-06-15'
        };
        
        // Mock loan summary
        const mockLoanSummary: LoanSummary = {
          totalBorrowed: 50000,
          totalRepaid: 20000,
          activeLoanAmount: 30000,
          nextPaymentDate: '2023-06-15',
          nextPaymentAmount: 10000
        };
        
        setContributionData(mockContributionData);
        setLoanData(mockLoanData);
        setSavingsSummary(mockSavingsSummary);
        setLoanSummary(mockLoanSummary);
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
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

  // Handle report export
  const handleExportReport = async (
    format: ReportFormat,
    dateRange: DateRange,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      setExportLoading(true);
      
      // In a real app, this would call the API to generate and download the report
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${activeTab === 'contributions' ? 'Contribution' : 'Loan'} report exported as ${format.toUpperCase()}`);
      
      // In a real app, this would trigger a file download
      console.log(`Exporting ${activeTab} report in ${format} format for date range: ${dateRange}`);
      if (dateRange === 'custom') {
        console.log(`Custom date range: ${startDate} to ${endDate}`);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setExportLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">View and export your financial reports</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="contributions" className="flex items-center">
            <BarChartIcon className="h-4 w-4 mr-2" />
            <span>Contributions</span>
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2" />
            <span>Loans</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Contributions Tab */}
        <TabsContent value="contributions" className="space-y-6">
          {/* Contribution Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Total Contributed</p>
                  <p className="text-xl font-semibold">{formatCurrency(savingsSummary?.totalContributed || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {savingsSummary?.contributionRate || 0}% of expected
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Last Contribution</p>
                  <p className="text-xl font-semibold">{formatDate(savingsSummary?.lastContribution || '')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Regular monthly contribution
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Next Due Date</p>
                  <p className="text-xl font-semibold">{formatDate(savingsSummary?.nextDueDate || '')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Mark your calendar
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contribution Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>
                Your contribution history over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contributionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('RWF', '')}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                    />
                    <Legend />
                    <Bar dataKey="amount" name="Contributed" fill="#4f46e5" />
                    <Bar dataKey="expected" name="Expected" fill="#c7d2fe" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Detailed Contribution Report</CardTitle>
                  <CardDescription>
                    View detailed information about your contributions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expected
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contributed
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contributionData.map((month, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{month.month}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatCurrency(month.expected)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatCurrency(month.amount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${month.amount >= month.expected ? 'bg-green-100 text-green-800' : 
                                  month.amount > 0 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {month.amount >= month.expected ? 'Completed' : 
                                  month.amount > 0 ? 'Partial' : 'Missed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <ReportExportOptions
                title="Export Contribution Report"
                description="Download your contribution history"
                onExport={handleExportReport}
                supportedFormats={['pdf', 'csv', 'excel']}
                isLoading={exportLoading}
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          {/* Loan Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Total Borrowed</p>
                  <p className="text-xl font-semibold">{formatCurrency(loanSummary?.totalBorrowed || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lifetime total
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Active Loan</p>
                  <p className="text-xl font-semibold">{formatCurrency(loanSummary?.activeLoanAmount || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Current outstanding amount
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Next Payment</p>
                  <p className="text-xl font-semibold">{formatCurrency(loanSummary?.nextPaymentAmount || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Due on {formatDate(loanSummary?.nextPaymentDate || '')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Loan Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Loan Activity</CardTitle>
              <CardDescription>
                Your loan borrowing and repayment history over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={loanData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('RWF', '')}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                    />
                    <Legend />
                    <Bar dataKey="borrowed" name="Borrowed" fill="#4f46e5" />
                    <Bar dataKey="repaid" name="Repaid" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Loan History</CardTitle>
                  <CardDescription>
                    View detailed information about your loans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Borrowed
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Repaid
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loanData.map((month, index) => {
                          // Calculate running balance
                          const previousMonths = loanData.slice(0, index + 1);
                          const totalBorrowed = previousMonths.reduce((sum, m) => sum + m.borrowed, 0);
                          const totalRepaid = previousMonths.reduce((sum, m) => sum + m.repaid, 0);
                          const balance = totalBorrowed - totalRepaid;
                          
                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{month.month}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {month.borrowed > 0 ? formatCurrency(month.borrowed) : '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {month.repaid > 0 ? formatCurrency(month.repaid) : '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatCurrency(balance)}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <ReportExportOptions
                title="Export Loan Report"
                description="Download your loan history"
                onExport={handleExportReport}
                supportedFormats={['pdf', 'csv', 'excel']}
                isLoading={exportLoading}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberReportsPage; 