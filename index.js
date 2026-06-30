const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');

const http = require('http');
const { initSocket } = require('./utils/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize WebSockets
initSocket(server);

// Enable security headers with relaxed policies for local assets and frames (if needed for videos)
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
const uploadsRoot = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsRoot));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// ✅ Health check
app.get('/api', (req, res) => {
  res.json({ message: 'Network Marketing Academia API is running' });
});

// ✅ SPA fallback (VERY IMPORTANT for Vue router histories)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

const runningServer = server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Increase timeout for video processing (10 mins)
runningServer.timeout = 600000;
runningServer.keepAliveTimeout = 600000;
