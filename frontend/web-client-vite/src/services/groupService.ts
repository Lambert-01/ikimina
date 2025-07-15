import api from './api';

interface GroupData {
  name: string;
  description: string;
  contributionAmount: number;
  contributionFrequency: string;
  maxMembers?: number;
  minMembers?: number;
  payoutMechanism: string;
  rules?: {
    latePaymentPenalty?: number;
    loanInterestRate?: number;
    voteThreshold?: number;
    loanEnabled?: boolean;
  };
}

interface InviteData {
  email?: string;
  phoneNumber?: string;
  role?: 'member' | 'manager';
  message?: string;
}

interface JoinRequestData {
  groupId: string;
  motivation: string;
  identificationDocument?: File;
  phoneNumber: string;
  email?: string;
}

interface QuickStats {
  totalContributions: number;
  upcomingPayments: number;
  activeGroups: number;
  totalLoans: number;
}

export const groupService = {
  createGroup: async (groupData: GroupData) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  },
  
  getGroups: async (filter?: string) => {
    const response = await api.get(`/groups${filter ? `?filter=${filter}` : ''}`);
    return response.data;
  },
  
  getGroupById: async (id: string) => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },
  
  updateGroup: async (id: string, groupData: Partial<GroupData>) => {
    const response = await api.put(`/groups/${id}`, groupData);
    return response.data;
  },
  
  deleteGroup: async (id: string) => {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  },
  
  inviteMembers: async (groupId: string, invites: InviteData[]) => {
    const response = await api.post(`/groups/${groupId}/invite`, { invites });
    return response.data;
  },
  
  joinGroup: async (groupId: string, joinData?: JoinRequestData) => {
    // If joinData is provided, it's a detailed join request
    if (joinData) {
      // Create a FormData instance for file upload
      const formData = new FormData();
      formData.append('groupId', groupId);
      formData.append('motivation', joinData.motivation);
      formData.append('phoneNumber', joinData.phoneNumber);
      
      if (joinData.email) {
        formData.append('email', joinData.email);
      }
      
      if (joinData.identificationDocument) {
        formData.append('identificationDocument', joinData.identificationDocument);
      }
      
      const response = await api.post(`/groups/${groupId}/join-request`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    }
    
    // Simple join request (for public groups)
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data;
  },
  
  getPendingJoinRequests: async (userId?: string) => {
    const endpoint = userId 
      ? `/groups/join-requests/user/${userId}` 
      : '/groups/join-requests';
    const response = await api.get(endpoint);
    return response.data;
  },
  
  approveJoinRequest: async (requestId: string) => {
    const response = await api.post(`/groups/join-requests/${requestId}/approve`);
    return response.data;
  },
  
  rejectJoinRequest: async (requestId: string, reason?: string) => {
    const response = await api.post(`/groups/join-requests/${requestId}/reject`, { reason });
    return response.data;
  },
  
  acceptInvite: async (inviteToken: string) => {
    const response = await api.post(`/groups/invite/accept/${inviteToken}`);
    return response.data;
  },
  
  rejectInvite: async (inviteToken: string) => {
    const response = await api.post(`/groups/invite/reject/${inviteToken}`);
    return response.data;
  },
  
  removeMember: async (groupId: string, memberId: string) => {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data;
  },
  
  getGroupMembers: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
  },
  
  getQuickStats: async () => {
    const response = await api.get('/groups/stats/quick');
    return response.data;
  },
  
  getGroupRules: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/rules`);
    return response.data;
  },
  
  updateGroupRules: async (groupId: string, rules: any[]) => {
    const response = await api.put(`/groups/${groupId}/rules`, { rules });
    return response.data;
  },
  
  leaveGroup: async (groupId: string, reason?: string) => {
    const response = await api.post(`/groups/${groupId}/leave`, { reason });
    return response.data;
  },
  
  promoteToManager: async (groupId: string, memberId: string) => {
    const response = await api.post(`/groups/${groupId}/members/${memberId}/promote`);
    return response.data;
  },
  
  demoteToMember: async (groupId: string, managerId: string) => {
    const response = await api.post(`/groups/${groupId}/members/${managerId}/demote`);
    return response.data;
  }
};

export default groupService; 