import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Users, 
  Group, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  UserPlus,
  Building,
  CreditCard,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import api from '../../services/api';

interface DashboardOverview {
  totalUsers: number;
  totalGroups: number;
  activeGroups: number;
  pendingGroups: number;
  totalTransactions: number;
  totalLoans: number;
  activeLoans: number;
  pendingLoans: number;
  totalContributions: number;
  unreadNotifications: number;
}

interface RecentActivity {
  newUsersThisMonth: number;
  newGroupsThisMonth: number;
  transactionsThisMonth: number;
  loansThisMonth: number;
}

interface Financial {
  totalAmount: number;
  averageTransactionAmount: number;
  successfulTransactions: number;
  successRate: string;
}

interface TopGroup {
  _id: string;
  name: string;
  memberCount: number;
  status: string;
  createdAt: string;
}

interface RecentTransaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  userId: {
    firstName: string;
    lastName: string;
  };
  groupId: {
    name: string;
  };
  description: string;
}

interface UserGrowthData {
  date: string;
  users: number;
}

interface DashboardStats {
  overview: DashboardOverview;
  recentActivity: RecentActivity;
  financial: Financial;
  topGroups: TopGroup[];
  recentTransactions: RecentTransaction[];
  userGrowthData: UserGrowthData[];
}

// Utility components
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: {
  title: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        {trend && trendValue && (
          <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingGroups, setPendingGroups] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, pendingGroupsResponse] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/api/groups/pending')
        ]);
        
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
        
        if (pendingGroupsResponse.data.success) {
          setPendingGroups(pendingGroupsResponse.data.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard statistics.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `RWF ${amount.toLocaleString()}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex space-x-3">
          <Link 
            to="/admin/groups" 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Group className="h-4 w-4 mr-2" />
            Manage Groups
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.overview.totalUsers}
          icon={Users}
          trend="up"
          trendValue={`+${stats.recentActivity.newUsersThisMonth} this month`}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Groups"
          value={stats.overview.activeGroups}
          icon={Building}
          trend="up"
          trendValue={`+${stats.recentActivity.newGroupsThisMonth} this month`}
          color="bg-green-500"
        />
        <StatCard
          title="Total Transactions"
          value={stats.overview.totalTransactions}
          icon={CreditCard}
          trend="up"
          trendValue={`+${stats.recentActivity.transactionsThisMonth} this month`}
          color="bg-indigo-500"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.overview.pendingGroups + stats.overview.pendingLoans}
          icon={Clock}
          color="bg-amber-500"
        />
      </div>

      {/* Quick Actions & Notifications */}
      {stats.overview.unreadNotifications > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3" />
            <div>
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                You have {stats.overview.unreadNotifications} unread notifications
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                Check your notifications panel for updates
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Overview</h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Volume</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(stats.financial.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Success Rate</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.financial.successRate}%</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Avg Transaction</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatCurrency(stats.financial.averageTransactionAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Groups */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Groups</h3>
            <Link to="/admin/groups" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.topGroups.slice(0, 5).map((group, index) => (
              <div key={group._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-medium mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{group.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{group.memberCount} members</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  group.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {group.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <Link to="/admin/transactions" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : transaction.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900/20'
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {transaction.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : transaction.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {transaction.userId.firstName} {transaction.userId.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.groupId?.name || 'Individual'} • {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{transaction.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Groups */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Groups</h3>
            <Link to="/admin/groups" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-medium">
              Review all
            </Link>
          </div>
          <div className="space-y-4">
            {pendingGroups.length > 0 ? (
              pendingGroups.map((group) => (
                <div key={group._id} className="flex items-center justify-between p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mr-4">
                      <Building className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{group.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {group.memberCount} members • Created {formatDate(group.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No pending groups to review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;