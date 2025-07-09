const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const { handleConnection } = require('./sockets/socketHandler');

dotenv.config();

const app = express();

connectDB();

console.log('🚀 Starting server setup...');

app.use((req, res, next) => {
  console.log(`📝 Incoming request: ${req.method} ${req.url} from origin: ${req.headers.origin}`);
  next();
});

app.use((req, res, next) => {
  console.log('🔧 Setting CORS headers...');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Responding to OPTIONS preflight request');
    return res.status(200).end();
  }
  
  next();
});

const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`🚨 REQUEST: ${req.method} ${req.originalUrl} from ${req.headers.origin || 'unknown origin'}`);
  next();
});

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  console.log('🏠 Root endpoint hit from:', req.headers.origin);
  res.json({ message: 'Recruiter Notes API Server', timestamp: new Date().toISOString() });
});

app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint hit from:', req.headers.origin);
  res.json({ message: 'Test endpoint working!', cors: 'enabled' });
});

const PORT = process.env.PORT || 8000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

handleConnection(io);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Test server at: http://localhost:${PORT}`);
  console.log(`✅ API endpoint: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔌 WebSocket server ready`);
  console.log('🔍 Waiting for requests...');
});