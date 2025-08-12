import api from './api';
import type { MeetingFormData } from '../components/meetings/MeetingScheduler';

export interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  virtualMeetingUrl?: string;
  description?: string;
  agenda: string[];
  groupId: string;
  groupName: string;
  createdBy: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  attendees: {
    id: string;
    name: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    arrivalTime?: string;
    notes?: string;
  }[];
}

export interface MeetingAttendance {
  meetingId: string;
  userId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  arrivalTime?: string;
  notes?: string;
}

// Get all meetings for a group
export const getGroupMeetings = async (groupId: string): Promise<Meeting[]> => {
  try {
    const response = await api.get(`/meetings/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group meetings:', error);
    throw error;
}
};

// Get all meetings for a user
export const getUserMeetings = async (): Promise<Meeting[]> => {
  try {
    const response = await api.get('/meetings/user');
    // Handle both old and new response formats
    if (response.data.success) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching user meetings:', error);
    // Return empty array instead of throwing error to prevent crashes
    return [];
  }
};

// Get a single meeting by ID
export const getMeetingById = async (meetingId: string): Promise<Meeting> => {
  try {
    const response = await api.get(`/meetings/${meetingId}`);
  return response.data;
  } catch (error) {
    console.error(`Error fetching meeting ${meetingId}:`, error);
    throw error;
  }
};

// Create a new meeting
export const createMeeting = async (groupId: string, meetingData: MeetingFormData): Promise<Meeting> => {
  try {
    const response = await api.post(`/meetings/group/${groupId}`, meetingData);
  return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

// Update a meeting
export const updateMeeting = async (meetingId: string, meetingData: Partial<MeetingFormData>): Promise<Meeting> => {
  try {
    const response = await api.put(`/meetings/${meetingId}`, meetingData);
  return response.data;
  } catch (error) {
    console.error(`Error updating meeting ${meetingId}:`, error);
    throw error;
  }
};

// Cancel a meeting
export const cancelMeeting = async (meetingId: string, reason?: string): Promise<Meeting> => {
  try {
    const response = await api.put(`/meetings/${meetingId}/cancel`, { reason });
  return response.data;
  } catch (error) {
    console.error(`Error cancelling meeting ${meetingId}:`, error);
    throw error;
  }
};

// Update attendance for a user
export const updateAttendance = async (
  meetingId: string,
  attendanceData: MeetingAttendance
): Promise<MeetingAttendance> => {
  try {
    const response = await api.put(`/meetings/${meetingId}/attendance`, attendanceData);
  return response.data;
  } catch (error) {
    console.error(`Error updating attendance for meeting ${meetingId}:`, error);
    throw error;
  }
};

// Get attendance for a meeting
export const getMeetingAttendance = async (meetingId: string): Promise<MeetingAttendance[]> => {
  try {
    const response = await api.get(`/meetings/${meetingId}/attendance`);
  return response.data;
  } catch (error) {
    console.error(`Error fetching attendance for meeting ${meetingId}:`, error);
    throw error;
  }
};

// Get upcoming meetings
export const getUpcomingMeetings = async (limit = 5): Promise<Meeting[]> => {
  try {
    const response = await api.get(`/meetings/upcoming?limit=${limit}`);
  return response.data;
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    throw error;
  }
};

// Start a meeting
export const startMeeting = async (meetingId: string): Promise<Meeting> => {
  try {
    const response = await api.put(`/meetings/${meetingId}/start`);
  return response.data;
  } catch (error) {
    console.error(`Error starting meeting ${meetingId}:`, error);
    throw error;
  }
};

// End a meeting
export const endMeeting = async (meetingId: string, summary?: string): Promise<Meeting> => {
  try {
    const response = await api.put(`/meetings/${meetingId}/end`, { summary });
  return response.data;
  } catch (error) {
    console.error(`Error ending meeting ${meetingId}:`, error);
    throw error;
  }
};

export default {
  getGroupMeetings,
  getUserMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  cancelMeeting,
  updateAttendance,
  getMeetingAttendance,
  getUpcomingMeetings,
  startMeeting,
  endMeeting
}; 