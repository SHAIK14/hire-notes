const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Candidate = require('../models/Candidate');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const detectMentions = (content) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

const handleConnection = (io) => {
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    console.log(`👤 User ${socket.user.name} connected: ${socket.id}`);
    
    try {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: true,
        lastOnline: new Date()
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
    
    socket.on('join-candidate-room', (candidateId) => {
      console.log(`🚪 User ${socket.user.name} joined candidate room: ${candidateId}`);
      socket.join(`candidate_${candidateId}`);
    });

    socket.on('leave-candidate-room', (candidateId) => {
      console.log(`🚪 User ${socket.user.name} left candidate room: ${candidateId}`);
      socket.leave(`candidate_${candidateId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { candidateId, content } = data;
        
        if (!candidateId || !content?.trim()) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
          socket.emit('error', { message: 'Candidate not found' });
          return;
        }

        const mentions = detectMentions(content);
        const mentionUsers = await User.find({ 
          name: { $in: mentions } 
        }).select('_id name');

        const message = new Message({
          candidateId,
          sender: socket.userId,
          content: content.trim(),
          mentions: mentionUsers.map(user => ({
            userId: user._id,
            username: user.name
          }))
        });

        await message.save();
        await message.populate([
          { path: 'sender', select: 'name email' },
          { path: 'candidateId', select: 'name' }
        ]);

        await Candidate.findByIdAndUpdate(candidateId, {
          $inc: { messageCount: 1 }
        });

        const messageData = {
          _id: message._id,
          candidateId: message.candidateId._id,
          sender: {
            _id: message.sender._id,
            name: message.sender.name,
            email: message.sender.email
          },
          content: message.content,
          mentions: message.mentions,
          createdAt: message.createdAt,
          isEdited: message.isEdited
        };

        io.to(`candidate_${candidateId}`).emit('new-message', messageData);

        for (const mentionUser of mentionUsers) {
          if (mentionUser._id.toString() !== socket.userId) {
            const notification = new Notification({
              recipient: mentionUser._id,
              sender: socket.userId,
              type: 'mention',
              candidateId,
              messageId: message._id,
              content: `@${socket.user.name} mentioned you: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
              candidateName: candidate.name
            });

            await notification.save();
            await notification.populate([
              { path: 'sender', select: 'name' },
              { path: 'candidateId', select: 'name' }
            ]);

            const notificationData = {
              _id: notification._id,
              type: notification.type,
              candidateId: notification.candidateId._id,
              candidateName: notification.candidateName,
              content: notification.content,
              sender: notification.sender.name,
              createdAt: notification.createdAt,
              isRead: notification.isRead
            };

            io.emit('new-notification', { 
              userId: mentionUser._id.toString(), 
              notification: notificationData 
            });
          }
        }

        console.log(`💬 Message sent by ${socket.user.name} to candidate ${candidateId}`);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('mark-notification-read', async (notificationId) => {
      try {
        await Notification.findOneAndUpdate(
          { _id: notificationId, recipient: socket.userId },
          { isRead: true, readAt: new Date() }
        );
        
        socket.emit('notification-read', { notificationId });
        console.log(`📖 Notification ${notificationId} marked as read by ${socket.user.name}`);
        
      } catch (error) {
        console.error('Error marking notification as read:', error);
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    socket.on('typing', (data) => {
      const { candidateId, isTyping } = data;
      socket.to(`candidate_${candidateId}`).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping
      });
    });

    socket.on('disconnect', async () => {
      console.log(`👋 User ${socket.user.name} disconnected: ${socket.id}`);
      
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastOnline: new Date()
        });
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    });
  });
};

module.exports = { handleConnection };