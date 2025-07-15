import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Wallet,
  Calendar, 
  Bell,
  ChevronRight,
  DollarSign,
  CreditCard,
  UserPlus,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-toastify';
import useAuthStore from '../../../store/authStore';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import api from '../../../services/api';

interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
  balance: number;
  contributionAmount: number;
  contributionFrequency: string;
  nextContributionDue: string;
  nextMeeting: string;
  role: 'admin' | 'treasurer' | 'member';
}

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
  notes?: string;
}

interface LoanSummary {
  activeLoans: {
    id: string;
    amount: number;
    amountDue: number;
    dueDate: string;
    status: 'active' | 'overdue';
  }[];
  eligibleAmount: number;
  canRequestLoan: boolean;
}

interface UpcomingEvent {
  id: string;
  type: 'meeting' | 'contribution' | 'loan_payment';
  title: string;
  date: string;
  status: 'upcoming' | 'overdue';
  groupName: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

const MemberDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [contributions, setContributions] = useState<ContributionSummary | null>(null);
  const [recentContributions, setRecentContributions] = useState<Contribution[]>([]);
  const [loans, setLoans] = useState<LoanSummary | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // In development, we can use the real API endpoint
      if (process.env.NODE_ENV === 'development') {
        try {
          const response = await api.get('/members/dashboard');
          const data = response.data.data;
          
          if (data) {
            setGroups(data.groups || []);
            setContributions(data.contributions || null);
            setRecentContributions(data.recentContributions || []);
            setLoans(data.loans || null);
            setUpcomingEvents(data.upcomingEvents || []);
            setAnnouncements(data.announcements || []);
          }
        } catch (error) {
          console.error('Error fetching dashboard data from API:', error);
          // Fall back to mock data if API call fails
          loadMockData();
        }
      } else {
        // Use mock data for now
        loadMockData();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };
  
