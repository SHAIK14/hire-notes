const Message = require('../models/Message');
const Candidate = require('../models/Candidate');
const User = require('../models/User');

const getMessagesByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const messages = await Message.find({ candidateId })
      .populate('sender', 'name email')
      .populate('mentions.userId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalMessages = await Message.countDocuments({ candidateId });
    const totalPages = Math.ceil(totalMessages / limit);

    res.json({
      messages: messages.reverse(),
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

const createMessage = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    const mentionUsers = await User.find({ 
      name: { $in: mentions } 
    }).select('_id name');

    const message = new Message({
      candidateId,
      sender: req.user._id,
      content: content.trim(),
      mentions: mentionUsers.map(user => ({
        userId: user._id,
        username: user.name
      }))
    });

    await message.save();
    await message.populate([
      { path: 'sender', select: 'name email' },
      { path: 'mentions.userId', select: 'name' }
    ]);

    await Candidate.findByIdAndUpdate(candidateId, {
      $inc: { messageCount: 1 }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Failed to create message' });
  }
};

const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    const mentionUsers = await User.find({ 
      name: { $in: mentions } 
    }).select('_id name');

    message.content = content.trim();
    message.mentions = mentionUsers.map(user => ({
      userId: user._id,
      username: user.name
    }));
    
    await message.save();
    await message.populate([
      { path: 'sender', select: 'name email' },
      { path: 'mentions.userId', select: 'name' }
    ]);

    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Failed to update message' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);
    await Candidate.findByIdAndUpdate(message.candidateId, {
      $inc: { messageCount: -1 }
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const existingRead = message.readBy.find(
      read => read.userId.toString() === req.user._id
    );

    if (!existingRead) {
      message.readBy.push({
        userId: req.user._id,
        readAt: new Date()
      });
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
};

module.exports = {
  getMessagesByCandidate,
  createMessage,
  updateMessage,
  deleteMessage,
  markMessageAsRead
};