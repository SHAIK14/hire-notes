import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { candidateAPI, messageAPI, notificationAPI, userAPI } from '../services/api';
import socketService from '../services/socket';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState({});
  const [recruiters, setRecruiters] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const messagesEndRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCandidates = async () => {
    try {
      const data = await candidateAPI.getAll();
      setCandidates(data);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const [regularNotifications, offlineNotifications] = await Promise.all([
        notificationAPI.getAll(1, 20),
        notificationAPI.getOfflineNotifications()
      ]);
      
      const allNotifications = [...(offlineNotifications.notifications || []), ...(regularNotifications.notifications || [])];
      const uniqueNotifications = allNotifications.filter((notification, index, self) => 
        index === self.findIndex(n => n._id === notification._id)
      );
      
      setNotifications(uniqueNotifications);
      
      if (offlineNotifications.count > 0) {
        console.log(`📨 Found ${offlineNotifications.count} offline notifications`);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadMessages = async (candidateId) => {
    try {
      const data = await messageAPI.getByCandidate(candidateId);
      setMessages(data.messages || []);
      
      const candidateNotifications = notifications.filter(
        n => !n.isRead && (n.candidateId?._id || n.candidateId) === candidateId
      );
      
      if (candidateNotifications.length > 0) {
        try {
          for (const notification of candidateNotifications) {
            await notificationAPI.markAsRead(notification._id);
          }
          
          setNotifications(prev => 
            prev.filter(n => 
              !candidateNotifications.some(cn => cn._id === n._id)
            )
          );
        } catch (error) {
          console.error('Error clearing notifications:', error);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleCandidateClick = async (candidate) => {
    if (selectedCandidate) {
      socketService.leaveCandidateRoom(selectedCandidate._id);
    }
    
    setSelectedCandidate(candidate);
    localStorage.setItem('selectedCandidate', JSON.stringify(candidate));
    setShowNotifications(false);
    
    setCandidates(prev => 
      prev.map(c => 
        c._id === candidate._id 
          ? { ...c, hasUnreadMessages: false }
          : c
      )
    );
    
    socketService.joinCandidateRoom(candidate._id);
    await loadMessages(candidate._id);
  };

  const handleNotificationClick = async (notification) => {
    const candidateId = notification.candidateId?._id || notification.candidateId;
    const candidate = candidates.find(c => c._id === candidateId);
    
    if (candidate) {
      setShowNotifications(false);
      
      try {
        await notificationAPI.markAsRead(notification._id);
        setNotifications(prev => 
          prev.filter(n => n._id !== notification._id)
        );
      } catch (error) {
        console.error('Error clearing notification:', error);
      }
      
      await handleCandidateClick(candidate);
    }
  };

  const closeSidebar = () => {
    if (selectedCandidate) {
      socketService.leaveCandidateRoom(selectedCandidate._id);
    }
    setSelectedCandidate(null);
    localStorage.removeItem('selectedCandidate');
  };

  const sendMessage = async () => {
    if (messageInput.trim() && selectedCandidate) {
      try {
        const messageContent = messageInput.trim();
        setMessageInput('');
        setShowMentionDropdown(false);
        
        const newMessage = {
          _id: `temp_${Date.now()}`,
          candidateId: selectedCandidate._id,
          sender: {
            _id: user?.id,
            name: user?.name,
            email: user?.email
          },
          content: messageContent,
          createdAt: new Date().toISOString(),
          isEdited: false,
          temp: true
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        socketService.sendMessage(selectedCandidate._id, messageContent);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setMessageInput(value);
    
    if (selectedCandidate) {
      socketService.sendTyping(selectedCandidate._id, value.length > 0);
    }
    
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      
      if (spaceIndex === -1 || spaceIndex > afterAt.length) {
        setMentionSearch(afterAt);
        setShowMentionDropdown(true);
        
        try {
          const users = await userAPI.getRecruiters(afterAt);
          setRecruiters(users);
        } catch (error) {
          console.error('Error fetching recruiters:', error);
        }
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };
  
  const handleMentionSelect = (recruiter) => {
    const lastAtIndex = messageInput.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const beforeAt = messageInput.substring(0, lastAtIndex);
      const newValue = beforeAt + '@' + recruiter.name + ' ';
      setMessageInput(newValue);
      setShowMentionDropdown(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadCandidates(),
          loadNotifications()
        ]);
        
        const savedCandidate = JSON.parse(localStorage.getItem('selectedCandidate') || 'null');
        if (savedCandidate) {
          setSelectedCandidate(savedCandidate);
          socketService.joinCandidateRoom(savedCandidate._id);
          await loadMessages(savedCandidate._id);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);

      socketService.onNewMessage((messageData) => {
        setMessages(prev => {
          const currentPath = window.location.pathname;
          if (currentPath === '/dashboard') {
            const currentSelectedCandidate = JSON.parse(localStorage.getItem('selectedCandidate') || 'null');
            if (currentSelectedCandidate && messageData.candidateId === currentSelectedCandidate._id) {
              const filteredMessages = prev.filter(msg => !msg.temp || msg.sender._id !== messageData.sender._id);
              return [...filteredMessages, messageData];
            }
          }
          return prev;
        });
        
        setIsTyping(prev => ({
          ...prev,
          [messageData.sender._id]: null
        }));
        
        setCandidates(prev => 
          prev.map(candidate => {
            if (candidate._id === messageData.candidateId) {
              const currentSelectedCandidate = JSON.parse(localStorage.getItem('selectedCandidate') || 'null');
              const isCurrentlySelected = currentSelectedCandidate && currentSelectedCandidate._id === candidate._id;
              
              return {
                ...candidate,
                messageCount: (candidate.messageCount || 0) + 1,
                hasUnreadMessages: !isCurrentlySelected
              };
            }
            return candidate;
          })
        );
      });

      socketService.onNewNotification((data) => {
        if (data.userId === user?.id) {
          setNotifications(prev => [data.notification, ...prev]);
        }
      });

      socketService.onUserTyping((data) => {
        setIsTyping(prev => ({
          ...prev,
          [data.userId]: data.isTyping ? data.userName : null
        }));
        
        if (data.isTyping) {
          setTimeout(() => {
            setIsTyping(prev => ({
              ...prev,
              [data.userId]: null
            }));
          }, 3000);
        }
      });

      socketService.onError((error) => {
        console.error('Socket error:', error);
      });
    }

    return () => {
      if (selectedCandidate) {
        socketService.leaveCandidateRoom(selectedCandidate._id);
      }
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (selectedCandidate) {
        socketService.sendTyping(selectedCandidate._id, false);
      }
    };
  }, [selectedCandidate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    
    if (isToday) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RN</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                Recruiter Notes
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a6 6 0 1 0-8.485 0L5 17h5m5 0a3 3 0 1 1-6 0m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div 
                          key={notif._id} 
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <div className="font-medium text-sm">{notif.candidateName}</div>
                          <div className="text-sm text-gray-600 truncate">{notif.content}</div>
                          <div className="text-xs text-gray-500 mt-1">{formatTime(notif.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-screen pt-16">
        <main className={`flex-1 ${selectedCandidate ? 'lg:mr-80' : ''} transition-all duration-300`}>
          <div className="p-4 lg:p-6">
            <div className="mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                Candidates ({candidates.length})
              </h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr 
                      key={candidate._id}
                      onClick={() => handleCandidateClick(candidate)}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedCandidate?._id === candidate._id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{candidate.email}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                        {candidate.email}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center justify-center">
                          <div className="relative">
                            <svg className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {candidate.hasUnreadMessages && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {selectedCandidate && (
          <div className={`fixed inset-y-0 right-0 top-16 w-full lg:w-80 bg-white border-l border-gray-200 z-40 transform ${selectedCandidate ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <h3 className="text-lg font-semibold truncate">💬 {selectedCandidate.name}</h3>
                <button onClick={closeSidebar} className="text-gray-500 hover:text-gray-700 p-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message._id} 
                      className={`p-3 rounded-lg shadow-sm ${
                        message.sender._id === user?.id 
                          ? 'bg-blue-50 border-l-4 border-blue-400 ml-8' 
                          : 'bg-white mr-8'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900">
                        {message.sender._id === user?.id ? 'You' : message.sender.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{message.content}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatMessageTime(message.createdAt)}
                        {message.isEdited && <span className="ml-1 text-gray-400">(edited)</span>}
                      </div>
                    </div>
                  ))}
                  
                  {Object.values(isTyping).filter(Boolean).length > 0 && (
                    <div className="bg-gray-100 p-3 rounded-lg shadow-sm mr-8">
                      <div className="text-sm text-gray-600">
                        {Object.values(isTyping).filter(Boolean).join(', ')} 
                        {Object.values(isTyping).filter(Boolean).length === 1 ? ' is' : ' are'} typing...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="relative">
                  {showMentionDropdown && recruiters.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50">
                      {recruiters.slice(0, 5).map((recruiter) => (
                        <div
                          key={recruiter._id}
                          onClick={() => handleMentionSelect(recruiter)}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-gray-900">{recruiter.name}</div>
                          <div className="text-xs text-gray-500">{recruiter.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message... (use @username to mention)"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button onClick={sendMessage} className="px-4 py-2 whitespace-nowrap">Send</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;