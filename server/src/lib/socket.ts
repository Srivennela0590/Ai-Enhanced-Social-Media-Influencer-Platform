// ============================================================
// Socket.IO — Real-time Messaging & Notifications
// ============================================================

import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const onlineUsers = new Map<string, string>(); // userId -> socketId

export function setupSocketIO(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      (socket as any).userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    onlineUsers.set(userId, socket.id);
    logger.info(`Socket connected: ${userId}`);

    // Join personal room
    socket.join(`user:${userId}`);

    // ── Direct Message ──
    socket.on('message:send', (data: { receiverId: string; content: string; messageType?: string; fileUrl?: string }) => {
      const { receiverId, content, messageType, fileUrl } = data;
      const message = {
        senderId: userId,
        receiverId,
        content,
        messageType: messageType || 'text',
        fileUrl,
        createdAt: new Date().toISOString(),
      };
      io.to(`user:${receiverId}`).emit('message:received', message);
      socket.emit('message:sent', message);
    });

    // ── Typing Indicator ──
    socket.on('typing:start', (data: { receiverId: string }) => {
      io.to(`user:${data.receiverId}`).emit('typing:started', { userId });
    });
    socket.on('typing:stop', (data: { receiverId: string }) => {
      io.to(`user:${data.receiverId}`).emit('typing:stopped', { userId });
    });

    // ── Read Receipt ──
    socket.on('message:read', (data: { messageId: string; senderId: string }) => {
      io.to(`user:${data.senderId}`).emit('message:read', { messageId: data.messageId, readBy: userId });
    });

    // ── Disconnect ──
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      logger.info(`Socket disconnected: ${userId}`);
    });
  });

  return io;
}

/** Send notification to a user via socket */
export function sendNotification(io: Server, userId: string, notification: Record<string, unknown>) {
  io.to(`user:${userId}`).emit('notification', notification);
}
