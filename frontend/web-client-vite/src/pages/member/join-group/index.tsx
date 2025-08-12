import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import GroupCard from '../../../components/groups/GroupCard';
import JoinGroupModal from '../../../components/groups/JoinGroupModal';
import { getPublicGroups, joinGroup } from '../../../services/groupService';
import type { Group } from '../../../services/groupService';

const JoinGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  
  // Filter states
  const [province, setProvince] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [minMembers, setMinMembers] = useState<string>('');
  const [maxMembers, setMaxMembers] = useState<string>('');
  
  // Load groups on initial render and when filters change
  useEffect(() => {
    fetchGroups();
  }, [province, district, minMembers, maxMembers]);
  
  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      
      const filters: Record<string, string | number> = {};
      if (searchTerm) filters.search = searchTerm;
      if (province) filters.province = province;
      if (district) filters.district = district;
      if (minMembers) filters.minMembers = parseInt(minMembers);
      if (maxMembers) filters.maxMembers = parseInt(maxMembers);
      
      const response = await getPublicGroups(filters);
      if (response.success) {
        setGroups(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroups();
  };
  
  const clearFilters = () => {
    setProvince('');
    setDistrict('');
    setMinMembers('');
    setMaxMembers('');
  };
  
  const handleJoinGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowJoinModal(true);
  };
  
  const confirmJoinGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      const response = await joinGroup(selectedGroup._id);
      if (response.success) {
        // Check if the join was immediate or pending approval
        if (response.data.status === 'active') {
          navigate(`/member/group/${selectedGroup._id}`);
        } else {
          navigate('/member/dashboard', { 
            state: { 
              joinRequestSent: true, 
              groupName: selectedGroup.name 
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to join group:', error);
    } finally {
      setShowJoinModal(false);
      setSelectedGroup(null);
    }
  };

    return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Join a Group</h1>
          <p className="text-gray-500">Find and join savings groups in your community</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="mt-4 md:mt-0"
        >
          {showFilters ? <X className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
              placeholder="Search groups by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Province</SelectItem>
                    <SelectItem value="kigali">Kigali</SelectItem>
                    <SelectItem value="northern">Northern</SelectItem>
                    <SelectItem value="southern">Southern</SelectItem>
                    <SelectItem value="eastern">Eastern</SelectItem>
                    <SelectItem value="western">Western</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <Select value={district} onValueChange={setDistrict} disabled={!province}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any District</SelectItem>
                    {province === 'kigali' && (
                      <>
                        <SelectItem value="nyarugenge">Nyarugenge</SelectItem>
                        <SelectItem value="gasabo">Gasabo</SelectItem>
                        <SelectItem value="kicukiro">Kicukiro</SelectItem>
                      </>
                    )}
                    {/* Add other districts based on province */}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="minMembers" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Members
                </label>
                <Input
                  id="minMembers"
                  type="number"
                  min="1"
                  placeholder="Min"
                  value={minMembers}
                  onChange={(e) => setMinMembers(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Members
                </label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="1"
                  placeholder="Max"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                />
              </div>
              
              <div className="md:col-span-4 flex justify-end">
                <Button variant="outline" onClick={clearFilters} className="mr-2">
                  Clear Filters
                </Button>
                <Button onClick={() => fetchGroups()}>
                  Apply Filters
                </Button>
              </div>
              </div>
          )}
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Searching for groups...</p>
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              actionUrl="#"
              actionText="Join Group"
              onClick={() => handleJoinGroup(group)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No groups found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search criteria or create your own group</p>
          <Button onClick={() => navigate('/member/create-group')}>
            Create a Group
            </Button>
        </div>
      )}
      
      {selectedGroup && (
        <JoinGroupModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onConfirm={confirmJoinGroup}
          group={selectedGroup}
        />
      )}
    </div>
  );
};

export default JoinGroupPage; 