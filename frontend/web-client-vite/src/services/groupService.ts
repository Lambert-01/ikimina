import api from './api';

// Types
export interface Group {
  _id: string;
  id: string;
  name: string;
  description: string;
  groupType: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    email?: string;
  };
  managers: string[];
  members: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    role: string;
    status: string;
    joinedAt: string;
    contributions: {
      paid: number;
      outstanding: number;
      lastPaid?: string;
    };
  }>;
  memberCount: number;
  contributionSettings: {
    amount: number;
    frequency: string;
    dueDay?: number;
    dueDayOfWeek?: number;
    gracePeriod: number;
    penaltyAmount: number;
    penaltyType: string;
  };
  loanSettings: {
    enabled: boolean;
    interestRate: number;
    maxLoanMultiplier: number;
    maxDurationMonths: number;
    requiresApproval: boolean;
    minimumContributions: number;
  };
  meetingSettings: {
    frequency: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    location: string;
    durationMinutes: number;
    attendanceRequired: boolean;
  };
  financialSummary: {
    totalContributions: number;
    totalLoans: number;
    outstandingLoans: number;
    totalInterestEarned: number;
    availableFunds: number;
    totalPenalties: number;
  };
  cycle: {
    startDate: string;
    isActive: boolean;
    number: number;
  };
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface CreateGroupData {
  name: string;
  description: string;
  groupType: string;
  contributionAmount: number;
  contributionFrequency: string;
  loanSettings?: {
    enabled: boolean;
    interestRate: number;
    maxLoanMultiplier: number;
    maxDurationMonths: number;
  };
  meetingSettings?: {
    frequency: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
  invitations?: Array<{
    email?: string;
    phoneNumber?: string;
    role: 'member' | 'manager';
  }>;
}

// Create a new group
export const createGroup = async (groupData: CreateGroupData) => {
  const response = await api.post('/api/groups', groupData);
  return response.data;
};

// Get user's member groups
export const getMyGroups = async () => {
  // Fetch both member and managed groups to match UI expectations
  const [memberRes, managedRes] = await Promise.all([
    api.get('/api/groups/member'),
    api.get('/api/groups/managed')
  ]);

  const memberGroups = Array.isArray(memberRes?.data?.data) ? memberRes.data.data : (Array.isArray(memberRes?.data) ? memberRes.data : []);
  const managedGroups = Array.isArray(managedRes?.data?.data) ? managedRes.data.data : (Array.isArray(managedRes?.data) ? managedRes.data : []);

  return {
    success: true,
    data: {
      memberGroups,
      managedGroups
    }
  };
};

// Get user's managed groups
export const getManagedGroups = async () => {
  const response = await api.get('/api/groups/managed');
  // Normalize to array
  if (response.data && response.data.success) {
    return Array.isArray(response.data.data) ? response.data.data : [];
  }
  return Array.isArray(response.data) ? response.data : [];
};

// Get public groups
export const getPublicGroups = async () => {
  const response = await api.get('/api/groups/public');
  const raw = response.data && response.data.success ? response.data.data : response.data;
  const list = Array.isArray(raw) ? raw : [];
  // Map to UI shape expected by JoinGroupPage and GroupCard
  return list.map((g: any) => ({
    id: g.id || g._id,
    name: g.name,
    description: g.description || '',
    memberCount: g.memberCount ?? (Array.isArray(g.members) ? g.members.length : 0),
    contributionAmount: g.contributionSettings?.amount ?? 0,
    contributionFrequency: g.contributionSettings?.frequency ?? 'monthly',
    isPrivate: g.visibility ? g.visibility !== 'public' : false,
    currency: g.contributionSettings?.currency || 'RWF'
  }));
};

// Get pending groups (Admin only)
export const getPendingGroups = async () => {
  const response = await api.get('/api/groups/pending');
  return response.data;
};

// Get group by ID
export const getGroupById = async (groupId: string) => {
  const response = await api.get(`/api/groups/${groupId}`);
  return response.data;
};

// Join a group
export const joinGroup = async (groupId: string, joinCode?: string) => {
  const response = await api.post(`/api/groups/${groupId}/join`, { joinCode });
  return response.data;
};

// Update group
export const updateGroup = async (groupId: string, updates: Partial<CreateGroupData>) => {
  const response = await api.put(`/api/groups/${groupId}`, updates);
  return response.data;
};

// Approve group (Admin only)
export const approveGroup = async (groupId: string) => {
  // 1) Working-server endpoint
  try {
    const response = await api.patch(`/api/groups/${groupId}/approve`);
    return response.data;
  } catch (err1: any) {
    // 2) Admin router POST /admin/groups/approve/:id
    try {
      const response = await api.post(`/admin/groups/approve/${groupId}`, {});
      return response.data;
    } catch (err2: any) {
      // 3) Admin controller PUT /admin/groups/:id/status
      const response = await api.put(`/admin/groups/${groupId}/status`, { status: 'active' });
      return response.data;
    }
  }
};

// Reject group (Admin only)
export const rejectGroup = async (groupId: string, reason?: string) => {
  // 1) Working-server endpoint
  try {
    const response = await api.patch(`/api/groups/${groupId}/reject`, { reason });
    return response.data;
  } catch (err1: any) {
    // 2) Admin router POST /admin/groups/reject/:id
    try {
      const response = await api.post(`/admin/groups/reject/${groupId}`, { reason });
      return response.data;
    } catch (err2: any) {
      // 3) Admin controller PUT /admin/groups/:id/status
      const response = await api.put(`/admin/groups/${groupId}/status`, { status: 'rejected' });
      return response.data;
    }
  }
};

// Get admin groups with pagination and filters
export const getAdminGroups = async (queryString?: string) => {
  const url = queryString ? `/admin/groups?${queryString}` : '/admin/groups';
  const response = await api.get(url);
  const payload = response.data;
  // Normalize different backend shapes into a stable shape for the page
  // Shape A (working-server): { success, data: Group[], pagination }
  // Shape B (controller): { success, data: { groups: Group[], pagination } }
  if (Array.isArray(payload?.data)) {
    return {
      success: !!payload?.success,
      data: payload?.data,
      pagination: payload?.pagination
    };
  }
  return {
    success: !!payload?.success,
    data: payload?.data?.groups || [],
    pagination: payload?.data?.pagination || payload?.pagination
  };
};

// Check manager role
export const checkManagerRole = async (groupId: string) => {
  const response = await api.get(`/api/groups/${groupId}/role`);
  return response.data;
};

export default {
  createGroup,
  getMyGroups,
  getManagedGroups,
  getPublicGroups,
  getPendingGroups,
  getGroupById,
  joinGroup,
  updateGroup,
  approveGroup,
  rejectGroup,
  getAdminGroups,
  checkManagerRole
};