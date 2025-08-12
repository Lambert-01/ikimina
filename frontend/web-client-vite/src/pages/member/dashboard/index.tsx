import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  Plus, 
  Users, 
  CreditCard, 
  Landmark, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  Bell,
  Wallet
} from 'lucide-react';
import GroupCard from '../../../components/groups/GroupCard';
import ActiveLoanCard from '../../../components/loans/ActiveLoanCard';
import { getMyGroups } from '../../../services/groupService';
import { formatCurrency } from '../../../lib/utils';
import type { Group } from '../../../services/groupService';

// Mock data for our enhanced dashboard
const mockGroups = [
  {
    id: '1',
    name: 'Savings Group A',
    memberCount: 12,
    contributionAmount: 10000,
    contributionFrequency: 'weekly',
    nextContributionDate: '2023-06-15',
    status: 'active',
    balance: 250000,
    isOverdue: false
  },
  {
    id: '2',
    name: 'Business Group B',
    memberCount: 8,
    contributionAmount: 25000,
    contributionFrequency: 'monthly',
    nextContributionDate: '2023-06-01',
    status: 'active',
    balance: 450000,
    isOverdue: true
  },
  {
    id: '3',
    name: 'Community Group C',
    memberCount: 15,
    contributionAmount: 5000,
    contributionFrequency: 'biweekly',
    nextContributionDate: '2023-06-20',
    status: 'pending',
    balance: 0,
    isOverdue: false
  }
];

const mockLoans = [
  {
    id: '1',
    amount: 50000,
    amountPaid: 20000,
    interestRate: 5,
    dueDate: '2023-07-15',
    status: 'active',
    groupName: 'Savings Group A'
  },
  {
    id: '2',
    amount: 25000,
    amountPaid: 0,
    interestRate: 4,
    dueDate: '2023-06-10',
    status: 'overdue',
    groupName: 'Business Group B'
  },
  {
    id: '3',
    amount: 30000,
    amountPaid: 30000,
    interestRate: 5,
    dueDate: '2023-05-20',
    status: 'paid',
    groupName: 'Savings Group A'
  }
];

const MemberDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [memberGroups, setMemberGroups] = useState<any[]>([]);
  const [managedGroups, setManagedGroups] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('member');
  const [stats, setStats] = useState({
    totalContributions: 250000,
    totalLoans: 50000,
    upcomingMeetings: 3
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // In a real app, these would be API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setMemberGroups(mockGroups);
        setManagedGroups(mockGroups.slice(0, 1));
        setLoans(mockLoans);
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleMakePayment = (loanId: string) => {
    // In a real app, this would navigate to a payment page or open a modal
    console.log(`Make payment for loan ${loanId}`);
  };
  
    return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">My Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <Link to="/member/join-group">
              <Users className="mr-2 h-4 w-4" />
              Join Group
            </Link>
          </Button>
          <Button asChild className="animate-slide-in-right" style={{ animationDelay: '200ms' }}>
            <Link to="/member/create-group">
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-primary-500" />
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalContributions)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wallet className="mr-2 h-4 w-4 text-primary-500" />
              Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalLoans)}</div>
            <p className="text-xs text-muted-foreground">2 loans pending</p>
          </CardContent>
        </Card>
        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary-500" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
            <p className="text-xs text-muted-foreground">Next: Saturday, 10:00 AM</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <TabsList className="mb-4">
          <TabsTrigger value="member" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            My Groups ({memberGroups.length})
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            My Loans ({loans.length})
          </TabsTrigger>
          <TabsTrigger value="manager" className="flex items-center">
            <Landmark className="mr-2 h-4 w-4" />
            Managed Groups ({managedGroups.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="member">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading your groups...</span>
            </div>
          ) : memberGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memberGroups.map((group, index) => (
                <GroupCard 
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  memberCount={group.memberCount}
                  contributionAmount={group.contributionAmount}
                  contributionFrequency={group.contributionFrequency}
                  nextContributionDate={group.nextContributionDate}
                  status={group.status}
                  balance={group.balance}
                  isOverdue={group.isOverdue}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-dark-text">You're not a member of any groups yet</h3>
              <p className="text-muted-foreground mb-6">Join an existing group or create your own to get started</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="outline">
                  <Link to="/member/join-group">Join a Group</Link>
                  </Button>
                <Button asChild>
                  <Link to="/member/create-group">Create a Group</Link>
                  </Button>
              </div>
                    </div>
          )}
        </TabsContent>
        
        <TabsContent value="loans">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading your loans...</span>
            </div>
          ) : loans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loans.map((loan, index) => (
                <ActiveLoanCard 
                  key={loan.id}
                  id={loan.id}
                  amount={loan.amount}
                  amountPaid={loan.amountPaid}
                  interestRate={loan.interestRate}
                  dueDate={loan.dueDate}
                  status={loan.status}
                  groupName={loan.groupName}
                  onMakePayment={handleMakePayment}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
              
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-dark-background/50 animate-slide-up" style={{ animationDelay: `${loans.length * 100}ms` }}>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-4">Need funds for a project?</p>
                <Button asChild>
                  <Link to="/member/loans/request" className="flex items-center">
                    Request a Loan
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-dark-text">You don't have any loans yet</h3>
              <p className="text-muted-foreground mb-6">Request a loan from one of your groups</p>
              <Button asChild>
                <Link to="/member/loans/request">Request a Loan</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="manager">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading your managed groups...</span>
            </div>
          ) : managedGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managedGroups.map((group, index) => (
                <GroupCard 
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  memberCount={group.memberCount}
                  contributionAmount={group.contributionAmount}
                  contributionFrequency={group.contributionFrequency}
                  nextContributionDate={group.nextContributionDate}
                  status={group.status}
                  balance={group.balance}
                  isOverdue={group.isOverdue}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
                ))}
              </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-dark-text">You don't manage any groups yet</h3>
              <p className="text-muted-foreground mb-6">Create a group to become its manager</p>
              <Button asChild>
                <Link to="/member/create-group">Create a Group</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-center justify-between border-b dark:border-dark-border pb-2">
              <div>
                    <p className="font-medium text-gray-900 dark:text-dark-text">Contribution Received</p>
                    <p className="text-sm text-muted-foreground">Savings Group A</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-dark-text">{formatCurrency(10000)}</p>
                    <p className="text-sm text-muted-foreground">Today, 10:30 AM</p>
                  </div>
                </li>
                <li className="flex items-center justify-between border-b dark:border-dark-border pb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-dark-text">Meeting Scheduled</p>
                    <p className="text-sm text-muted-foreground">Business Group B</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-dark-text">Saturday</p>
                    <p className="text-sm text-muted-foreground">Yesterday, 2:15 PM</p>
                  </div>
                </li>
                <li className="flex items-center justify-between border-b dark:border-dark-border pb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-dark-text">Loan Approved</p>
                    <p className="text-sm text-muted-foreground">Savings Group A</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-dark-text">{formatCurrency(50000)}</p>
                    <p className="text-sm text-muted-foreground">May 15, 9:20 AM</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <Link to="/member/notifications">
                    View All Activity
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberDashboard;