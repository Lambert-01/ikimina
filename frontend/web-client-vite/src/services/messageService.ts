import api from './api';

export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Array<{
    type: 'image' | 'document' | 'audio';
    url: string;
    name: string;
  }>;
}

// Mock messages for development (these would come from the API in production)
const mockMessages: Message[] = [
  {
    id: '1',
    groupId: '1',
    senderId: 'member1',
    senderName: 'John Doe',
    senderAvatar: 'https://i.pravatar.cc/150?img=1',
    content: 'Hello everyone! When is our next meeting?',
    timestamp: '2023-09-15T08:30:00Z',
    isRead: true
  },
  {
    id: '2',
    groupId: '1',
    senderId: 'manager1',
    senderName: 'Sarah Manager',
    senderAvatar: 'https://i.pravatar.cc/150?img=5',
    content: "Good morning! Our next meeting is scheduled for this Saturday at 2 PM. Don't forget to bring your contribution.",
    timestamp: '2023-09-15T08:35:00Z',
    isRead: true
  },
  {
    id: '3',
    groupId: '1',
    senderId: 'member2',
    senderName: 'Alice Smith',
    senderAvatar: 'https://i.pravatar.cc/150?img=2',
    content: "Thanks for the reminder. I'll be there!",
    timestamp: '2023-09-15T08:40:00Z',
    isRead: false
  },
  {
    id: '4',
    groupId: '1',
    senderId: 'member3',
    senderName: 'Robert Johnson',
    senderAvatar: 'https://i.pravatar.cc/150?img=3',
    content: "I might be a few minutes late, but I'll definitely attend.",
    timestamp: '2023-09-15T09:15:00Z',
    isRead: false
  },
  {
    id: '5',
    groupId: '2',
    senderId: 'manager1',
    senderName: 'Sarah Manager',
    senderAvatar: 'https://i.pravatar.cc/150?img=5',
    content: 'Investment opportunity discussion tomorrow at 3 PM.',
    timestamp: '2023-09-15T10:30:00Z',
    isRead: true
  },
  {
    id: '6',
    groupId: '2',
    senderId: 'member1',
    senderName: 'John Doe',
    senderAvatar: 'https://i.pravatar.cc/150?img=1',
    content: "I'll prepare the presentation about the opportunity.",
    timestamp: '2023-09-15T10:45:00Z',
    isRead: false
  }
];

const messageService = {
  /**
   * Get messages for a specific group
   */
  getMessages: async (groupId: string): Promise<Message[]> => {
    try {
      // In a real app, this would be an API call
      // const response = await api.get<{ success: boolean; data: Message[] }>(`/messages/${groupId}`);
      // return response.data.data;
      
      // For development, return mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return mockMessages.filter(message => message.groupId === groupId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },
  
  /**
   * Send a new message to a group
   */
  sendMessage: async (groupId: string, content: string, attachments?: File[]): Promise<Message | null> => {
    try {
      // In a real app, this would be an API call
      // const formData = new FormData();
      // formData.append('content', content);
      // if (attachments) {
      //   attachments.forEach(file => formData.append('attachments', file));
      // }
      // const response = await api.post<{ success: boolean; data: Message }>(`/messages/${groupId}`, formData);
      // return response.data.data;
      
      // For development, simulate adding a message to mock data
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      // Get current user info (in real app, would come from auth service)
      const currentUserId = localStorage.getItem('userId') || 'member1';
      const userName = localStorage.getItem('userName') || 'John Doe';
      
      const newMessage: Message = {
        id: Date.now().toString(),
        groupId,
        senderId: currentUserId,
        senderName: userName,
        senderAvatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10) + 1}`,
        content,
        timestamp: new Date().toISOString(),
        isRead: false,
        attachments: attachments ? attachments.map(file => ({
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('audio/') ? 'audio' : 'document',
          url: URL.createObjectURL(file),
          name: file.name
        })) : undefined
      };
      
      mockMessages.push(newMessage);
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },
  
  /**
   * Delete a message
   */
  deleteMessage: async (messageId: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      // await api.delete(`/messages/${messageId}`);
      
      // For development, simulate removing from mock data
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      const messageIndex = mockMessages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex !== -1) {
        mockMessages.splice(messageIndex, 1);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  },
  
  /**
   * Mark messages as read
   */
  markAsRead: async (messageIds: string[]): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      // await api.post('/messages/mark-read', { messageIds });
      
      // For development, simulate marking as read in mock data
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
      messageIds.forEach(id => {
        const message = mockMessages.find(msg => msg.id === id);
        if (message) {
          message.isRead = true;
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  },
  
  /**
   * Get unread message count for user
   */
  getUnreadCount: async (groupId?: string): Promise<number> => {
    try {
      // In a real app, this would be an API call
      // const response = await api.get<{ success: boolean; data: { count: number } }>(
      //   groupId ? `/messages/unread-count/${groupId}` : '/messages/unread-count'
      // );
      // return response.data.data.count;
      
      // For development, count unread messages in mock data
      const currentUserId = localStorage.getItem('userId') || 'member1';
      const unreadMessages = mockMessages.filter(
        msg => !msg.isRead && msg.senderId !== currentUserId && (groupId ? msg.groupId === groupId : true)
      );
      
      return unreadMessages.length;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }
};

export default messageService; 