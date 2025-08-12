import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Calendar, ArrowDown, ArrowUp, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { getMyGroups } from '../../../services/groupService';
import { 
  getContributionHistory, 
  getContributionSummary, 
  getOverdueContributions 
} from '../../../services/paymentService';
import type { Group } from '../../../services/groupService';
import type { Transaction, OverdueContribution } from '../../../services/paymentService';
import ContributionForm from '../../../components/payments/ContributionForm';
import OverdueContributionAlert from '../../../components/payments/OverdueContributionAlert';

const ContributionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('history');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showContributionForm, setShowContributionForm] = useState<boolean>(false);
  
  // Data states
  const [groups, setGroups] = useState<Group[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [overdueContributions, setOverdueContributions] = useState<OverdueContribution[]>([]);
  
  // Filter states
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
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
      const historyResponse = await getContributionHistory();
      if (historyResponse.success) {
        setTransactions(historyResponse.data.data || []);
      }
      
      // Fetch contribution summary
      const summaryResponse = await getContributionSummary();
      if (summaryResponse.success) {
        setSummary(summaryResponse.data.data || null);
      }
      
      // Fetch overdue contributions
      const overdueResponse = await getOverdueContributions();
      if (overdueResponse.success) {
        setOverdueContributions(overdueResponse.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch contribution data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMakeContribution = (group?: Group) => {
    if (group) {
      setSelectedGroup(group);
    } else if (groups.length === 1) {
      setSelectedGroup(groups[0]);
    } else if (groups.length > 0) {
      // If no specific group is provided, show the form with group selection
      setSelectedGroup(null);
    }
    
    setShowContributionForm(true);
  };
  
  const handleFilterChange = async () => {
    try {
      setIsLoading(true);
      
      const params: any = {};
      if (groupFilter) params.groupId = groupFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await getContributionHistory(params);
      if (response.success) {
        setTransactions(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to filter contributions:', error);
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
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  if (showContributionForm && selectedGroup) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowContributionForm(false);
              setSelectedGroup(null);
            }}
            className="mb-4"
          >
            Back to Contributions
          </Button>
          <h1 className="text-2xl font-bold">Make a Contribution</h1>
        </div>
        
        <ContributionForm 
          group={selectedGroup}
          onSuccess={() => {
            setShowContributionForm(false);
            setSelectedGroup(null);
            fetchData();
          }}
          onCancel={() => {
            setShowContributionForm(false);
            setSelectedGroup(null);
          }}
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contributions</h1>
          <p className="text-gray-500">Manage your group contributions</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button onClick={() => handleMakeContribution()}>
            <Plus className="mr-2 h-4 w-4" />
            Make Contribution
          </Button>
        </div>
      </div>
      
      {/* Overdue Contributions Alert */}
      {overdueContributions.length > 0 && (
        <div className="mb-6">
      <OverdueContributionAlert 
        overdueContributions={overdueContributions}
            onMakePayment={(groupId) => {
              const group = groups.find(g => g._id === groupId);
              if (group) {
                handleMakeContribution(group);
              }
            }}
          />
        </div>
      )}
      
      {/* Contribution Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalContributed || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.upcomingContributions?.length || 0}
              </div>
              {summary.upcomingContributions?.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Next: {formatDate(summary.upcomingContributions[0].dueDate)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.length}</div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="groupFilter">Group</Label>
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
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="history">
            History
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading contribution history...</p>
            </div>
          ) : sortedTransactions.length > 0 ? (
          <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Contribution History</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleSortDirection}
                    className="flex items-center"
                  >
                    Date {sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />}
                  </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Group</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Method</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTransactions.map((transaction) => (
                        <tr key={transaction._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{formatDate(transaction.createdAt)}</td>
                          <td className="py-3 px-4">{transaction.group?.name || 'Unknown Group'}</td>
                          <td className="py-3 px-4">{formatCurrency(transaction.amount)}</td>
                          <td className="py-3 px-4">{transaction.paymentMethod}</td>
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
            </CardContent>
          </Card>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No contribution history</h3>
              <p className="text-gray-500 mb-6">You haven't made any contributions yet</p>
              <Button onClick={() => handleMakeContribution()}>
                Make Your First Contribution
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading upcoming contributions...</p>
            </div>
          ) : summary?.upcomingContributions?.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Due Date</th>
                        <th className="text-left py-3 px-4">Group</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.upcomingContributions.map((contribution: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{formatDate(contribution.dueDate)}</td>
                          <td className="py-3 px-4">{contribution.groupName}</td>
                          <td className="py-3 px-4">{formatCurrency(contribution.amount)}</td>
                          <td className="py-3 px-4">
                            <Button 
                              size="sm" 
                              onClick={() => {
                                const group = groups.find(g => g._id === contribution.groupId);
                                if (group) {
                                  handleMakeContribution(group);
                                }
                              }}
                            >
                              Pay Now
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No upcoming contributions</h3>
              <p className="text-gray-500">You don't have any upcoming contributions scheduled</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContributionsPage; 