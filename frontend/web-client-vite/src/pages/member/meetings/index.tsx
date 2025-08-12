import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Calendar, Search, Plus, Filter } from 'lucide-react';
import MeetingList from '../../../components/meetings/MeetingList';
import MeetingScheduler from '../../../components/meetings/MeetingScheduler';
import { getUserMeetings, createMeeting } from '../../../services/meetingService';
import type { Meeting } from '../../../services/meetingService';
import type { MeetingFormData } from '../../../components/meetings/MeetingScheduler';

const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  useEffect(() => {
    fetchMeetings();
  }, []);
  
  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getUserMeetings();
      // The service now handles errors gracefully and always returns an array
      setMeetings(data);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings. Please try again later.');
      setMeetings([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleMeeting = async (meetingData: MeetingFormData) => {
    try {
      // In a real app, you would get the groupId from the selected group
      const groupId = 'sample-group-id';
      
      await createMeeting(groupId, meetingData);
      
      // Refresh meetings list
      fetchMeetings();
    } catch (err) {
      console.error('Error scheduling meeting:', err);
      // Show error notification
    }
  };

  const filterMeetings = (status: 'upcoming' | 'past' | 'all') => {
    if (isLoading || !meetings || !Array.isArray(meetings)) return [];
    
    const now = new Date();
    let filtered = [...meetings];
    
    // Apply status filter
    if (status === 'upcoming') {
      filtered = filtered.filter(meeting => 
        (meeting.status === 'scheduled' || meeting.status === 'in-progress') && 
        new Date(meeting.date) >= now
      );
    } else if (status === 'past') {
      filtered = filtered.filter(meeting => 
        meeting.status === 'completed' || 
        meeting.status === 'cancelled' || 
        new Date(meeting.date) < now
      );
    }
    
    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting => 
        meeting.title.toLowerCase().includes(query) || 
        meeting.groupName.toLowerCase().includes(query) ||
        (meeting.description && meeting.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  // Sort meetings by date (most recent first for past, soonest first for upcoming)
  const sortMeetings = (meetings: Meeting[], isPast = false) => {
    return [...meetings].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return isPast ? dateB - dateA : dateA - dateB;
    });
  };
  
  const upcomingMeetings = sortMeetings(filterMeetings('upcoming'));
  const pastMeetings = sortMeetings(filterMeetings('past'), true);
  const allMeetings = sortMeetings(filterMeetings('all'));
    
    return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Meetings</h1>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full md:w-64"
            />
          </div>
          
          <MeetingScheduler
            groupId="sample-group-id"
            groupName="Sample Group"
            onScheduleMeeting={handleScheduleMeeting}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Upcoming ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Past ({pastMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            All ({allMeetings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <MeetingList
            meetings={upcomingMeetings}
            isLoading={isLoading}
            emptyMessage="No upcoming meetings"
          />
        </TabsContent>
        
        <TabsContent value="past">
          <MeetingList
            meetings={pastMeetings}
            isLoading={isLoading}
            emptyMessage="No past meetings"
          />
        </TabsContent>
        
        <TabsContent value="all">
          <MeetingList
            meetings={allMeetings}
            isLoading={isLoading}
            emptyMessage="No meetings found"
          />
        </TabsContent>
      </Tabs>
      
      {error && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={fetchMeetings}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage; 