const express = require('express');
const { protect } = require('../../middleware/auth');
const router = express.Router();

// Mock data for demonstration
const messages = [
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
  }
];

/**
 * @route GET /api/messages/:groupId
 * @desc Get messages for a specific group
 * @access Private
 */
router.get('/:groupId', protect, (req, res) => {
  try {
    const { groupId } = req.params;
    const groupMessages = messages.filter(message => message.groupId === groupId);
    
    res.status(200).json({
      success: true,
      data: groupMessages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route POST /api/messages/:groupId
 * @desc Send a message to a specific group
 * @access Private
 */
router.post('/:groupId', protect, (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Create a new message
    const newMessage = {
      id: Date.now().toString(),
      groupId,
      senderId: req.user.id,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      senderAvatar: null,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    // Add to messages array (in a real app, this would be saved to the database)
    messages.push(newMessage);
    
    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route DELETE /api/messages/:messageId
 * @desc Delete a message
 * @access Private
 */
router.delete('/:messageId', protect, (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Find the message
    const messageIndex = messages.findIndex(message => message.id === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Check if the user is the sender
    if (messages[messageIndex].senderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }
    
    // Remove the message
    messages.splice(messageIndex, 1);
    
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route POST /api/messages/mark-read
 * @desc Mark messages as read
 * @access Private
 */
router.post('/mark-read', protect, (req, res) => {
  try {
    const { messageIds } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message IDs'
      });
    }
    
    // Mark messages as read
    messageIds.forEach(id => {
      const message = messages.find(msg => msg.id === id);
      if (message) {
        message.isRead = true;
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route GET /api/messages/unread-count/:groupId?
 * @desc Get unread message count
 * @access Private
 */
router.get('/unread-count/:groupId?', protect, (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Count unread messages
    const unreadMessages = messages.filter(
      message => !message.isRead && 
                message.senderId !== req.user.id && 
                (groupId ? message.groupId === groupId : true)
    );
    
    res.status(200).json({
      success: true,
      data: {
        count: unreadMessages.length
      }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 