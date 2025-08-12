import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Calendar, X, MapPin, Video, Clock, Users, ChevronRight, Edit, Trash } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { getGroupMeetings } from '../../../services/meetingService';
import { getMyGroups } from '../../../services/groupService';
import type { Meeting } from '../../../services/meetingService';
import type { Group } from '../../../services/groupService';

const ManagerMeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Data states
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [managedGroups, setManagedGroups] = useState<Group[]>([]);
  
  // Filter states
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's managed groups
      const groupsResponse = await getMyGroups();
      if (groupsResponse.success) {
        const groups = groupsResponse.data.managedGroups || [];
        setManagedGroups(groups);
        
        // If there's only one group, select it automatically
        if (groups.length === 1) {
          setSelectedGroupId(groups[0]._id);
          await fetchMeetingsForGroup(groups[0]._id);
        } else if (groups.length > 0) {
          // If there are multiple groups, show the filter
          setShowFilters(true);
        } else {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setIsLoading(false);
    }
  };
  
  const fetchMeetingsForGroup = async (groupId: string) => {
    if (!groupId) return;
    
    try {
      setIsLoading(true);
      
      const response = await getGroupMeetings(groupId);
      if (response.success) {
        setMeetings(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGroupChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    
    if (groupId) {
      await fetchMeetingsForGroup(groupId);
    } else {
      setMeetings([]);
    }
  };
  
  const handleCreateMeeting = () => {
    navigate('/manager/meetings/create', { state: { groupId: selectedGroupId } });
  };
  
  const handleEditMeeting = (meetingId: string) => {
    navigate(`/manager/meetings/${meetingId}/edit`);
  };
  
  const handleViewMeeting = (meetingId: string) => {
    navigate(`/manager/meetings/${meetingId}`);
  };
  
  // Helper function to determine meeting status
  const getMeetingTimeStatus = (meeting: Meeting): 'upcoming' | 'in_progress' | 'past' | 'cancelled' => {
    if (meeting.status === 'cancelled') {
      return 'cancelled';
    }
    
    const now = new Date();
    const meetingDate = new Date(`${meeting.date}T${meeting.startTime}`);
    const endDate = new Date(`${meeting.date}T${meeting.endTime}`);
    
    if (now < meetingDate) {
      return 'upcoming';
    } else if (now >= meetingDate && now <= endDate) {
      return 'in_progress';
    } else {
      return 'past';
    }
  };
  
  // Filter meetings based on status
  const upcomingMeetings = meetings
    .filter(meeting => getMeetingTimeStatus(meeting) === 'upcoming')
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  
  const pastMeetings = meetings
    .filter(meeting => getMeetingTimeStatus(meeting) === 'past')
    .sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime());
  
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: 'upcoming' | 'in_progress' | 'past' | 'cancelled'): string => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'past':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Render meeting card
  const renderMeetingCard = (meeting: Meeting) => {
    const timeStatus = getMeetingTimeStatus(meeting);
    const isPast = timeStatus === 'past';
    
    return (
      <Card key={meeting._id} className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{meeting.title}</CardTitle>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(timeStatus)}`}>
              {timeStatus.charAt(0).toUpperCase() + timeStatus.slice(1)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatDate(meeting.date)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            {meeting.isVirtual ? (
              <>
                <Video className="h-4 w-4 mr-2 text-gray-400" />
                <span>Virtual Meeting</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{meeting.location?.address || 'Location TBD'}</span>
              </>
            )}
          </div>
          
          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                {meeting.attendees.filter(a => a.status === 'attending').length} attending, 
                {' '}{meeting.attendees.filter(a => a.status === 'not_attending').length} not attending,
                {' '}{meeting.attendees.filter(a => a.status === 'maybe').length} maybe
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-primary-600"
              onClick={() => handleViewMeeting(meeting._id)}
            >
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            
            <div className="flex space-x-2">
              {!isPast && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => handleEditMeeting(meeting._id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Meetings</h1>
          <p className="text-gray-500">Create and manage meetings for your groups</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          {!showFilters && managedGroups.length > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(true)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Select Group
            </Button>
          )}
          <Button 
            onClick={handleCreateMeeting}
            disabled={!selectedGroupId}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Meeting
          </Button>
        </div>
      </div>
      
      {/* Group Selection */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="groupSelect" className="block text-sm font-medium mb-1">Select Group</label>
                <select
                  id="groupSelect"
                  value={selectedGroupId}
                  onChange={handleGroupChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a group</option>
                  {managedGroups.map((group) => (
                    <option key={group._id} value={group._id}>{group.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                {managedGroups.length > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(false)}
                    className="flex-shrink-0"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Hide
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* No Group Selected Message */}
      {!selectedGroupId && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Group Selected</h3>
          <p className="text-gray-500 mb-4">Please select a group to manage meetings</p>
          {managedGroups.length === 0 ? (
            <p className="text-amber-600">You don't have any groups that you manage</p>
          ) : (
            <Button onClick={() => setShowFilters(true)}>
              Select Group
            </Button>
          )}
        </div>
      )}
      
      {/* Meetings Tabs */}
      {selectedGroupId && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastMeetings.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading upcoming meetings...</p>
              </div>
            ) : upcomingMeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingMeetings.map(meeting => renderMeetingCard(meeting))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming meetings</h3>
                <p className="text-gray-500 mb-4">You don't have any upcoming meetings scheduled</p>
                <Button onClick={handleCreateMeeting}>
                  Schedule a Meeting
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading past meetings...</p>
              </div>
            ) : pastMeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastMeetings.map(meeting => renderMeetingCard(meeting))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No past meetings</h3>
                <p className="text-gray-500">You don't have any past meetings</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ManagerMeetingsPage; 