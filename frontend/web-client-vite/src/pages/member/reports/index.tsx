import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Download, FileText, PieChart, BarChart, Calendar, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { getMyGroups } from '../../../services/groupService';
import { getMyLoans } from '../../../services/loanService';
import { getContributionHistory, getContributionSummary } from '../../../services/paymentService';
import type { Group } from '../../../services/groupService';
import type { Loan } from '../../../services/loanService';
import type { Transaction } from '../../../services/paymentService';

const MemberReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('contributions');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Data states
  const [groups, setGroups] = useState<Group[]>([]);
  const [contributions, setContributions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [contributionSummary, setContributionSummary] = useState<any>(null);
  
  // Filter states
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);
  
    const fetchData = async () => {
      try {
      setIsLoading(true);
      
      // Fetch user's groups
      const groupsResponse = await getMyGroups();
      if (groupsResponse.success) {
        setGroups([...groupsResponse.data.memberGroups, ...groupsResponse.data.managedGroups]);
      }
      
      // Fetch contribution history
      const contributionsResponse = await getContributionHistory();
      if (contributionsResponse.success) {
        setContributions(contributionsResponse.data.data || []);
      }
      
      // Fetch contribution summary
      const summaryResponse = await getContributionSummary();
      if (summaryResponse.success) {
        setContributionSummary(summaryResponse.data.data || null);
      }
      
      // Fetch loans
      const loansResponse = await getMyLoans();
      if (loansResponse.success) {
        setLoans(loansResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = async () => {
    try {
      setIsLoading(true);
      
      const params: any = {};
      if (groupFilter) params.groupId = groupFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      // Fetch filtered contribution history
      const contributionsResponse = await getContributionHistory(params);
      if (contributionsResponse.success) {
        setContributions(contributionsResponse.data.data || []);
      }
      
      // Fetch filtered loans
      if (groupFilter) {
        const loansResponse = await getMyLoans({ groupId: groupFilter });
        if (loansResponse.success) {
          setLoans(loansResponse.data || []);
        }
      } else {
        const loansResponse = await getMyLoans();
        if (loansResponse.success) {
          setLoans(loansResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to filter report data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearFilters = () => {
    setGroupFilter('');
    setStartDate('');
    setEndDate('');
    fetchData();
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
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

  // Calculate total contributions
  const totalContributions = contributions.reduce((sum, transaction) => {
    if (transaction.type === 'contribution' && transaction.status === 'completed') {
      return sum + transaction.amount;
    }
    return sum;
  }, 0);
  
  // Calculate total loans
  const totalLoans = loans.reduce((sum, loan) => {
    if (['approved', 'active', 'repaid'].includes(loan.status)) {
      return sum + loan.amount;
    }
    return sum;
  }, 0);
  
  // Calculate total repayments
  const totalRepayments = loans.reduce((sum, loan) => {
    if (['approved', 'active', 'repaid'].includes(loan.status)) {
      return sum + loan.repaidAmount;
    }
    return sum;
  }, 0);
  
  // Calculate outstanding loans
  const outstandingLoans = loans.reduce((sum, loan) => {
    if (['approved', 'active'].includes(loan.status)) {
      return sum + (loan.totalRepayment - loan.repaidAmount);
    }
    return sum;
  }, 0);
  
  // Group contributions by month
  const contributionsByMonth: Record<string, number> = {};
  contributions.forEach(transaction => {
    if (transaction.type === 'contribution' && transaction.status === 'completed') {
      const date = new Date(transaction.createdAt);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!contributionsByMonth[monthYear]) {
        contributionsByMonth[monthYear] = 0;
      }
      
      contributionsByMonth[monthYear] += transaction.amount;
    }
  });
  
  // Format month labels
  const formatMonthLabel = (monthYear: string): string => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  // Export contributions as CSV
  const exportContributionsCSV = () => {
    // CSV header
    let csvContent = 'Date,Group,Amount,Status\n';
    
    // Add rows
    contributions.forEach(transaction => {
      const date = formatDate(transaction.createdAt);
      const group = transaction.group?.name || 'Unknown Group';
      const amount = transaction.amount;
      const status = transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1);
      
      csvContent += `${date},${group},${amount},${status}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contributions_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Export loans as CSV
  const exportLoansCSV = () => {
    // CSV header
    let csvContent = 'Date,Group,Amount,Interest,Total Repayment,Repaid Amount,Status\n';
    
    // Add rows
    loans.forEach(loan => {
      const date = formatDate(loan.createdAt);
      const group = loan.group?.name || 'Unknown Group';
      const amount = loan.amount;
      const interest = loan.interest;
      const totalRepayment = loan.totalRepayment;
      const repaidAmount = loan.repaidAmount;
      const status = loan.status.charAt(0).toUpperCase() + loan.status.slice(1);
      
      csvContent += `${date},${group},${amount},${interest},${totalRepayment},${repaidAmount},${status}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `loans_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Reports</h1>
          <p className="text-gray-500">View your personal financial reports</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button 
            variant="outline"
            onClick={() => activeTab === 'contributions' ? exportContributionsCSV() : exportLoansCSV()}
          >
            <Download className="mr-2 h-4 w-4" />
            Export {activeTab === 'contributions' ? 'Contributions' : 'Loans'}
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="groupFilter" className="block text-sm font-medium mb-1">Group</label>
                <select
                  id="groupFilter"
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Groups</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>{group.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date</label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div className="flex items-end space-x-2">
                <Button onClick={handleFilterChange} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
                </div>
              </CardContent>
            </Card>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalContributions)}</div>
              </CardContent>
            </Card>
            
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Loans Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLoans)}</div>
              </CardContent>
            </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Repayments</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRepayments)}</div>
            </CardContent>
          </Card>
          
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(outstandingLoans)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="contributions">
            Contributions
          </TabsTrigger>
          <TabsTrigger value="loans">
            Loans
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="contributions">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading contribution data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                <CardHeader>
                    <CardTitle>Contribution History</CardTitle>
                </CardHeader>
                <CardContent>
                    {contributions.length > 0 ? (
                  <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4">Date</th>
                              <th className="text-left py-3 px-4">Group</th>
                              <th className="text-left py-3 px-4">Amount</th>
                              <th className="text-left py-3 px-4">Status</th>
                        </tr>
                      </thead>
                          <tbody>
                            {contributions.map((transaction) => (
                              <tr key={transaction._id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{formatDate(transaction.createdAt)}</td>
                                <td className="py-3 px-4">{transaction.group?.name || 'Unknown Group'}</td>
                                <td className="py-3 px-4">{formatCurrency(transaction.amount)}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No contribution history</h3>
                        <p className="text-gray-500">You haven't made any contributions yet</p>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
            
            <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Contributions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(contributionsByMonth).length > 0 ? (
                      <div className="space-y-4">
                        {Object.keys(contributionsByMonth)
                          .sort()
                          .map((monthYear) => (
                            <div key={monthYear} className="flex justify-between items-center">
                              <span>{formatMonthLabel(monthYear)}</span>
                              <span className="font-medium">{formatCurrency(contributionsByMonth[monthYear])}</span>
            </div>
                          ))}
          </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No contribution data to display</p>
                </div>
                    )}
              </CardContent>
            </Card>
            
                {contributionSummary && contributionSummary.contributionsByGroup && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Contributions by Group</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {contributionSummary.contributionsByGroup.map((item: any) => (
                          <div key={item.groupId} className="flex justify-between items-center">
                            <span>{item.groupName}</span>
                            <span className="font-medium">{formatCurrency(item.total)}</span>
                          </div>
                        ))}
                </div>
              </CardContent>
            </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="loans">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading loan data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Loan History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loans.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4">Date</th>
                              <th className="text-left py-3 px-4">Group</th>
                              <th className="text-left py-3 px-4">Amount</th>
                              <th className="text-left py-3 px-4">Interest</th>
                              <th className="text-left py-3 px-4">Repaid</th>
                              <th className="text-left py-3 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loans.map((loan) => (
                              <tr key={loan._id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{formatDate(loan.createdAt)}</td>
                                <td className="py-3 px-4">{loan.group?.name || 'Unknown Group'}</td>
                                <td className="py-3 px-4">{formatCurrency(loan.amount)}</td>
                                <td className="py-3 px-4">{formatCurrency(loan.interest)}</td>
                                <td className="py-3 px-4">{formatCurrency(loan.repaidAmount)}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    loan.status === 'repaid' ? 'bg-green-100 text-green-800' :
                                    loan.status === 'approved' || loan.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                    loan.status === 'pending' || loan.status === 'voting' ? 'bg-yellow-100 text-yellow-800' :
                                    loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
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
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No loan history</h3>
                        <p className="text-gray-500">You haven't taken any loans yet</p>
                </div>
                    )}
              </CardContent>
            </Card>
          </div>
          
              <div>
                <Card>
            <CardHeader>
                    <CardTitle>Loan Summary</CardTitle>
            </CardHeader>
            <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Loans</span>
                        <span className="font-medium">{formatCurrency(totalLoans)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Interest</span>
                        <span className="font-medium">{formatCurrency(loans.reduce((sum, loan) => sum + loan.interest, 0))}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Repaid</span>
                        <span className="font-medium">{formatCurrency(totalRepayments)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Outstanding Balance</span>
                        <span className="font-medium">{formatCurrency(outstandingLoans)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Active Loans</span>
                        <span className="font-medium">{loans.filter(loan => ['approved', 'active'].includes(loan.status)).length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Completed Loans</span>
                        <span className="font-medium">{loans.filter(loan => loan.status === 'repaid').length}</span>
                      </div>
              </div>
            </CardContent>
          </Card>
          
                <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Loans by Group</CardTitle>
                </CardHeader>
                <CardContent>
                    {loans.length > 0 ? (
                      <div className="space-y-4">
                        {Array.from(new Set(loans.map(loan => loan.group?._id)))
                          .map(groupId => {
                            const groupLoans = loans.filter(loan => loan.group?._id === groupId);
                            const groupName = groupLoans[0]?.group?.name || 'Unknown Group';
                            const totalAmount = groupLoans.reduce((sum, loan) => sum + loan.amount, 0);
                          
                          return (
                              <div key={groupId} className="flex justify-between items-center">
                                <span>{groupName}</span>
                                <span className="font-medium">{formatCurrency(totalAmount)}</span>
                                </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <PieChart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No loan data to display</p>
                  </div>
                    )}
                </CardContent>
              </Card>
            </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberReportsPage; 