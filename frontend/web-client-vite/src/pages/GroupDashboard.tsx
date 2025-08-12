import React, { useEffect, useState } from 'react';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GroupNavigation } from '../components/dashboard/GroupNavigation';
import { Skeleton, SkeletonText } from '../components/ui/skeleton';
import groupService from '../services/groupService';
import type { Group } from '../services/groupService';
import useAuthStore from '../store/authStore';

// Placeholder Group Tab Components
// In a real implementation, these would be imported from separate files
const GroupOverview: React.FC<{ group: Group }> = ({ group }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Group Overview</h3>
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-medium mb-2">Group Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Group Type</p>
            <p className="mt-1">{group.groupType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Created On</p>
            <p className="mt-1">{new Date(group.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Current Cycle</p>
            <p className="mt-1">Cycle #{group.cycle.number}</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium mb-2">Financial Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Contributions</p>
            <p className="mt-1">{new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(group.financialSummary.totalContributions)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Outstanding Loans</p>
            <p className="mt-1">{new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(group.financialSummary.outstandingLoans)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Interest Earned</p>
            <p className="mt-1">{new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(group.financialSummary.totalInterestEarned)}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const GroupMembers: React.FC<{ group: Group; isManager: boolean }> = ({ group, isManager }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Members ({group.memberCount})</h3>
    <p>Member list would be displayed here.</p>
    {isManager && <p className="mt-4">As a manager, you can add or remove members.</p>}
  </div>
);

const GroupContributions: React.FC<{ group: Group }> = ({ group }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Contributions</h3>
    <div className="mb-4">
      <h4 className="text-lg font-medium mb-2">Contribution Settings</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Amount</p>
          <p className="mt-1">{new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(group.contributionSettings.amount)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Frequency</p>
          <p className="mt-1">{group.contributionSettings.frequency}</p>
        </div>
      </div>
    </div>
    <p>Contribution history would be displayed here.</p>
  </div>
);

const GroupLoans: React.FC<{ group: Group; isManager: boolean }> = ({ group, isManager }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Loans</h3>
    <div className="mb-4">
      <h4 className="text-lg font-medium mb-2">Loan Settings</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Interest Rate</p>
          <p className="mt-1">{group.loanSettings.interestRate}%</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Max Loan Multiplier</p>
          <p className="mt-1">{group.loanSettings.maxLoanMultiplier}x contributions</p>
        </div>
      </div>
    </div>
    <p>Loan history would be displayed here.</p>
    {isManager && <p className="mt-4">As a manager, you can approve or reject loan requests.</p>}
  </div>
);

const GroupMeetings: React.FC<{ group: Group; isManager: boolean }> = ({ group, isManager }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Meetings</h3>
    <div className="mb-4">
      <h4 className="text-lg font-medium mb-2">Meeting Settings</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Frequency</p>
          <p className="mt-1">{group.meetingSettings.frequency}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Location</p>
          <p className="mt-1">{group.meetingSettings.location}</p>
        </div>
      </div>
    </div>
    <p>Meeting schedule would be displayed here.</p>
    {isManager && <p className="mt-4">As a manager, you can schedule new meetings.</p>}
  </div>
);

const GroupReports: React.FC<{ group: Group }> = ({ group }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Reports</h3>
    <p>Group financial reports would be displayed here.</p>
  </div>
);

const GroupSettings: React.FC<{ group: Group }> = ({ group }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Group Settings</h3>
    <p>Group settings would be displayed here. Only managers can access this page.</p>
  </div>
);

/**
 * GroupDashboard serves as the container for all group-specific pages
 * It loads the group data and renders different tabs based on the URL
 */
const GroupDashboard: React.FC = () => {
  const { groupId = '', tab = 'overview' } = useParams<{ groupId?: string; tab?: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!groupId) return;

    const loadGroup = async () => {
      try {
        setIsLoading(true);
        const groupData = await groupService.getGroup(groupId);
        
        if (!groupData) {
          toast.error('Group not found');
          return;
        }
        
        setGroup(groupData);
        
        // Check if user is a manager of this group
        const managedGroups = user?.managedGroups || [];
        setIsManager(managedGroups.includes(groupId));
      } catch (error) {
        console.error('Error loading group:', error);
        toast.error('Failed to load group data');
      } finally {
        setIsLoading(false);
      }
    };

    loadGroup();
  }, [groupId, user]);

  if (isLoading) {
    return <GroupDashboardSkeleton />;
  }

  if (!group) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Group Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">
          The group you're looking for doesn't exist or you don't have permission to view it.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Group Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{group.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              group.status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
            </span>
            {isManager && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                Manager
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Members</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{group.memberCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Funds</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(group.financialSummary.availableFunds)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Contribution</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(group.contributionSettings.amount)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {group.contributionSettings.frequency.charAt(0).toUpperCase() + group.contributionSettings.frequency.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Group Navigation */}
      <GroupNavigation groupId={groupId} />

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <Routes>
          <Route path="/" element={<Navigate to={`/dashboard/group/${groupId}/overview`} replace />} />
          <Route path="/overview" element={<GroupOverview group={group} />} />
          <Route path="/members" element={<GroupMembers group={group} isManager={isManager} />} />
          <Route path="/contributions" element={<GroupContributions group={group} />} />
          <Route path="/loans" element={<GroupLoans group={group} isManager={isManager} />} />
          <Route path="/meetings" element={<GroupMeetings group={group} isManager={isManager} />} />
          <Route path="/reports" element={<GroupReports group={group} />} />
          {isManager && (
            <Route path="/settings" element={<GroupSettings group={group} />} />
          )}
        </Routes>
      </div>
    </div>
  );
};

// Skeleton loader for the group dashboard
const GroupDashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div className="w-1/2">
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ))}
      </div>
    </div>
    
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <SkeletonText lines={3} />
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between items-center">
            <SkeletonText className="w-1/3" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default GroupDashboard; 