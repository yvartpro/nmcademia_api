const { ChatSession, ChatMessage } = require('../models');
const { getIO } = require('../utils/socket');

// Guest Endpoints
exports.startSession = async (req, res) => {
  try {
    const { visitorName, email, phone } = req.body;

    if (!req.owner) {
      return res.status(400).json({ message: 'Owner context missing for chat session.' });
    }

    // Returning visitor: reuse their active session instead of creating another
    if (email && String(email).trim()) {
      const existing = await ChatSession.findOne({
        where: { 
          email: String(email).trim(), 
          status: 'active',
          ownerId: req.owner.id 
        },
        order: [['lastMessageAt', 'DESC']]
      });
      if (existing) {
        if (visitorName && existing.visitorName !== visitorName) {
          existing.visitorName = visitorName;
        }
        if (phone && existing.phone !== phone) {
          existing.phone = phone;
        }
        existing.lastMessageAt = new Date();
        await existing.save();

        const io = getIO();
        if (io) {
          io.to(`admin_room_${req.owner.id}`).emit('session_updated', existing);
        }

        return res.status(200).json(existing);
      }
    }

    const session = await ChatSession.create({
      visitorName: visitorName || 'Visitor',
      email: email ? String(email).trim() : null,
      phone,
      status: 'active',
      lastMessageAt: new Date(),
      ownerId: req.owner.id
    });

    const io = getIO();
    if (io) {
      io.to(`admin_room_${req.owner.id}`).emit('session_updated', session);
    }

    res.status(201).json(session);
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ message: 'Failed to start chat session', error: error.message });
  }
};

exports.sendGuestMessage = async (req, res) => {
  try {
    const { chatSessionId, message } = req.body;
    if (!chatSessionId || !message) {
      return res.status(400).json({ message: 'Session ID and message content are required' });
    }

    const session = await ChatSession.findByPk(chatSessionId);
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const chatMsg = await ChatMessage.create({
      chatSessionId,
      sender: 'guest',
      message,
      isRead: false
    });

    session.lastMessageAt = new Date();
    await session.save();

    const io = getIO();
    if (io) {
      io.to(`chat_session_${chatSessionId}`).emit('message_received', chatMsg);
      io.to(`admin_room_${session.ownerId}`).emit('session_updated', session);
    }

    res.status(201).json(chatMsg);
  } catch (error) {
    console.error('Send guest message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.getGuestMessages = async (req, res) => {
  try {
    const { chatSessionId } = req.params;
    const messages = await ChatMessage.findAll({
      where: { chatSessionId },
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    console.error('Get guest messages error:', error);
    res.status(500).json({ message: 'Failed to retrieve messages' });
  }
};

// Admin Endpoints
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.findAll({
      where: { ownerId: req.user.ownerId },
      order: [['lastMessageAt', 'DESC']]
    });
    res.json(sessions);
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ message: 'Failed to retrieve sessions' });
  }
};

exports.getSessionMessages = async (req, res) => {
  try {
    const { chatSessionId } = req.params;
    
    // Mark all guest messages as read when the admin views the session
    await ChatMessage.update(
      { isRead: true },
      { where: { chatSessionId, sender: 'guest', isRead: false } }
    );

    const messages = await ChatMessage.findAll({
      where: { chatSessionId },
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    console.error('Get session messages error:', error);
    res.status(500).json({ message: 'Failed to retrieve session messages' });
  }
};

exports.sendTrainerReply = async (req, res) => {
  try {
    const { chatSessionId, message } = req.body;
    if (!chatSessionId || !message) {
      return res.status(400).json({ message: 'Session ID and message content are required' });
    }

    const session = await ChatSession.findByPk(chatSessionId);
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const chatMsg = await ChatMessage.create({
      chatSessionId,
      sender: 'trainer',
      message,
      isRead: true
    });

    session.lastMessageAt = new Date();
    await session.save();

    const io = getIO();
    if (io) {
      io.to(`chat_session_${chatSessionId}`).emit('message_received', chatMsg);
      io.to(`admin_room_${session.ownerId}`).emit('session_updated', session);
    }

    res.status(201).json(chatMsg);
  } catch (error) {
    console.error('Send trainer reply error:', error);
    res.status(500).json({ message: 'Failed to send reply' });
  }
};

exports.closeSession = async (req, res) => {
  try {
    const { chatSessionId } = req.params;
    const session = await ChatSession.findByPk(chatSessionId);
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }
    session.status = 'closed';
    await session.save();

    const io = getIO();
    if (io) {
      io.to(`chat_session_${chatSessionId}`).emit('session_closed', { chatSessionId });
      io.to(`admin_room_${session.ownerId}`).emit('session_closed', { chatSessionId });
    }

    res.json({ message: 'Session closed successfully', session });
  } catch (error) {
    console.error('Close session error:', error);
    res.status(500).json({ message: 'Failed to close session' });
  }
};
