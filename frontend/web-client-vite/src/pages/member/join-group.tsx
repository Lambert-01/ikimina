import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

// Components
import GroupSearchFilter from '../../components/groups/GroupSearchFilter';
import type { GroupFilterOptions } from '../../components/groups/GroupSearchFilter';
import GroupCard from '../../components/groups/GroupCard';
import JoinGroupModal from '../../components/groups/JoinGroupModal';
import type { JoinGroupRequestData } from '../../components/groups/JoinGroupModal';

// Services
import { groupService } from '../../services';

// Types
interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  contributionAmount: number;
  contributionFrequency: string;
  isPrivate: boolean;
  currency: string;
}

const JoinGroupPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load groups on component mount
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setIsLoading(true);
        const response = await groupService.getGroups('public');
        setGroups(response.data || []);
        setFilteredGroups(response.data || []);
      } catch (error) {
        console.error('Error loading groups:', error);
        toast.error('Failed to load available groups');
      } finally {
        setIsLoading(false);
      }
    };

    loadGroups();
  }, []);

  // Handle filter changes
  const handleFilterChange = (filters: GroupFilterOptions) => {
    setIsLoading(true);

    // Apply filters
    let result = [...groups];

    // Filter by query (name or ID)
    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(group => 
        group.name.toLowerCase().includes(query) || 
        group.id.toLowerCase().includes(query)
      );
    }

    // Filter by visibility
    if (filters.visibility !== 'all') {
      const isPrivate = filters.visibility === 'private';
      result = result.filter(group => group.isPrivate === isPrivate);
    }

    // Filter by contribution amount
    result = result.filter(group => 
      group.contributionAmount >= filters.contributionMin &&
      group.contributionAmount <= filters.contributionMax
    );

    // Filter by frequency
    if (filters.frequency !== 'all') {
      result = result.filter(group => group.contributionFrequency === filters.frequency);
    }

    setFilteredGroups(result);
    setIsLoading(false);
  };

  // Handle join request
  const handleJoinRequest = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setIsModalOpen(true);
    }
  };

  // Handle view details
  const handleViewDetails = (groupId: string) => {
    // In a real app, this would navigate to a group details page
    toast.info(`Viewing details for group ${groupId}`);
  };

  // Handle join request submission
  const handleJoinSubmit = async (data: JoinGroupRequestData) => {
    try {
      setIsSubmitting(true);
      
      // Call the API to submit the join request
      await groupService.joinGroup(data.groupId);
      
      toast.success('Join request submitted successfully');
      setIsModalOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error submitting join request:', error);
      toast.error('Failed to submit join request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Join a Savings Group</h1>
        <p className="text-gray-600">
          Find and join savings groups that match your financial goals and contribution preferences.
        </p>
      </div>

      {/* Search and Filter */}
      <GroupSearchFilter onFilterChange={handleFilterChange} isLoading={isLoading} />

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600">Loading groups...</span>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No groups found</h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your search filters or check back later for new groups.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              description={group.description}
              memberCount={group.memberCount}
              contributionAmount={group.contributionAmount}
              contributionFrequency={group.contributionFrequency}
              isPrivate={group.isPrivate}
              currency={group.currency}
              onJoinRequest={handleJoinRequest}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Join Group Modal */}
      {selectedGroup && (
        <JoinGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleJoinSubmit}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default JoinGroupPage; 