const { Server } = require('socket.io');

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    // Join a specific chat session room
    socket.on('join_session', (sessionId) => {
      socket.join(`chat_session_${sessionId}`);
      console.log(`Socket ${socket.id} joined room: chat_session_${sessionId}`);
    });

    // Join the general admin room
    socket.on('join_admin', (ownerId) => {
      const room = ownerId ? `admin_room_${ownerId}` : 'admin_room';
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = {
  initSocket,
  getIO
};
