import React, { useState, useEffect } from 'react';
import MessageList from '../../../components/messages/MessageList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Users, UserCircle, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  unreadMessages?: number;
}

const ManagerMessages: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('groups');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockGroups = [
          { id: '1', name: 'Kigali Savings Group', memberCount: 15, unreadMessages: 3 },
          { id: '2', name: 'Family Support Circle', memberCount: 8, unreadMessages: 0 },
          { id: '3', name: 'Community Investment Club', memberCount: 12, unreadMessages: 1 },
          { id: '4', name: 'Business Growth Network', memberCount: 10, unreadMessages: 0 }
        ];
        
        setGroups(mockGroups);
        
        // Select the first group by default
        if (mockGroups.length > 0) {
          setSelectedGroup(mockGroups[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, []);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
    // Mark messages as read in a real app
    setGroups(groups.map(group => 
      group.id === groupId ? { ...group, unreadMessages: 0 } : group
    ));
  };

  const getSelectedGroupName = () => {
    const group = groups.find(g => g.id === selectedGroup);
    return group ? group.name : 'Select a group';
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        <h1 className="text-2xl font-bold mb-6">Group Communications</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="groups" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Group Chats
            </TabsTrigger>
            <TabsTrigger value="direct" className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4" />
              Member Messages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="groups" className="flex-1 flex h-full">
            <div className="w-1/4 pr-4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <h2 className="text-lg font-semibold mb-4">Managed Groups</h2>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredGroups.length > 0 ? (
                <ul className="space-y-2">
                  {filteredGroups.map(group => (
                    <li key={group.id}>
                      <button
                        onClick={() => handleGroupSelect(group.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedGroup === group.id
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{group.name}</div>
                          {group.unreadMessages ? (
                            <div className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {group.unreadMessages}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {group.memberCount} members
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No groups match your search' : 'You don\'t manage any groups yet'}
                </div>
              )}
              
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Create New Group
                </Button>
              </div>
            </div>
            
            <div className="w-3/4 pl-4 flex-1">
              {selectedGroup ? (
                <MessageList groupId={selectedGroup} groupName={getSelectedGroupName()} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  Select a group to view messages
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="direct" className="flex-1">
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Direct messaging with members feature coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerMessages; 