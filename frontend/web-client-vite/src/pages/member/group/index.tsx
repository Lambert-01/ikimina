import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Users, Calendar, CreditCard, Wallet, MessageSquare, Settings, Info } from 'lucide-react';
import MessageList from '../../../components/messages/MessageList';
import { getGroupById } from '../../../services/groupService';

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  totalContributions: number;
  nextContributionDate: string;
  nextMeetingDate: string;
  createdAt: string;
  managers: { id: string; name: string }[];
}

const MemberGroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, this would fetch from API
        // For now, using mock data
        const mockGroup = {
          id: groupId,
          name: 'Ikimina Savings Group',
          description: 'A community savings group for local entrepreneurs',
          memberCount: 15,
          totalContributions: 750000,
          nextContributionDate: '2023-06-15',
          nextMeetingDate: '2023-06-10',
          createdAt: '2023-01-01',
          managers: [
            { id: 'mgr1', name: 'John Manager' },
            { id: 'mgr2', name: 'Jane Admin' }
          ]
        };
        
        setGroupDetails(mockGroup);
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError('Failed to load group details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroupDetails();
  }, [groupId]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error || !groupDetails) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-400">{error || 'Group not found'}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{groupDetails.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{groupDetails.description}</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            {groupDetails.memberCount} Members
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview" className="flex items-center">
            <Info className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="contributions" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Contributions</span>
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Loans</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Messages</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Next Contribution</CardTitle>
                <CardDescription>When you need to contribute</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-primary-600 mr-2" />
                    <div>
                      <p className="text-2xl font-bold">5,000 RWF</p>
                      <p className="text-sm text-gray-500">Due {new Date(groupDetails.nextContributionDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button>Pay Now</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Next Meeting</CardTitle>
                <CardDescription>Upcoming group meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-primary-600 mr-2" />
                    <div>
                      <p className="text-lg font-medium">Monthly Meeting</p>
                      <p className="text-sm text-gray-500">{new Date(groupDetails.nextMeetingDate).toLocaleDateString()} at 3:00 PM</p>
                    </div>
                  </div>
                  <Button variant="outline">View</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Balance</CardTitle>
                <CardDescription>Current savings balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">45,000 RWF</p>
                    <p className="text-sm text-gray-500">Total contributed: 60,000 RWF</p>
                  </div>
                  <Button variant="outline">View History</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Group Activity</CardTitle>
              <CardDescription>Recent activity in your group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-3">
                      {i === 1 ? <CreditCard className="h-4 w-4" /> : i === 2 ? <Users className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {i === 1 ? 'New contribution received' : i === 2 ? 'New member joined' : 'Loan approved'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {i === 1 ? 'Jane Doe contributed 5,000 RWF' : i === 2 ? 'John Smith joined the group' : 'Loan of 20,000 RWF approved for Alice'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {i === 1 ? '2 hours ago' : i === 2 ? 'Yesterday' : '3 days ago'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>People in your savings group</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Members list goes here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>Your contribution records</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contributions list goes here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Loan Opportunities</CardTitle>
              <CardDescription>Available loans and your loan history</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Loans information goes here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages" className="h-[600px]">
          <MessageList groupId={groupId || ''} groupName={groupDetails.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberGroupPage; 