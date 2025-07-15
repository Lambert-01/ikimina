import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { ReportFormat, DateRange } from '../../../components/reports/ReportExportOptions';
import ReportExportOptions from '../../../components/reports/ReportExportOptions';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChartIcon, BarChartIcon, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

interface GroupSummary {
  totalMembers: number;
  activeMembers: number;
  totalContributions: number;
  totalLoans: number;
  activeLoanAmount: number;
  repaymentRate: number;
  fundBalance: number;
}

interface MemberContribution {
  id: string;
  name: string;
  phone: string;
  totalContributed: number;
  expectedContribution: number;
  contributionRate: number;
  lastContribution: string;
  status: 'up_to_date' | 'behind' | 'overdue';
}

interface LoanSummary {
  id: string;
  borrower: string;
  amount: number;
  disbursementDate: string;
  dueDate: string;
  amountRepaid: number;
  status: 'current' | 'overdue' | 'completed';
  repaymentRate: number;
}

interface MonthlyData {
  month: string;
  contributions: number;
  loans: number;
  repayments: number;
}

const ManagerReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [groupSummary, setGroupSummary] = useState<GroupSummary | null>(null);
  const [memberContributions, setMemberContributions] = useState<MemberContribution[]>([]);
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  
  // Colors for charts
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock group summary data
        const mockGroupSummary: GroupSummary = {
          totalMembers: 25,
          activeMembers: 23,
          totalContributions: 2500000,
          totalLoans: 1500000,
          activeLoanAmount: 850000,
          repaymentRate: 92,
          fundBalance: 1650000
        };
        
        // Mock member contributions data
        const mockMemberContributions: MemberContribution[] = [
          {
            id: 'm1',
            name: 'Jean Mutoni',
            phone: '+250781234567',
            totalContributed: 120000,
            expectedContribution: 120000,
            contributionRate: 100,
            lastContribution: '2023-05-05',
            status: 'up_to_date'
          },
          {
            id: 'm2',
            name: 'Emmanuel Kwizera',
            phone: '+250782345678',
            totalContributed: 100000,
            expectedContribution: 120000,
            contributionRate: 83,
            lastContribution: '2023-04-10',
            status: 'behind'
          },
          {
            id: 'm3',
            name: 'Alice Uwimana',
            phone: '+250783456789',
            totalContributed: 80000,
            expectedContribution: 120000,
            contributionRate: 67,
            lastContribution: '2023-03-15',
            status: 'overdue'
          },
          {
            id: 'm4',
            name: 'Patrick Niyomwungeri',
            phone: '+250784567890',
            totalContributed: 120000,
            expectedContribution: 120000,
            contributionRate: 100,
            lastContribution: '2023-05-03',
            status: 'up_to_date'
          },
          {
            id: 'm5',
            name: 'Grace Mukeshimana',
            phone: '+250785678901',
            totalContributed: 120000,
            expectedContribution: 120000,
            contributionRate: 100,
            lastContribution: '2023-05-04',
            status: 'up_to_date'
          }
        ];
        
        // Mock loans data
        const mockLoans: LoanSummary[] = [
          {
            id: 'l1',
            borrower: 'Jean Mutoni',
            amount: 100000,
            disbursementDate: '2023-03-15',
            dueDate: '2023-09-15',
            amountRepaid: 50000,
            status: 'current',
            repaymentRate: 50
          },
          {
            id: 'l2',
            borrower: 'Emmanuel Kwizera',
            amount: 150000,
            disbursementDate: '2023-02-10',
            dueDate: '2023-08-10',
            amountRepaid: 100000,
            status: 'current',
            repaymentRate: 67
          },
          {
            id: 'l3',
            borrower: 'Alice Uwimana',
            amount: 80000,
            disbursementDate: '2023-01-20',
            dueDate: '2023-04-20',
            amountRepaid: 40000,
            status: 'overdue',
            repaymentRate: 50
          }
        ];
        
        // Mock monthly data
        const mockMonthlyData: MonthlyData[] = [
          { month: 'Jan', contributions: 300000, loans: 200000, repayments: 50000 },
          { month: 'Feb', contributions: 350000, loans: 100000, repayments: 80000 },
          { month: 'Mar', contributions: 400000, loans: 250000, repayments: 100000 },
          { month: 'Apr', contributions: 450000, loans: 0, repayments: 120000 },
          { month: 'May', contributions: 500000, loans: 0, repayments: 150000 },
          { month: 'Jun', contributions: 500000, loans: 0, repayments: 150000 }
        ];
        
        setGroupSummary(mockGroupSummary);
        setMemberContributions(mockMemberContributions);
        setLoans(mockLoans);
        setMonthlyData(mockMonthlyData);
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
      
      toast.success(`${activeTab === 'overview' ? 'Group overview' : activeTab === 'contributions' ? 'Member contributions' : 'Loan'} report exported as ${format.toUpperCase()}`);
      
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

  // Calculate contribution status statistics
  const getContributionStatusStats = () => {
    const stats = {
      up_to_date: 0,
      behind: 0,
      overdue: 0
    };
    
    memberContributions.forEach(member => {
      stats[member.status]++;
    });
    
    return Object.entries(stats).map(([status, count]) => ({
      status: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count
    }));
  };

  // Calculate loan status statistics
  const getLoanStatusStats = () => {
    const stats = {
      current: 0,
      overdue: 0,
      completed: 0
    };
    
    loans.forEach(loan => {
      stats[loan.status]++;
    });
    
    return Object.entries(stats).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">Group Reports</h1>
          <p className="text-gray-600">Financial overview and member performance</p>
        </div>
        <div className="mt-4 md:mt-0">
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="all">All Groups</option>
            <option value="g1">Community Savings Group</option>
            <option value="g2">Women Entrepreneurs</option>
          </select>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Group Overview</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="contributions" className="flex items-center">
            <BarChartIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Member Contributions</span>
            <span className="sm:hidden">Contributions</span>
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Loan Status</span>
            <span className="sm:hidden">Loans</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Group Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Total Members</p>
                  <p className="text-xl font-semibold">{groupSummary?.totalMembers || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {groupSummary?.activeMembers || 0} active members
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Total Contributions</p>
                  <p className="text-xl font-semibold">{formatCurrency(groupSummary?.totalContributions || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lifetime contributions
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Active Loans</p>
                  <p className="text-xl font-semibold">{formatCurrency(groupSummary?.activeLoanAmount || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {groupSummary?.repaymentRate || 0}% repayment rate
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Fund Balance</p>
                  <p className="text-xl font-semibold">{formatCurrency(groupSummary?.fundBalance || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Available for loans
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Activity Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Monthly Financial Activity</CardTitle>
              <CardDescription>
                Group contributions, loans, and repayments over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
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
                    <Bar dataKey="contributions" name="Contributions" fill="#4f46e5" />
                    <Bar dataKey="loans" name="Loans Disbursed" fill="#f59e0b" />
                    <Bar dataKey="repayments" name="Loan Repayments" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Status Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Contribution Status</CardTitle>
                <CardDescription>
                  Member contribution status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getContributionStatusStats()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getContributionStatusStats().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, 'Members']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Loan Status</CardTitle>
                <CardDescription>
                  Loan status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getLoanStatusStats()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getLoanStatusStats().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, 'Loans']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Export Options */}
          <ReportExportOptions
            title="Export Group Overview Report"
            description="Download comprehensive financial report"
            onExport={handleExportReport}
            supportedFormats={['pdf', 'csv', 'excel']}
            isLoading={exportLoading}
          />
        </TabsContent>
        
        {/* Contributions Tab */}
        <TabsContent value="contributions" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Member Contribution Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of each member's contribution history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Contributed
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expected
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Contribution
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memberContributions.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(member.totalContributed)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(member.expectedContribution)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.contributionRate}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(member.lastContribution)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${member.status === 'up_to_date' ? 'bg-green-100 text-green-800' : 
                              member.status === 'behind' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {member.status === 'up_to_date' ? 'Up to Date' : 
                              member.status === 'behind' ? 'Behind' : 'Overdue'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Export Options */}
          <ReportExportOptions
            title="Export Member Contributions Report"
            description="Download detailed contribution report"
            onExport={handleExportReport}
            supportedFormats={['pdf', 'csv', 'excel']}
            isLoading={exportLoading}
          />
        </TabsContent>
        
        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Loan Status Report</CardTitle>
              <CardDescription>
                Detailed breakdown of all loans and their repayment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Borrower
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disbursement Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Repaid
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loans.map((loan) => (
                      <tr key={loan.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{loan.borrower}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(loan.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(loan.disbursementDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(loan.dueDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(loan.amountRepaid)} ({loan.repaymentRate}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${loan.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              loan.status === 'current' ? 'bg-blue-100 text-blue-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Export Options */}
          <ReportExportOptions
            title="Export Loan Report"
            description="Download detailed loan status report"
            onExport={handleExportReport}
            supportedFormats={['pdf', 'csv', 'excel']}
            isLoading={exportLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerReportsPage; 