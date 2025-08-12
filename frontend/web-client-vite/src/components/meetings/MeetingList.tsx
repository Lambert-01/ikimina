import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, Users, ChevronRight, AlertCircle } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import type { Meeting } from '../../services/meetingService';

interface MeetingListProps {
  meetings: Meeting[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const MeetingList: React.FC<MeetingListProps> = ({
  meetings,
  isLoading = false,
  emptyMessage = "No meetings scheduled",
  className
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading meetings...</span>
      </div>
    );
  }

  if (!meetings || meetings.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-2" />
        <h3 className="text-lg font-medium mb-1 text-gray-900 dark:text-dark-text">{emptyMessage}</h3>
        <p className="text-gray-500 dark:text-gray-400">
          No meetings are currently scheduled
        </p>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
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

  const isUpcoming = (date: string) => {
    const meetingDate = new Date(date);
    const today = new Date();
    return meetingDate > today;
  };

  const isSoon = (date: string) => {
    const meetingDate = new Date(date);
    const today = new Date();
    const diffTime = meetingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-card dark:shadow-dark-card overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                  {meeting.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {meeting.groupName}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(meeting.status)}`}>
                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1).replace('-', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
                <div className="flex items-center">
                  <span className={isUpcoming(meeting.date) && isSoon(meeting.date) ? "font-medium text-primary-600 dark:text-primary-400" : ""}>
                    {formatDate(meeting.date)}
                  </span>
                  {isUpcoming(meeting.date) && isSoon(meeting.date) && (
                    <span className="ml-2 inline-flex items-center text-xs font-medium text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Soon
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
                <span>
                  {meeting.startTime}{meeting.endTime ? ` - ${meeting.endTime}` : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                {meeting.virtualMeetingUrl ? (
                  <>
                    <Video className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
                    <span>Virtual Meeting</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
                    <span>{meeting.location || 'Location not specified'}</span>
                  </>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
                <span>
                  {meeting.attendees.filter(a => a.status === 'present' || a.status === 'late').length} / {meeting.attendees.length} attending
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-dark-background/50 px-4 py-2 border-t border-gray-200 dark:border-dark-border">
            <Link
              to={`/member/meetings/${meeting.id}`}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center justify-between"
            >
              View meeting details
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetingList; 