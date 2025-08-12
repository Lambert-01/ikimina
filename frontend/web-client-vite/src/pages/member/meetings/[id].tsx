import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Video, MessageSquare } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import MeetingDetails from '../../../components/meetings/MeetingDetails';
import MeetingAttendance from '../../../components/meetings/MeetingAttendance';
import { getMeetingById, updateAttendance } from '../../../services/meetingService';
import type { Meeting, MeetingAttendance as MeetingAttendanceType } from '../../../services/meetingService';
import GroupChat from '../../../components/groups/GroupChat';

const MeetingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  
  useEffect(() => {
    if (!id) return;
    
    const fetchMeeting = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getMeetingById(id);
        setMeeting(data);
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError('Failed to load meeting details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeeting();
  }, [id]);
  
  const handleUpdateAttendance = async (
    attendeeId: string,
    status: 'present' | 'absent' | 'late' | 'excused',
    notes?: string
  ) => {
    if (!id) return;
    
    try {
      const attendanceData: MeetingAttendanceType = {
        meetingId: id,
        userId: attendeeId,
        status,
        notes
      };
      
      await updateAttendance(id, attendanceData);
      
      // Update local state
      if (meeting) {
        const updatedAttendees = meeting.attendees.map(attendee => 
          attendee.id === attendeeId ? { ...attendee, status, notes: notes || attendee.notes } : attendee
        );
        
        setMeeting({
          ...meeting,
          attendees: updatedAttendees
        });
      }
    } catch (err) {
      console.error('Error updating attendance:', err);
    }
  };
  
  const handleJoinMeeting = () => {
    if (meeting?.virtualMeetingUrl) {
      window.open(meeting.virtualMeetingUrl, '_blank');
    }
  };
  
  const handleGoBack = () => {
    navigate('/member/meetings');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !meeting) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {error || 'Meeting not found'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find the meeting you're looking for.
              </p>
              <Button onClick={handleGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Meetings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{meeting.title}</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Meeting Details
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="discussion" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Group Discussion
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <MeetingDetails
            id={meeting.id}
            title={meeting.title}
            date={meeting.date}
            startTime={meeting.startTime}
            endTime={meeting.endTime}
            location={meeting.location}
            virtualMeetingUrl={meeting.virtualMeetingUrl}
            description={meeting.description}
            agenda={meeting.agenda}
            attendeeCount={meeting.attendees.length}
            groupName={meeting.groupName}
            status={meeting.status}
            onJoinMeeting={meeting.virtualMeetingUrl ? handleJoinMeeting : undefined}
          />
        </TabsContent>
        
        <TabsContent value="attendance">
          <MeetingAttendance
            meetingId={meeting.id}
            meetingTitle={meeting.title}
            meetingDate={meeting.date}
            attendees={meeting.attendees}
            onUpdateAttendance={handleUpdateAttendance}
          />
        </TabsContent>
        
        <TabsContent value="discussion">
          <Card>
            <CardContent className="p-6">
              <GroupChat 
                groupId={meeting.groupId} 
                meetingId={meeting.id}
                title={`Discussion: ${meeting.title}`}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeetingDetailPage; 