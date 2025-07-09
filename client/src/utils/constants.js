export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CANDIDATE_NOTES: '/candidate/:id',
};

export const DUMMY_CANDIDATES = [
  {
    id: '1',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@gmail.com',
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@gmail.com',
  },
  {
    id: '3',
    name: 'Rahul Gupta',
    email: 'rahul.gupta@gmail.com',
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@gmail.com',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram.singh@gmail.com',
  },
  {
    id: '6',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@gmail.com',
  },
];