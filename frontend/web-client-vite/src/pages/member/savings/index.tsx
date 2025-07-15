import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  Plus, 
  Download, 
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-toastify';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface ContributionSummary {
  totalContributed: number;
  targetAmount: number;
  nextDueDate: string;
  status: 'up_to_date' | 'overdue' | 'pending';
  history: {
    month: string;
    amount: number;
  }[];
}

interface Contribution {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'overdue';
  group: string;
  notes?: string;
}

interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  progress: number;
}

const SavingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<ContributionSummary | null>(null);
  const [contributionHistory, setContributionHistory] = useState<Contribution[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [contributionChartData, setContributionChartData] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchSavingsData();
  }, []);
  
  const fetchSavingsData = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock contribution summary data
      setContributions({
        totalContributed: 85000,
        targetAmount: 120000,
        nextDueDate: '2023-06-15',
        status: 'up_to_date',
        history: [
          { month: 'Jan', amount: 15000 },
          { month: 'Feb', amount: 15000 },
          { month: 'Mar', amount: 15000 },
          { month: 'Apr', amount: 20000 },
          { month: 'May', amount: 20000 }
        ]
      });
      
      // Mock contribution history
      setContributionHistory([
        {
          id: '1',
          date: '2023-05-01',
          amount: 15000,
          status: 'completed',
          group: 'Kigali Savings Group',
          notes: 'Regular contribution'
        },
        {
          id: '2',
          date: '2023-04-01',
          amount: 15000,
          status: 'completed',
          group: 'Kigali Savings Group',
          notes: 'Regular contribution'
        },
        {
          id: '3',
          date: '2023-03-01',
          amount: 15000,
          status: 'completed',
          group: 'Family Support Circle',
          notes: 'Regular contribution'
        },
        {
          id: '4',
          date: '2023-02-01',
          amount: 15000,
          status: 'completed',
          group: 'Family Support Circle',
          notes: 'Regular contribution'
        },
        {
          id: '5',
          date: '2023-01-01',
          amount: 15000,
          status: 'completed',
          group: 'Kigali Savings Group',
          notes: 'Regular contribution'
        },
        {
          id: '6',
          date: '2023-06-01',
          amount: 15000,
          status: 'pending',
          group: 'Kigali Savings Group',
          notes: 'Upcoming contribution'
        }
      ]);
      
      // Mock savings goals
      setSavingsGoals([
        {
          id: '1',
          title: 'Emergency Fund',
          targetAmount: 500000,
          currentAmount: 250000,
          deadline: '2023-12-31',
          progress: 50
        },
        {
          id: '2',
          title: 'Home Renovation',
          targetAmount: 1000000,
          currentAmount: 300000,
          deadline: '2024-06-30',
          progress: 30
        }
      ]);
      
      // Mock chart data
      setContributionChartData([
        { month: 'Jan', amount: 15000, target: 15000 },
        { month: 'Feb', amount: 15000, target: 15000 },
        { month: 'Mar', amount: 15000, target: 15000 },
        { month: 'Apr', amount: 20000, target: 20000 },
        { month: 'May', amount: 20000, target: 20000 },
        { month: 'Jun', amount: 0, target: 20000 }
      ]);
      
    } catch (error) {
      console.error('Savings data fetch error:', error);
      toast.error('Failed to fetch savings data');
    } finally {
      setLoading(false);
    }
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
  
  const handleMakeContribution = () => {
    toast.info('Navigating to contribution form');
    // In a real app, this would navigate to the contribution form
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter contributions based on selected filter and search term
  const filteredContributions = contributionHistory.filter(contribution => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'completed' && contribution.status === 'completed') ||
                         (filter === 'pending' && contribution.status === 'pending') ||
                         (filter === 'overdue' && contribution.status === 'overdue');
                         
    const matchesSearch = contribution.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contribution.notes?.toLowerCase().includes(searchTerm.toLowerCase());
                         
    return matchesFilter && (searchTerm === '' || matchesSearch);
  });

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Savings</h1>
          <p className="text-gray-600">Track your contributions and savings goals</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button asChild variant="outline" className="flex items-center">
            <Link to="/dashboard/member/group">
              <Download className="h-4 w-4 mr-2" />
              Export Statement
            </Link>
          </Button>
          <Button className="flex items-center" onClick={handleMakeContribution}>
            <Plus className="h-4 w-4 mr-2" />
            Make Contribution
          </Button>
        </div>
      </div>
      
      {/* Savings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Savings</p>
              <p className="text-xl font-semibold">{formatCurrency(contributions?.totalContributed || 0)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Next Contribution</p>
              <p className="text-xl font-semibold">{formatDate(contributions?.nextDueDate || '')}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Contribution Status</p>
              <p className="text-xl font-semibold">
                {contributions?.status === 'up_to_date' ? 'Up to date' : 
                 contributions?.status === 'pending' ? 'Pending' : 'Overdue'}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Savings Progress & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Progress */}
        <Card className="p-5 border border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Savings Progress</h2>
            <Button variant="outline" size="sm" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
          
          {savingsGoals.length > 0 ? (
            <div className="space-y-6">
              {savingsGoals.map(goal => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">{goal.title}</h3>
                    <span className="text-sm text-gray-500">Due {formatDate(goal.deadline)}</span>
                  </div>
                  
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <TrendingUp className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No savings goals yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create a savings goal to track your progress
              </p>
              <div className="mt-6">
                <Button>
                  Create a Goal
                </Button>
              </div>
            </div>
          )}
        </Card>
        
        {/* Contribution Chart */}
        <Card className="p-5 border border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Contribution History</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="#" className="flex items-center text-primary-600">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={contributionChartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => formatCurrency(value).replace('RWF', '')}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#c7d2fe" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Contribution History */}
      <Card className="p-5 border border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Contribution History</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="relative">
              <select
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <Filter className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContributions.map((contribution) => (
                <tr key={contribution.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(contribution.date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(contribution.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contribution.group}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${contribution.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        contribution.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{contribution.notes || '-'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContributions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No contributions found matching your filters.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SavingsPage; 