# Recruiter Notes Hub

A real-time collaborative platform for recruiters and hiring managers to discuss candidates, share feedback, and receive notifications.

## Features

- Real-time candidate discussion rooms
- @username tagging with notifications
- JWT-based authentication
- Responsive design with modern UI
- Global notifications dashboard

## Tech Stack

- **Frontend**: React.js, ShadCN UI, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hire-notes
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Set up environment variables
```bash
# In server/.env
MONGODB_URI=mongodb://localhost:27017/recruiter-notes-hub
JWT_SECRET=your-secret-key
PORT=5000

# In client/.env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

5. Start the development servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Usage

1. Sign up or log in with your credentials
2. View the dashboard with candidate list
3. Click on a candidate to open their discussion room
4. Send messages and tag other users with @username
5. Check global notifications for tagged messages

## Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173`
- MongoDB connection on default port `27017`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request