  const loadMockData = () => {
    // Mock groups data
    setGroups([
      {
        id: '1',
        name: 'Kigali Savings Group',
        memberCount: 15,
        balance: 1250000,
        contributionAmount: 10000,
        contributionFrequency: 'Weekly',
        nextContributionDue: '2023-06-15',
        nextMeeting: '2023-06-10',
        role: 'member'
      },
      {
        id: '2',
        name: 'Family Support Circle',
        memberCount: 8,
        balance: 450000,
        contributionAmount: 5000,
        contributionFrequency: 'Monthly',
        nextContributionDue: '2023-07-01',
        nextMeeting: '2023-06-25',
        role: 'admin'
      }
    ]);
    
    // Mock contribution data
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
    
    // Mock recent contributions
    setRecentContributions([
      {
        id: '1',
        date: '2023-05-01',
        amount: 15000,
        status: 'completed',
        notes: 'Regular contribution'
      },
      {
        id: '2',
        date: '2023-04-01',
        amount: 15000,
        status: 'completed',
        notes: 'Regular contribution'
      },
      {
        id: '3',
        date: '2023-03-01',
        amount: 15000,
        status: 'completed',
        notes: 'Regular contribution'
      }
    ]);
    
    // Mock loan data
    setLoans({
      activeLoans: [
        {
          id: '1',
          amount: 50000,
          amountDue: 30000,
          dueDate: '2023-07-15',
          status: 'active'
        }
      ],
      eligibleAmount: 100000,
      canRequestLoan: true
    });
    
    // Mock upcoming events
    setUpcomingEvents([
      {
        id: '1',
        type: 'meeting',
        title: 'Monthly Group Meeting',
        date: '2023-06-10',
        status: 'upcoming',
        groupName: 'Kigali Savings Group'
      },
      {
        id: '2',
        type: 'contribution',
        title: 'Weekly Contribution Due',
        date: '2023-06-15',
        status: 'upcoming',
        groupName: 'Kigali Savings Group'
      },
      {
        id: '3',
        type: 'loan_payment',
        title: 'Loan Payment Due',
        date: '2023-06-20',
        status: 'upcoming',
        groupName: 'Family Support Circle'
      }
    ]);

    // Mock announcements
    setAnnouncements([
      {
        id: '1',
        title: 'Important Meeting Change',
        content: 'The next group meeting has been moved to Saturday, June 12th at 2:00 PM.',
        date: '2023-06-05',
        priority: 'high'
      },
      {
        id: '2',
        title: 'New Loan Terms Available',
        content: 'Members can now request loans with extended repayment periods of up to 6 months.',
        date: '2023-06-01',
        priority: 'medium'
      }
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getDaysRemaining = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleRequestLoan = () => {
    // Navigate to loan request page
    navigate('/dashboard/member/loans/request');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary-500" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get primary group (first group or null)
  const primaryGroup = groups.length > 0 ? groups[0] : null;

  return (
    <div className="p-6">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user ? `${user.firstName} ${user.lastName}` : 'Member'}
        </h1>
        <p className="text-gray-600">Here's an overview of your financial activities and upcoming events.</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Join a Group</h3>
              <p className="text-sm text-blue-100">Find and join savings groups in your area</p>
            </div>
            <UserPlus className="h-8 w-8 text-blue-200" />
          </div>
          <Button 
            variant="secondary" 
            className="mt-4 bg-white text-blue-600 hover:bg-blue-50 w-full"
            onClick={() => navigate('/dashboard/member/join-group')}
          >
            Browse Groups
          </Button>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Create a Group</h3>
              <p className="text-sm text-green-100">Start your own savings group</p>
            </div>
            <PlusCircle className="h-8 w-8 text-green-200" />
          </div>
          <Button 
            variant="secondary" 
            className="mt-4 bg-white text-green-600 hover:bg-green-50 w-full"
            onClick={() => navigate('/dashboard/member/create-group')}
          >
            Create New Group
          </Button>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Request a Loan</h3>
              <p className="text-sm text-amber-100">Apply for a loan from your savings group</p>
            </div>
            <CreditCard className="h-8 w-8 text-amber-200" />
          </div>
          <Button 
            variant="secondary" 
            className="mt-4 bg-white text-amber-600 hover:bg-amber-50 w-full"
            onClick={() => navigate('/dashboard/member/loans/request')}
            disabled={!loans?.canRequestLoan}
          >
            {loans?.canRequestLoan ? 'Request Loan' : 'Not Eligible'}
          </Button>
        </Card>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Groups and contributions */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Groups section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">My Groups</h2>
              <Link to="/dashboard/member/group" className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-gray-500 font-medium mb-2">No Groups Yet</h3>
                <p className="text-gray-400 text-sm mb-4">Join or create a group to start saving with others</p>
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/dashboard/member/join-group')}
                  >
                    Join a Group
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/dashboard/member/create-group')}
                  >
                    Create Group
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{group.name}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{group.role}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Members:</span> {group.memberCount}
                      </div>
                      <div>
                        <span className="text-gray-500">Balance:</span> {formatCurrency(group.balance)}
                      </div>
                      <div>
                        <span className="text-gray-500">Contribution:</span> {formatCurrency(group.contributionAmount)}
                      </div>
                      <div>
                        <span className="text-gray-500">Frequency:</span> {group.contributionFrequency}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/member/group/${group.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Contributions section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Contributions</h2>
              <Link to="/dashboard/member/contributions" className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
                View History <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {contributions ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-primary-500 mr-2" />
                      <h3 className="font-medium">Total Contributed</h3>
                    </div>
                    <p className="text-2xl font-bold mt-2">{formatCurrency(contributions.totalContributed)}</p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full" 
                        style={{ width: `${calculateProgress(contributions.totalContributed, contributions.targetAmount)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {calculateProgress(contributions.totalContributed, contributions.targetAmount)}% of {formatCurrency(contributions.targetAmount)} target
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-primary-500 mr-2" />
                      <h3 className="font-medium">Next Contribution</h3>
                    </div>
                    {contributions.nextDueDate ? (
                      <>
                        <p className="text-2xl font-bold mt-2">{formatDate(contributions.nextDueDate)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {getDaysRemaining(contributions.nextDueDate)} days remaining
                        </p>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            contributions.status === 'up_to_date' ? 'bg-green-100 text-green-800' :
                            contributions.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {contributions.status === 'up_to_date' ? 'Up to date' :
                             contributions.status === 'pending' ? 'Pending' : 'Overdue'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 mt-2">No upcoming contributions</p>
                    )}
                  </div>
                </div>
                
                <h3 className="font-medium mb-3">Recent Contributions</h3>
                {recentContributions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentContributions.map((contribution) => (
                          <tr key={contribution.id}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{formatDate(contribution.date)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{formatCurrency(contribution.amount)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                contribution.status === 'completed' ? 'bg-green-100 text-green-800' :
                                contribution.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {contribution.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent contributions</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-gray-500 font-medium mb-2">No Contributions Yet</h3>
                <p className="text-gray-400 text-sm">Join a group to start contributing</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right column - Loans, events, announcements */}
        <div className="space-y-6">
          {/* Loans section */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Loans</h2>
            
            {loans ? (
              <div>
                {loans.activeLoans.length > 0 ? (
                  <div className="space-y-4 mb-4">
                    <h3 className="font-medium text-sm text-gray-500">Active Loans</h3>
                    {loans.activeLoans.map((loan) => (
                      <div key={loan.id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-lg font-bold">{formatCurrency(loan.amount)}</p>
                            <p className="text-sm text-gray-500">Due: {formatDate(loan.dueDate)}</p>
                          </div>
                          <span className={`h-fit px-2 py-1 text-xs rounded-full ${
                            loan.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {loan.status}
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-gray-500">Amount Due: {formatCurrency(loan.amountDue)}</p>
                          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${calculateProgress(loan.amount - loan.amountDue, loan.amount)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-4">No active loans</p>
                )}
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium">Loan Eligibility</h3>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(loans.eligibleAmount)}</p>
                  <p className="text-sm text-gray-500 mt-1">Maximum amount you can borrow</p>
                  
                  <Button 
                    className="w-full mt-3"
                    disabled={!loans.canRequestLoan}
                    onClick={() => navigate('/dashboard/member/loans/request')}
                  >
                    Request a Loan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-gray-500 font-medium mb-2">No Loan History</h3>
                <p className="text-gray-400 text-sm">Join a group to become eligible for loans</p>
              </div>
            )}
          </Card>

          {/* Upcoming events */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start p-3 border-b last:border-0">
                    <div className={`p-2 rounded-full mr-3 ${
                      event.type === 'meeting' ? 'bg-purple-100' :
                      event.type === 'contribution' ? 'bg-blue-100' :
                      'bg-amber-100'
                    }`}>
                      {event.type === 'meeting' ? (
                        <Calendar className={`h-4 w-4 text-purple-600`} />
                      ) : event.type === 'contribution' ? (
                        <Wallet className={`h-4 w-4 text-blue-600`} />
                      ) : (
                        <CreditCard className={`h-4 w-4 text-amber-600`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                      <p className="text-xs text-gray-500">{event.groupName}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No upcoming events</p>
            )}
          </Card>

          {/* Announcements */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Announcements</h2>
            
            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="flex items-start p-3 border-b last:border-0">
                    <div className={`p-2 rounded-full mr-3 ${
                      announcement.priority === 'high' ? 'bg-red-100' :
                      announcement.priority === 'medium' ? 'bg-amber-100' :
                      'bg-green-100'
                    }`}>
                      <Bell className={`h-4 w-4 ${
                        announcement.priority === 'high' ? 'text-red-600' :
                        announcement.priority === 'medium' ? 'text-amber-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{announcement.title}</p>
                      <p className="text-xs text-gray-500 mb-1">{formatDate(announcement.date)}</p>
                      <p className="text-sm">{announcement.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No announcements</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;