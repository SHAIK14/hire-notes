import { API_BASE_URL } from '../utils/constants';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const candidateAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (candidateData) => {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(candidateData)
    });
    return handleResponse(response);
  },

  update: async (id, candidateData) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(candidateData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getStats: async (id) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export const messageAPI = {
  getByCandidate: async (candidateId, page = 1, limit = 50) => {
    const response = await fetch(
      `${API_BASE_URL}/messages/candidate/${candidateId}?page=${page}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  create: async (candidateId, content) => {
    const response = await fetch(`${API_BASE_URL}/messages/candidate/${candidateId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return handleResponse(response);
  },

  update: async (messageId, content) => {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return handleResponse(response);
  },

  delete: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markAsRead: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export const userAPI = {
  getRecruiters: async (search = '') => {
    const response = await fetch(
      `${API_BASE_URL}/users/recruiters?search=${encodeURIComponent(search)}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  }
};

export const notificationAPI = {
  getAll: async (page = 1, limit = 20, unreadOnly = false) => {
    const response = await fetch(
      `${API_BASE_URL}/notifications?page=${page}&limit=${limit}&unread=${unreadOnly}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  delete: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  clearAll: async (readOnly = false) => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/clear-all?readOnly=${readOnly}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getOfflineNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/offline`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};