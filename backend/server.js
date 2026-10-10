const config = require('./config/env'); // loads .env and stops the server if config is invalid
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { authenticate } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const userRoutes = require('./routes/users');
const locationRoutes = require('./routes/locations');
const sosRoutes = require('./routes/sos');
const deviceRoutes = require('./routes/devices');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'SafeHer backend is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Contact routes
app.use('/api/contacts', contactRoutes);

// User routes
app.use('/api/users', userRoutes);

// Location routes
app.use('/api/locations', locationRoutes);

// SOS routes
app.use('/api/sos', sosRoutes);

// Device routes (push notification tokens)
app.use('/api/devices', deviceRoutes);

// Temporary test route to verify JWT middleware
app.get('/test-auth', authenticate, (req, res) => {
  res.json({ success: true, message: 'You are authenticated!', userId: req.user.id });
});

const PORT = config.port;

const server = app.listen(PORT, () => {
 console.log(`Server running on port ${PORT} (${config.nodeEnv})`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
