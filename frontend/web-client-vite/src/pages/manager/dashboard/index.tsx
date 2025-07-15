import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  FileText,
  ChevronRight,
  BarChart3,
  Plus,
  ArrowUpRight,
  PlusCircle,
  DollarSign,
  CreditCard,
  Building,
  User,
  Loader2
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-toastify';
import useAuthStore from '../../../store/authStore';

interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
  activeLoans: number;
  balance: number;
  complianceRate: number;
}

interface FinancialSummary {
  totalContributions: number;
  totalLoans: number;
  totalInterest: number;
  availableFunds: number;
}

interface Member {
  id: string;
  name: string;
  contributionStatus: 'up_to_date' | 'overdue' | 'pending';
  lastContribution: string;
  totalContributed: number;
}

interface Loan {
  id: string;
  memberName: string;
  amount: number;
  dueDate: string;
  status: 'active' | 'overdue' | 'pending';
}

interface RecentActivity {
  id: string;
  type: 'contribution' | 'loan' | 'meeting' | 'member';
  description: string;
  date: string;
  user?: string;
}

const ManagerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // In a real app, these would be API calls
      // For now, using mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock groups data
      setGroups([
        {
          id: '1',
          name: 'Kigali Savings Group',
          memberCount: 15,
          activeLoans: 3,
          balance: 1250000,
          complianceRate: 92
        },
        {
          id: '2',
          name: 'Family Support Circle',
          memberCount: 8,
          activeLoans: 1,
          balance: 450000,
          complianceRate: 100
        }
      ]);
      
      // Mock financial data
      setFinancials({
        totalContributions: 1700000,
        totalLoans: 500000,
        totalInterest: 25000,
        availableFunds: 1225000
      });
      
      // Mock members data
      setMembers([
        {
          id: '1',
          name: 'Jean Mutoni',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-01',
          totalContributed: 150000
        },
        {
          id: '2',
          name: 'Emmanuel Kwizera',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-02',
          totalContributed: 150000
        },
        {
          id: '3',
          name: 'Alice Uwimana',
          contributionStatus: 'overdue',
          lastContribution: '2023-05-01',
          totalContributed: 135000
        },
        {
          id: '4',
          name: 'Robert Mugisha',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-01',
          totalContributed: 150000
        },
        {
          id: '5',
          name: 'Grace Ingabire',
          contributionStatus: 'pending',
          lastContribution: '2023-05-15',
          totalContributed: 140000
        }
      ]);
      
      // Mock loans data
      setLoans([
        {
          id: '1',
          memberName: 'Jean Mutoni',
          amount: 100000,
          dueDate: '2023-07-15',
          status: 'active'
        },
        {
          id: '2',
          memberName: 'Alice Uwimana',
          amount: 50000,
          dueDate: '2023-06-30',
          status: 'overdue'
        },
        {
          id: '3',
          memberName: 'Robert Mugisha',
          amount: 75000,
          dueDate: '2023-08-01',
          status: 'active'
        },
        {
          id: '4',
          memberName: 'Grace Ingabire',
          amount: 30000,
          dueDate: '2023-06-20',
          status: 'pending'
        }
      ]);
      
      // Mock activities data
      setActivities([
        {
          id: '1',
          type: 'contribution',
          description: 'Weekly contribution received',
          date: '2023-06-05T09:30:00',
          user: 'Emmanuel Kwizera'
        },
        {
          id: '2',
          type: 'loan',
          description: 'Loan request approved',
          date: '2023-06-04T14:15:00',
          user: 'Robert Mugisha'
        },
        {
          id: '3',
          type: 'meeting',
          description: 'Monthly meeting completed',
          date: '2023-06-03T16:00:00'
        },
        {
          id: '4',
          type: 'member',
          description: 'New member joined',
          date: '2023-06-02T11:45:00',
          user: 'Grace Ingabire'
        },
        {
          id: '5',
          type: 'contribution',
          description: 'Weekly contribution received',
          date: '2023-06-01T10:20:00',
          user: 'Jean Mutoni'
        }
      ]);
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to fetch dashboard data');
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
  
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'loan':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'meeting':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'member':
        return <Users className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
          <div className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role indicator and welcome message */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Manager Dashboard</h1>
            <p className="mt-1 text-amber-100">
              You are managing {groups.length} {groups.length === 1 ? 'group' : 'groups'} with {members.length} members
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              className="bg-white text-amber-700 hover:bg-amber-50"
              onClick={() => navigate('/dashboard/manager/groups/create')}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Group
            </Button>
          </div>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Contributions</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(financials?.totalContributions || 0)}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Available Funds</span>
                <span className="font-medium text-gray-700">
                  {formatCurrency(financials?.availableFunds || 0)}
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${((financials?.availableFunds || 0) / (financials?.totalContributions || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Loans</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(financials?.totalLoans || 0)}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Loan Status</span>
                <span className="font-medium text-gray-700">
                  {loans.filter(loan => loan.status === 'active').length} active
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-gray-600 mr-1">Interest earned:</span>
                <span className="font-medium text-gray-900">{formatCurrency(financials?.totalInterest || 0)}</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Members</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {members.length}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Compliance Rate</span>
                <span className="font-medium text-gray-700">
                  {Math.round(members.filter(m => m.contributionStatus === 'up_to_date').length / members.length * 100)}%
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm">
                <span className={`${members.filter(m => m.contributionStatus === 'overdue').length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {members.filter(m => m.contributionStatus === 'overdue').length} overdue members
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Managed Groups</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {groups.length}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Avg. Compliance</span>
                <span className="font-medium text-gray-700">
                  {Math.round(groups.reduce((sum, g) => sum + g.complianceRate, 0) / groups.length)}%
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm">
                <Link to="/dashboard/manager/groups" className="text-primary-600 hover:text-primary-700 flex items-center">
                  Manage groups <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Managed Groups and Member Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Managed Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {group.memberCount} members • {group.activeLoans} active loans
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.complianceRate >= 90 ? 'bg-green-100 text-green-800' : 
                      group.complianceRate >= 75 ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {group.complianceRate}% Compliance
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className="font-medium">{formatCurrency(group.balance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Loans</p>
                      <p className="font-medium">{group.activeLoans} loans</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/dashboard/manager/groups/${group.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link to={`/dashboard/manager/members/${group.id}`}>
                          <Users className="h-4 w-4 mr-1" />
                          Manage Members
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {groups.length === 0 && !loading && (
            <Card className="p-6 text-center">
              <div className="flex flex-col items-center">
                <Building className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Groups Yet</h3>
                <p className="text-gray-500 mt-2">Create a new group to start managing contributions and loans.</p>
                <div className="mt-4">
                  <Button asChild>
                    <Link to="/dashboard/manager/groups/create">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Group
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
              <p className="mt-2 text-gray-600">Loading your groups...</p>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Member Status</h2>
          <Card className="bg-white overflow-hidden">
            <div className="divide-y divide-gray-100">
              {members.slice(0, 5).map((member) => (
                <div key={member.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      member.contributionStatus === 'up_to_date' ? 'bg-green-100' : 
                      member.contributionStatus === 'pending' ? 'bg-blue-100' : 
                      'bg-red-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        member.contributionStatus === 'up_to_date' ? 'text-green-600' : 
                        member.contributionStatus === 'pending' ? 'text-blue-600' : 
                        'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.contributionStatus === 'up_to_date' ? 'bg-green-100 text-green-800' : 
                          member.contributionStatus === 'pending' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {member.contributionStatus === 'up_to_date' ? 'Up to date' : 
                           member.contributionStatus === 'pending' ? 'Pending' : 'Overdue'}
                        </span>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span>Last contribution: {formatDate(member.lastContribution)}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span>Total: {formatCurrency(member.totalContributed)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
              <Link 
                to="/dashboard/manager/members" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center"
              >
                View All Members
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </Card>
          
          {/* Recent Activity */}
          <h2 className="text-xl font-bold text-gray-900 mt-6 mb-4">Recent Activity</h2>
          <Card className="bg-white overflow-hidden">
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      activity.type === 'contribution' ? 'bg-green-100' : 
                      activity.type === 'loan' ? 'bg-amber-100' : 
                      activity.type === 'meeting' ? 'bg-blue-100' :
                      'bg-purple-100'
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{activity.description}</h4>
                      {activity.user && (
                        <p className="text-sm text-gray-500 mt-1">{activity.user}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">{formatDateTime(activity.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Loan Management */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Loans</h2>
        <Card className="bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.memberName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(loan.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        loan.status === 'active' ? 'bg-green-100 text-green-800' : 
                        loan.status === 'pending' ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dashboard/manager/loans/${loan.id}`}>
                            Details
                          </Link>
                        </Button>
                        {loan.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{loans.length}</span> of <span className="font-medium">{loans.length}</span> loans
              </div>
              <div>
                <Link 
                  to="/dashboard/manager/loans" 
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  View All Loans
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;