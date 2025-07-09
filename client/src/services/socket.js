import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinCandidateRoom(candidateId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-candidate-room', candidateId);
      console.log(`🚪 Joined candidate room: ${candidateId}`);
    }
  }

  leaveCandidateRoom(candidateId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-candidate-room', candidateId);
      console.log(`🚪 Left candidate room: ${candidateId}`);
    }
  }

  sendMessage(candidateId, content) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-message', { candidateId, content });
      console.log(`💬 Message sent to candidate ${candidateId}`);
    }
  }

  markNotificationAsRead(notificationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark-notification-read', notificationId);
    }
  }

  sendTyping(candidateId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { candidateId, isTyping });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('new-notification', callback);
    }
  }

  onNotificationRead(callback) {
    if (this.socket) {
      this.socket.on('notification-read', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  offNewMessage(callback) {
    if (this.socket) {
      this.socket.off('new-message', callback);
    }
  }

  offNewNotification(callback) {
    if (this.socket) {
      this.socket.off('new-notification', callback);
    }
  }

  offNotificationRead(callback) {
    if (this.socket) {
      this.socket.off('notification-read', callback);
    }
  }

  offUserTyping(callback) {
    if (this.socket) {
      this.socket.off('user-typing', callback);
    }
  }

  offError(callback) {
    if (this.socket) {
      this.socket.off('error', callback);
    }
  }
}

export default new SocketService();