import React, { useState } from 'react';
import { Check, X, UserCheck, Clock, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatDate } from '../../lib/utils';

interface Attendee {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  arrivalTime?: string;
  notes?: string;
}

interface MeetingAttendanceProps {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  attendees: Attendee[];
  isEditable?: boolean;
  onUpdateAttendance?: (attendeeId: string, status: 'present' | 'absent' | 'late' | 'excused', notes?: string) => void;
  className?: string;
}

const MeetingAttendance: React.FC<MeetingAttendanceProps> = ({
  meetingId,
  meetingTitle,
  meetingDate,
  attendees,
  isEditable = false,
  onUpdateAttendance,
  className
}) => {
  const [editableAttendees, setEditableAttendees] = useState<Attendee[]>(attendees);
  const [editingAttendeeId, setEditingAttendeeId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');

  const handleStatusChange = (attendeeId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    if (!isEditable) return;
    
    const updatedAttendees = editableAttendees.map(attendee => 
      attendee.id === attendeeId ? { ...attendee, status } : attendee
    );
    
    setEditableAttendees(updatedAttendees);
    
    if (onUpdateAttendance) {
      const attendee = editableAttendees.find(a => a.id === attendeeId);
      onUpdateAttendance(attendeeId, status, attendee?.notes);
    }
  };

  const handleEditNotes = (attendeeId: string) => {
    setEditingAttendeeId(attendeeId);
    const attendee = editableAttendees.find(a => a.id === attendeeId);
    setEditNotes(attendee?.notes || '');
  };

  const handleSaveNotes = (attendeeId: string) => {
    const updatedAttendees = editableAttendees.map(attendee => 
      attendee.id === attendeeId ? { ...attendee, notes: editNotes } : attendee
    );
    
    setEditableAttendees(updatedAttendees);
    setEditingAttendeeId(null);
    
    if (onUpdateAttendance) {
      const attendee = updatedAttendees.find(a => a.id === attendeeId);
      if (attendee) {
        onUpdateAttendance(attendeeId, attendee.status, editNotes);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <X className="h-5 w-5 text-red-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'excused':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'excused':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <Card className={`${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold">{meetingTitle}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {formatDate(meetingDate)}
            </span>
          </div>
          <div className="flex items-center">
            <UserCheck className="h-5 w-5 text-primary-500 mr-2" />
            <span className="text-sm font-medium">
              {editableAttendees.filter(a => a.status === 'present' || a.status === 'late').length} / {editableAttendees.length} present
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Member</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                {isEditable && (
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                )}
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Notes</th>
              </tr>
            </thead>
            <tbody>
              {editableAttendees.map((attendee) => (
                <tr key={attendee.id} className="border-b dark:border-gray-700 last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {attendee.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(attendee.status)}`}>
                      {getStatusIcon(attendee.status)}
                      <span className="ml-1 capitalize">{attendee.status}</span>
                    </span>
                    {attendee.arrivalTime && attendee.status === 'late' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({attendee.arrivalTime})
                      </span>
                    )}
                  </td>
                  {isEditable && (
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant={attendee.status === 'present' ? 'default' : 'outline'}
                          className="h-8 w-8 p-0"
                          onClick={() => handleStatusChange(attendee.id, 'present')}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Present</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={attendee.status === 'absent' ? 'default' : 'outline'}
                          className="h-8 w-8 p-0"
                          onClick={() => handleStatusChange(attendee.id, 'absent')}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Absent</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={attendee.status === 'late' ? 'default' : 'outline'}
                          className="h-8 w-8 p-0"
                          onClick={() => handleStatusChange(attendee.id, 'late')}
                        >
                          <Clock className="h-4 w-4" />
                          <span className="sr-only">Late</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={attendee.status === 'excused' ? 'default' : 'outline'}
                          className="h-8 w-8 p-0"
                          onClick={() => handleStatusChange(attendee.id, 'excused')}
                        >
                          <Calendar className="h-4 w-4" />
                          <span className="sr-only">Excused</span>
                        </Button>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {editingAttendeeId === attendee.id ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="form-input text-sm py-1 px-2 w-full"
                          placeholder="Add notes..."
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-2"
                          onClick={() => handleSaveNotes(attendee.id)}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span>{attendee.notes || '-'}</span>
                        {isEditable && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditNotes(attendee.id)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingAttendance; 