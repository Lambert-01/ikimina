import React from 'react';
import { Calendar, Clock, MapPin, Users, FileText, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { formatDate } from '../../lib/utils';

interface MeetingDetailsProps {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  virtualMeetingUrl?: string;
  description?: string;
  agenda?: string[];
  attendeeCount?: number;
  groupName?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  onJoinMeeting?: () => void;
  onEditMeeting?: () => void;
  onCancelMeeting?: () => void;
  className?: string;
}

const MeetingDetails: React.FC<MeetingDetailsProps> = ({
  id,
  title,
  date,
  startTime,
  endTime,
  location,
  virtualMeetingUrl,
  description,
  agenda,
  attendeeCount,
  groupName,
  status,
  onJoinMeeting,
  onEditMeeting,
  onCancelMeeting,
  className
}) => {
  const isVirtual = !!virtualMeetingUrl;
  const canJoin = status === 'scheduled' || status === 'in-progress';
  const isPast = status === 'completed' || status === 'cancelled';
  
  const getStatusBadgeClass = () => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <Card className={`${className || ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold mb-1">{title}</CardTitle>
            {groupName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {groupName}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</h4>
                <p className="text-gray-600 dark:text-gray-400">{formatDate(date)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {startTime}{endTime ? ` - ${endTime}` : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              {isVirtual ? (
                <Video className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
              ) : (
                <MapPin className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isVirtual ? 'Virtual Meeting' : 'Location'}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {isVirtual ? 'Online' : location || 'Not specified'}
                </p>
              </div>
            </div>
            
            {attendeeCount !== undefined && (
              <div className="flex items-start">
                <Users className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendees</h4>
                  <p className="text-gray-600 dark:text-gray-400">{attendeeCount} expected</p>
                </div>
              </div>
            )}
          </div>
          
          {description && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
            </div>
          )}
          
          {agenda && agenda.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Agenda
              </h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1">
                {agenda.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {!isPast && (
            <div className="flex flex-wrap gap-2 mt-6">
              {isVirtual && canJoin && onJoinMeeting && (
                <Button onClick={onJoinMeeting} className="flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              )}
              
              {onEditMeeting && (
                <Button variant="outline" onClick={onEditMeeting}>
                  Edit Meeting
                </Button>
              )}
              
              {onCancelMeeting && (
                <Button variant="destructive" onClick={onCancelMeeting}>
                  Cancel Meeting
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingDetails; 