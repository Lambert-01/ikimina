import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ChevronDown,
  Plus,
  BarChart3
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-toastify';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ContributionSummary {
  totalCollected: number;
  targetAmount: number;
  complianceRate: number;
  upcomingDue: string;
  overdueCount: number;
}

interface MemberContribution {
  memberId: string;
  memberName: string;
  contributionStatus: 'up_to_date' | 'overdue' | 'pending';
  lastContribution: string;
  totalContributed: number;
  dueAmount: number;
  nextDueDate: string;
}

interface ContributionHistory {
  month: string;
  collected: number;
  target: number;
}

const ContributionsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ContributionSummary | null>(null);
  const [memberContributions, setMemberContributions] = useState<MemberContribution[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<MemberContribution[]>([]);
  const [contributionHistory, setContributionHistory] = useState<ContributionHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    fetchContributionData();
  }, []);
  
  useEffect(() => {
    filterContributions();
  }, [memberContributions, searchTerm, statusFilter]);
  
  const fetchContributionData = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock summary data
      setSummary({
        totalCollected: 1700000,
        targetAmount: 1800000,
        complianceRate: 92,
        upcomingDue: '2023-06-15',
        overdueCount: 2
      });
      
      // Mock member contributions data
      setMemberContributions([
        {
          memberId: '1',
          memberName: 'Jean Mutoni',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-01',
          totalContributed: 150000,
          dueAmount: 10000,
          nextDueDate: '2023-06-15'
        },
        {
          memberId: '2',
          memberName: 'Emmanuel Kwizera',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-02',
          totalContributed: 150000,
          dueAmount: 10000,
          nextDueDate: '2023-06-15'
        },
        {
          memberId: '3',
          memberName: 'Alice Uwimana',
          contributionStatus: 'overdue',
          lastContribution: '2023-05-01',
          totalContributed: 135000,
          dueAmount: 20000,
          nextDueDate: '2023-06-01'
        },
        {
          memberId: '4',
          memberName: 'Robert Mugisha',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-01',
          totalContributed: 150000,
          dueAmount: 10000,
          nextDueDate: '2023-06-15'
        },
        {
          memberId: '5',
          memberName: 'Grace Ingabire',
          contributionStatus: 'pending',
          lastContribution: '2023-05-15',
          totalContributed: 140000,
          dueAmount: 10000,
          nextDueDate: '2023-06-15'
        },
        {
          memberId: '6',
          memberName: 'Patrick Niyomugabo',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-01',
          totalContributed: 150000,
          dueAmount: 10000,
          nextDueDate: '2023-06-15'
        },
        {
          memberId: '7',
          memberName: 'Diane Mukamana',
          contributionStatus: 'overdue',
          lastContribution: '2023-04-15',
          totalContributed: 120000,
          dueAmount: 30000,
          nextDueDate: '2023-05-15'
        },
        {
          memberId: '8',
          memberName: 'Eric Habimana',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-01',
          totalContributed: 150000,
          dueAmount: 10000,
          nextDueDate: '2023-06-15'
        }
      ]);
      
      // Mock contribution history data
      setContributionHistory([
        { month: 'Jan', collected: 120000, target: 120000 },
        { month: 'Feb', collected: 120000, target: 120000 },
        { month: 'Mar', collected: 150000, target: 150000 },
        { month: 'Apr', collected: 140000, target: 150000 },
        { month: 'May', collected: 130000, target: 150000 },
        { month: 'Jun', collected: 140000, target: 150000 }
      ]);
      
    } catch (error) {
      console.error('Contribution data fetch error:', error);
      toast.error('Failed to fetch contribution data');
    } finally {
      setLoading(false);
    }
  };
  
  const filterContributions = () => {
    let result = [...memberContributions];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(contribution => 
        contribution.memberName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(contribution => contribution.contributionStatus === statusFilter);
    }
    
    setFilteredContributions(result);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleExportData = () => {
    toast.info('Exporting contribution data');
    // In a real app, this would generate and download a CSV file
  };
  
  const handleRecordContribution = () => {
    toast.info('Opening record contribution form');
    // In a real app, this would open a modal or navigate to a form
  };
  
  const handleSendReminders = () => {
    toast.info('Sending payment reminders to overdue members');
    // In a real app, this would trigger notifications to overdue members
  };
  
  const getContributionStatusIcon = (status: string) => {
    switch (status) {
      case 'up_to_date':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full">
        {/* Skeleton loading state */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
          <p className="text-gray-600">Track and manage member contributions</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" className="flex items-center" onClick={handleSendReminders}>
            <Calendar className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
          <Button className="flex items-center" onClick={handleRecordContribution}>
            <Plus className="h-4 w-4 mr-2" />
            Record Contribution
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Collected</p>
              <p className="text-xl font-semibold">{formatCurrency(summary?.totalCollected || 0)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Target Amount</p>
              <p className="text-xl font-semibold">{formatCurrency(summary?.targetAmount || 0)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <CheckCircle2 className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Compliance Rate</p>
              <p className="text-xl font-semibold">{summary?.complianceRate || 0}%</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Overdue Members</p>
              <p className="text-xl font-semibold">{summary?.overdueCount || 0}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Contribution Chart */}
      <Card className="p-5 border border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Contribution Trends</h2>
          <Button variant="ghost" size="sm" asChild>
            <div className="flex items-center text-primary-600">
              <span className="mr-1">6 Months</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={contributionHistory}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value).replace('RWF', '')}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="collected" 
                stroke="#4f46e5" 
                strokeWidth={2}
                name="Collected"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#c7d2fe" 
                strokeWidth={2}
                name="Target"
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Member Contributions */}
      <Card className="border border-gray-200 bg-white overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Member Contributions</h2>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="relative">
                <select
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Status</option>
                  <option value="up_to_date">Up to Date</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
                <Filter className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contribution
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Contributed
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContributions.map((contribution) => (
                <tr key={contribution.memberId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                          {contribution.memberName.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contribution.memberName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getContributionStatusIcon(contribution.contributionStatus)}
                      <span className={`ml-1.5 text-sm ${
                        contribution.contributionStatus === 'up_to_date' ? 'text-green-800' : 
                        contribution.contributionStatus === 'pending' ? 'text-yellow-800' : 
                        'text-red-800'
                      }`}>
                        {contribution.contributionStatus === 'up_to_date' ? 'Up to date' : 
                         contribution.contributionStatus === 'pending' ? 'Pending' : 'Overdue'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(contribution.lastContribution)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(contribution.totalContributed)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(contribution.dueAmount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(contribution.nextDueDate)}
                      {getDaysRemaining(contribution.nextDueDate) <= 3 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Soon
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button size="sm" onClick={() => toast.info(`Recording payment for ${contribution.memberName}`)}>
                      Record Payment
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContributions.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No contributions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'No contribution records available.'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button variant="outline" className="mt-6" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ContributionsPage; 