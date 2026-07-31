import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import url from 'url';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { Expo } from 'expo-server-sdk';

const clients = new Map<string, WebSocket>();

export const setupWebSocket = (server: Server, prisma: any, expo: Expo) => {
  const wss = new WebSocketServer({ server });

  const notifyUserPresence = async (userId: string, isOnline: boolean) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline, lastSeen: new Date() },
      });

      // Notifica os parceiros de match que este usuário está online/offline
      const userMatches = await prisma.match.findMany({
        where: { users: { some: { id: userId } } },
        include: { users: { select: { id: true } } },
      });

      userMatches.forEach((match: { users: any[] }) => {
        const partner = match.users.find((u: { id: string }) => u.id !== userId);
        if (partner) {
          const partnerWs = clients.get(partner.id);
          if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
            partnerWs.send(
              JSON.stringify({
                type: 'PRESENCE_CHANGE',
                userId,
                isOnline,
                lastSeen: new Date(),
              })
            );
          }
        }
      });
    } catch (err) {
      console.error('Error updating presence status:', err);
    }
  };

  wss.on('connection', async (ws, req) => {
    const parsedUrl = url.parse(req.url || '', true);
    const token = parsedUrl.query.token as string;

    if (!token) {
      ws.close(1008, 'No token provided');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      const userId = decoded.userId;
      clients.set(userId, ws);

      console.log(`Client connected: ${userId}`);
      await notifyUserPresence(userId, true);

      ws.on('message', async (messageData) => {
        try {
          const parsedMessage = JSON.parse(messageData.toString());
          const messageType = parsedMessage.type || 'CHAT_MESSAGE';

          if (messageType === 'TYPING') {
            const { matchId, isTyping } = parsedMessage;
            const match = await prisma.match.findUnique({
              where: { id: matchId },
              include: { users: { select: { id: true } } },
            });
            if (match) {
              const recipient = match.users.find((u: { id: string }) => u.id !== userId);
              if (recipient) {
                const recipientWs = clients.get(recipient.id);
                if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                  recipientWs.send(
                    JSON.stringify({
                      type: 'TYPING',
                      matchId,
                      senderId: userId,
                      isTyping,
                    })
                  );
                }
              }
            }
            return;
          }

          if (messageType === 'READ_RECEIPT') {
            const { matchId } = parsedMessage;
            await prisma.message.updateMany({
              where: { matchId, senderId: { not: userId }, isRead: false },
              data: { isRead: true },
            });

            const match = await prisma.match.findUnique({
              where: { id: matchId },
              include: { users: { select: { id: true } } },
            });

            if (match) {
              const recipient = match.users.find((u: { id: string }) => u.id !== userId);
              if (recipient) {
                const recipientWs = clients.get(recipient.id);
                if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                  recipientWs.send(
                    JSON.stringify({
                      type: 'READ_RECEIPT',
                      matchId,
                      readByUserId: userId,
                    })
                  );
                }
              }
            }
            return;
          }

          if (messageType === 'CHAT_MESSAGE') {
            const { matchId, text } = parsedMessage;
            const senderId = userId;

            if (!text || !matchId) return;

            const newMessage = await prisma.message.create({
              data: {
                text,
                senderId,
                matchId,
              },
              include: { sender: { select: { id: true, name: true, image: true } } },
            });

            const match = await prisma.match.findUnique({
              where: { id: matchId },
              include: { users: true },
            });

            if (match) {
              const recipient = match.users.find((u: { id: string }) => u.id !== senderId);
              if (recipient) {
                const recipientWs = clients.get(recipient.id);
                const payload = JSON.stringify({ type: 'CHAT_MESSAGE', ...newMessage });

                if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                  recipientWs.send(payload);
                } else if (recipient.pushToken && Expo.isExpoPushToken(recipient.pushToken)) {
                  expo.sendPushNotificationsAsync([
                    {
                      to: recipient.pushToken,
                      sound: 'default',
                      title: `Nova mensagem de ${newMessage.sender.name}`,
                      body: newMessage.text,
                      data: { matchId, type: 'message' },
                    },
                  ]);
                }
                ws.send(payload);
              }
            }
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      ws.on('close', async () => {
        clients.delete(userId);
        console.log(`Client disconnected: ${userId}`);
        await notifyUserPresence(userId, false);
      });
    } catch (error) {
      ws.close(1008, 'Invalid token');
    }
  });
};