import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image, Smile, MoreVertical, Trash2, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { format } from 'date-fns';
import authService from '../../services/authService';
import messageService from '../../services/messageService';
import type { Message } from '../../services/messageService';
import { toast } from 'react-toastify';

interface MessageListProps {
  groupId: string;
  groupName: string;
}

const MessageList: React.FC<MessageListProps> = ({ groupId, groupName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = authService.getUserId() || '';
  
  useEffect(() => {
    fetchMessages();
  }, [groupId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      // Fetch messages for the current group
      const fetchedMessages = await messageService.getMessages(groupId);
      setMessages(fetchedMessages);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setIsSending(true);
      
      // Send the new message
      const sentMessage = await messageService.sendMessage(groupId, newMessage);
      
      if (sentMessage) {
        // Add the new message to the list
        setMessages(prev => [...prev, sentMessage]);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const success = await messageService.deleteMessage(messageId);
      
      if (success) {
        setMessages(messages.filter(message => message.id !== messageId));
        toast.success('Message deleted');
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      try {
        setIsSending(true);
        
        // Send message with attachment
        const sentMessage = await messageService.sendMessage(
          groupId, 
          files[0].name.endsWith('.jpg') || files[0].name.endsWith('.png') 
            ? '📷 Image' 
            : `📎 File: ${files[0].name}`,
          [files[0]]
        );
        
        if (sentMessage) {
          setMessages(prev => [...prev, sentMessage]);
        }
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload file');
      } finally {
        setIsSending(false);
      }
    }
  };
  
  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'MMM d, h:mm a');
    }
    
    // Otherwise show full date
    return format(date, 'MMM d, yyyy, h:mm a');
  };
  
  const isCurrentUser = (senderId: string) => {
    return senderId === currentUserId;
  };

  // Helper to get the right icon based on attachment type
  const getAttachmentIcon = (type: 'image' | 'document' | 'audio') => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4 mr-2" />;
      case 'audio':
        return <Paperclip className="h-4 w-4 mr-2" />;
      case 'document':
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
            {groupName.charAt(0)}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{groupName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{messages.length} messages</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </Button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading messages...</span>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${isCurrentUser(message.senderId) ? 'justify-end' : 'justify-start'}`}
          >
              <div className={`flex ${isCurrentUser(message.senderId) ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[80%] group`}>
              {!isCurrentUser(message.senderId) && (
                <Avatar className="h-8 w-8 mr-2">
                    {message.senderAvatar ? (
                      <img src={message.senderAvatar} alt={message.senderName} className="h-full w-full rounded-full" />
                    ) : (
                  <div className="bg-primary-500 text-white h-full w-full flex items-center justify-center rounded-full">
                    {message.senderName.charAt(0)}
                  </div>
                    )}
                </Avatar>
              )}
              
                <div className="relative">
                <div className={`rounded-lg px-4 py-2 inline-block ${
                  isCurrentUser(message.senderId)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                    {!isCurrentUser(message.senderId) && (
                      <p className="text-xs mb-1 font-medium text-gray-500 dark:text-gray-300">
                        {message.senderName}
                      </p>
                    )}
                  <p>{message.content}</p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div 
                          key={index}
                          className="flex items-center p-2 rounded bg-white/20 dark:bg-black/20"
                        >
                            {getAttachmentIcon(attachment.type)}
                          <span className="text-sm truncate">{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                  {isCurrentUser(message.senderId) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </Button>
                  )}
                </div>
                
                <span className={`text-xs text-gray-500 dark:text-gray-400 mx-2`}>
                  {formatMessageDate(message.timestamp)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleFileUpload}
            disabled={isSending}
          >
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <Smile className="h-5 w-5 text-gray-500" />
          </Button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="rounded-full bg-primary-600 hover:bg-primary-700"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
            <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageList; 