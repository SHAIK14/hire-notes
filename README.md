# Collaborative Candidate Notes

A real-time collaboration platform built for the Algohire Hackathon, enabling recruiters and hiring managers to discuss candidates, share feedback, and stay connected through smart @mention notifications.

## Project Overview

This application provides a centralized workspace for recruitment teams to collaborate effectively on candidate evaluations. Built with modern web technologies, it offers real-time messaging, intelligent notifications, and a professional interface designed specifically for hiring workflows.

### Core Features

- **Secure Authentication**: Complete user registration and login system with JWT
- **Real-Time Messaging**: Instant chat functionality powered by Socket.io
- **Smart @Mentions**: Autocomplete user tagging with immediate notifications
- **Professional Dashboard**: Clean candidate table with activity indicators
- **Notification Center**: Bell icon dropdown showing all @mention alerts
- **Offline Support**: Notifications preserved for users who were offline
- **Mobile Responsive**: Seamless experience across all devices
- **Auto-Scroll Chat**: Messages automatically scroll into view

## Tech Stack

**Frontend:**

- React 18 with Vite for fast development
- ShadCN UI components for consistent design
- Tailwind CSS for responsive styling
- Socket.io client for real-time features

**Backend:**

- Node.js with Express framework
- MongoDB with Mongoose ODM
- Socket.io for WebSocket connections
- JWT authentication with bcrypt security
- Rate limiting and CORS protection

**Architecture:**

- Modular controller-based backend
- Component-based frontend architecture
- Service layer for API and Socket management
- Context-based state management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git for version control

### Quick Setup

1. **Clone and Navigate**

   ```bash
   git clone https://github.com/SHAIK14/hire-notes.git
   cd Algohire
   ```

2. **Backend Setup**

   ```bash
   cd server
   npm install
   ```

3. **Environment Configuration**
   Create `server/.env`:

   ```env
   PORT=8000
   MONGODB_URI=mongodb+srv://hire:hireNotes@cluster0.jvvov4i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=hireNotes
   NODE_ENV=development
   ```

4. **Frontend Setup**

   ```bash
   cd ../client
   npm install
   ```

   Create `client/.env`:

   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_SOCKET_URL=http://localhost:8000
   ```

5. **Database Seeding**

   ```bash
   cd ../server
   node seeders/candidateSeeder.js
   ```

6. **Start Development Servers**

   ```bash
   # Terminal 1 - Backend
   cd server
   npm start

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

7. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## User Guide

### Getting Started

1. **Create Account**: Register with your name, email, and secure password
2. **Dashboard Overview**: See all candidates in a professional table layout
3. **Start Conversations**: Click the chat icon next to any candidate

### Collaboration Features

1. **Real-Time Messaging**: Type messages and see them appear instantly for all users
2. **@Mention System**: Type @ followed by a name to tag colleagues with autocomplete
3. **Notification Management**: Click the bell icon to see all your @mentions
4. **Quick Navigation**: Click any notification to jump directly to that conversation

### Advanced Features

- **Typing Indicators**: See when others are actively typing
- **Auto-Scroll**: New messages automatically come into view
- **Message Timestamps**: Clear time formatting for message history
- **Offline Notifications**: Get caught up on mentions you missed while away

## Project Architecture

```
Algohire/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/ui/     # ShadCN UI components
│   │   ├── context/           # Authentication context
│   │   ├── pages/             # Dashboard and auth pages
│   │   ├── services/          # API and Socket services
│   │   └── utils/             # Constants and helpers
│   ├── public/                # Static assets
│   └── package.json
├── server/                    # Node.js Backend
│   ├── controllers/           # Business logic handlers
│   ├── middleware/            # Auth and validation
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API endpoint definitions
│   ├── seeders/               # Database initialization
│   ├── sockets/               # WebSocket event handlers
│   └── config/                # Database configuration
└── README.md
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user

### Candidate Management

- `GET /api/candidates` - List all candidates
- `GET /api/candidates/:id` - Get candidate details
- `POST /api/candidates` - Create new candidate

### Messaging System

- `GET /api/messages/candidate/:id` - Get conversation history
- `POST /api/messages/candidate/:id` - Send new message

### Notification System

- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/offline` - Get missed notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### User Management

- `GET /api/users/recruiters` - Get users for @mention autocomplete

## WebSocket Events

### Real-Time Communication

- **Client → Server**: `send-message`, `join-candidate-room`, `typing`
- **Server → Client**: `new-message`, `new-notification`, `user-typing`

## Security Implementation

- **JWT Authentication**: Secure token-based user sessions
- **Password Security**: bcrypt hashing with salt rounds
- **Route Protection**: All endpoints require authentication
- **Input Validation**: Server-side validation and sanitization
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Secure cross-origin resource sharing

## Database Schema

### User Model

- Authentication credentials and profile information
- Online status tracking for offline notifications

### Candidate Model

- Candidate information and message count tracking
- Relationship to user who added the candidate

### Message Model

- Message content with sender and candidate references
- @mention tracking and edit history

### Notification Model

- @mention notifications with read status
- Links to specific messages and candidates

## Development Guidelines

### Code Organization

- **Controllers**: Handle business logic and API responses
- **Services**: Manage external connections (DB, Sockets)
- **Components**: Reusable UI elements with clear props
- **Context**: Global state for authentication

### Best Practices Followed

- Modular architecture with separation of concerns
- Meaningful variable and function names
- Error handling with user-friendly messages
- Responsive design principles
- Clean commit history with descriptive messages

## Deployment Considerations

### Build Commands

```bash
# Frontend production build
cd client && npm run build

# Backend production start
cd server && npm start
```

## Future Enhancements

If given more time, potential improvements include:

- File upload support for resumes and documents
- Advanced search and filtering for candidates
- Email notifications for important @mentions
- User roles and permissions system
- Analytics dashboard for recruitment metrics
- Integration with popular ATS systems

## Acknowledgments

Built for the Algohire Full-Stack Developer Hackathon, this project demonstrates:

- Modern full-stack development practices
- Real-time web application architecture
- Professional UI/UX design principles
- Secure authentication implementation
- Scalable code organization

---

_This application showcases a complete recruitment collaboration solution with emphasis on real-time communication, user experience, and code quality._
