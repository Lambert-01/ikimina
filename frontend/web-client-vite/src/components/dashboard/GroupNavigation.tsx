import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import useAuthStore from '../../store/authStore';
import groupService from '../../services/groupService';

// Create a simple skeleton component since we don't have the ui/skeleton component
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}></div>
);

interface GroupNavigationProps {
  groupId: string;
}

export const GroupNavigation: React.FC<GroupNavigationProps> = ({ groupId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!groupId) return;
    
    // Set active tab based on URL parameter
    if (tab) {
      setActiveTab(tab);
    }
    
    // Check if current user is a manager of this group
    const checkManagerRole = async () => {
      try {
        setIsLoading(true);
        
        // Using the user from store directly if available in development mode
        if (user && process.env.NODE_ENV === 'development') {
          const managedGroups = user.managedGroups || [];
          setIsManager(managedGroups.includes(groupId));
          setIsLoading(false);
          return;
        }
        
        const hasManagerRole = await groupService.hasManagerRole(groupId);
        setIsManager(hasManagerRole);
      } catch (error) {
        console.error('Failed to check manager role:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkManagerRole();
  }, [groupId, tab, user]);

  if (isLoading) {
    return <GroupNavigationSkeleton />;
  }

  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => navigate(`/dashboard/group/${groupId}/${value}`)}
      >
        <TabsList className="bg-transparent">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          {isManager && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>
      </Tabs>
    </div>
  );
};

const GroupNavigationSkeleton = () => (
  <div className="mb-6">
    <div className="flex items-center space-x-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-10 w-24">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      ))}
    </div>
  </div>
); 