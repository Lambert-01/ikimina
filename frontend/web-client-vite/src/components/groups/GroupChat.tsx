import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Clock, Smile, PaperclipIcon, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatDate } from '../../lib/utils';
import authService from '../../services/authService';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

interface GroupChatProps {
  groupId: string;
  meetingId?: string;
  title?: string;
  className?: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ 
  groupId, 
  meetingId, 
  title = 'Group Discussion',
  className 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = authService.getUserId() || '';
  const currentUserName = authService.getUserName() || 'User';

  // Simulate fetching messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would call an API
        // For demo, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockMessages: Message[] = [
          {
            id: '1',
            senderId: 'user1',
            senderName: 'John Doe',
            content: 'Hello everyone! Welcome to our group discussion.',
            timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
            isCurrentUser: 'user1' === currentUserId
          },
          {
            id: '2',
            senderId: 'user2',
            senderName: 'Jane Smith',
            content: 'Thanks for organizing this meeting. I have a few questions about the agenda.',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            isCurrentUser: 'user2' === currentUserId
          },
          {
            id: '3',
            senderId: currentUserId,
            senderName: currentUserName,
            content: 'I\'m looking forward to discussing our progress on the savings goals.',
            timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
            isCurrentUser: true
          }
        ];
        
        setMessages(mockMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [groupId, meetingId, currentUserId, currentUserName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Create a new message
    const message: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      content: newMessage,
      timestamp: new Date(),
      isCurrentUser: true
    };
    
    // Add to messages
    setMessages([...messages, message]);
    
    // Clear input
    setNewMessage('');
    
    // In a real app, you would send the message to the server here
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessages = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <Smile className="h-12 w-12 mb-2" />
          <p>No messages yet. Start the conversation!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isCurrentUser
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
            >
              {!message.isCurrentUser && (
                <div className="flex items-center mb-1">
                  <Avatar className="h-6 w-6 mr-2 bg-green-500 text-white">
                    <span className="text-xs">{message.senderName.charAt(0)}</span>
                  </Avatar>
                  <span className="text-xs font-medium">{message.senderName}</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              <div className={`flex items-center mt-1 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <Clock className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatMessageTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className || ''}`}>
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-lg font-semibold flex items-center">
          <User className="h-5 w-5 mr-2 text-primary-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {renderMessages()}
        </div>
        
        <form onSubmit={handleSendMessage} className="border-t p-3 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Smile className="h-5 w-5" />
            <span className="sr-only">Add emoji</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <PaperclipIcon className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" className="rounded-full" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GroupChat; 
 