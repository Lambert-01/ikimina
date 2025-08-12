import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MessageCircle, Send, User } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import useAuthStore from '../../../store/authStore';

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // Load messages when component mounts
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from API
      setMessages([
        {
          id: 1,
          sender: 'John Doe',
          content: 'Welcome to the group!',
          timestamp: new Date().toISOString(),
          groupName: 'Women Entrepreneurs'
        },
        {
          id: 2,
          sender: 'Jane Smith',
          content: 'Thank you for joining us.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          groupName: 'Village Savings'
        }
      ]);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      // In a real app, this would send to API
      const message = {
        id: Date.now(),
        sender: `${user?.firstName} ${user?.lastName}`,
        content: newMessage,
        timestamp: new Date().toISOString(),
        groupName: 'Current Group'
      };
      
      setMessages(prev => [message, ...prev]);
      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <MessageCircle className="h-8 w-8 text-primary-600 mr-3" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">Communicate with your group members</p>
        </div>
      </div>

      {/* Send Message */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Send New Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-h-[100px] p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button onClick={sendMessage} className="self-end">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border-l-4 border-primary-500 pl-4 py-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">{message.sender}</span>
                      <span className="text-sm text-gray-500 ml-2">in {message.groupName}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{message.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Start a conversation with your group members</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesPage;