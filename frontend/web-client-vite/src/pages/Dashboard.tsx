import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify'; // Removed unused import
import { PlusCircle, Users, ArrowUpRight, Building } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton, SkeletonCard } from '../components/ui/skeleton';
import useAuthStore from '../store/authStore';
// import groupService from '../services/groupService'; // Removed unused import
import type { Group } from '../services/groupService';

/**
 * Main dashboard component that shows both member and managed groups
 * Acts as the central hub for users to navigate to specific group dashboards
 */
const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [memberGroups, setMemberGroups] = useState<Group[]>([]);
  const [managedGroups, setManagedGroups] = useState<Group[]>([]);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Display user's actual groups from database
  useEffect(() => {
    if (user) {
      console.log('Dashboard: Loading user data:', user);
      // Use user's actual groups from the database
      setMemberGroups(user.memberOfGroups || []);
      setManagedGroups(user.managerOfGroups || []);
      setIsLoading(false);
    }
  }, [user]);

  // Calculate total stats
  const totalContributions = [...memberGroups, ...managedGroups].reduce(
    (sum, group) => sum + group.financialSummary.totalContributions, 
    0
  );

  const totalOutstandingLoans = [...memberGroups, ...managedGroups].reduce(
    (sum, group) => sum + group.financialSummary.outstandingLoans, 
    0
  );

  const totalAvailableFunds = [...memberGroups, ...managedGroups].reduce(
    (sum, group) => sum + group.financialSummary.availableFunds, 
    0
  );

  // Load groups from API when component mounts (in addition to user data)
  useEffect(() => {
    const loadAdditionalGroupData = async () => {
      if (!user) return;
      
      try {
        // Only try to load additional group data if groupService is available
        // For now, we'll use the data from the user object
        console.log('Dashboard: Using user groups from authentication');
      } catch (error) {
        console.error('Failed to load additional group data:', error);
        // Don't show error toast for optional data
      }
    };

    // Only run this once when user is loaded
    if (user && !isLoading) {
      loadAdditionalGroupData();
    }
  }, []); // Empty dependency array to prevent infinite loops

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const hasNoGroups = memberGroups.length === 0 && managedGroups.length === 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.firstName || 'User'}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="animate-slide-in-right" style={{ animationDelay: '100ms' }}>
            <Link to="/dashboard/join-group" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Join Group
            </Link>
          </Button>
          <Button className="animate-slide-in-right" style={{ animationDelay: '200ms' }}>
            <Link to="/dashboard/create-group" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Group
            </Link>
          </Button>
          {user?.roles?.includes('admin') && (
            <Button variant="outline" className="animate-slide-in-right" style={{ animationDelay: '300ms' }}>
              <Link to="/admin/login" className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {!hasNoGroups && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Groups</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {memberGroups.length + managedGroups.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Contributions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(totalContributions)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Funds</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(totalAvailableFunds)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {hasNoGroups && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center my-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            You're not a member of any groups yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            Join an existing group or create your own to get started with Ikimina. 
            Track contributions, request loans, and attend meetings.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline">
              <Link to="/dashboard/join-group" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Join a Group
              </Link>
            </Button>
            <Button>
              <Link to="/dashboard/create-group" className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create a Group
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Managed Groups Section */}
      {managedGroups.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Managed Groups
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managedGroups.map((group) => (
              <GroupCard 
                key={group.id} 
                group={group} 
                isManager={true} 
                className="animate-fade-in"
              />
            ))}
          </div>
        </div>
      )}

      {/* Member Groups Section */}
      {memberGroups.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Groups
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberGroups.map((group) => (
              <GroupCard 
                key={group.id} 
                group={group} 
                isManager={false} 
                className="animate-fade-in" 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Group Card Component
interface GroupCardProps {
  group: Group;
  isManager: boolean;
  className?: string;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, isManager, className }) => (
  <Link 
    to={`/dashboard/group/${group.id}/overview`}
    className={`block ${className}`}
  >
    <Card className="h-full hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{group.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mt-1">
              {group.description}
            </p>
          </div>
          {isManager && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Manager
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
            <p className="font-medium">{group.memberCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <p className="font-medium capitalize">{group.status}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Contribution</p>
            <p className="font-medium">
              {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(group.contributionSettings.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
            <p className="font-medium capitalize">{group.contributionSettings.frequency}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 text-xs font-medium px-2 py-1 rounded">
            {group.groupType}
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            View Details
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </Link>
);

// Skeleton loader for the dashboard
const DashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-6 max-w-7xl">
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Skeleton className="h-8 w-48 mb-4" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>

    <Skeleton className="h-8 w-48 mb-4" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export default Dashboard; 