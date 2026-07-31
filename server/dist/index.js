import express, {} from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { setupWebSocket } from './websocket.js';
import { Expo } from 'expo-server-sdk';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();
const expo = new Expo();
// Cria o diretório de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
// Middleware para parsear JSON
app.use(express.json());
// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(uploadsDir));
// Configuração do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });
// Middleware de autenticação
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
// Rota de teste
app.get('/', (req, res) => {
    res.send('Hello, HeartGeek! The server is running with auth endpoints.');
});
// Rota de Registro
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, interests } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }
    try {
        let user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                interests: Array.isArray(interests) ? interests : [],
            },
        });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, interests: user.interests } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota de Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                bio: user.bio,
                image: user.image,
                interests: user.interests,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para upload de imagem de perfil
app.post('/api/me/image', authMiddleware, upload.single('image'), async (req, res) => {
    const userId = req.userId;
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl },
            select: { id: true, name: true, email: true, age: true, bio: true, image: true, interests: true },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para buscar o perfil do usuário logado
app.get('/api/me', authMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, age: true, bio: true, image: true, pushToken: true, interests: true, isOnline: true },
        });
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para atualizar o perfil do usuário logado
app.put('/api/me', authMiddleware, async (req, res) => {
    const userId = req.userId;
    const { name, age, bio, pushToken, interests } = req.body;
    try {
        const dataToUpdate = {};
        if (name !== undefined)
            dataToUpdate.name = name;
        if (age !== undefined)
            dataToUpdate.age = Number(age);
        if (bio !== undefined)
            dataToUpdate.bio = bio;
        if (pushToken !== undefined)
            dataToUpdate.pushToken = pushToken;
        if (Array.isArray(interests))
            dataToUpdate.interests = interests;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: { id: true, name: true, email: true, age: true, bio: true, image: true, pushToken: true, interests: true },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para buscar perfis com % de compatibilidade Geek Match
app.get('/api/profiles', authMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { interests: true },
        });
        const myInterests = currentUser?.interests || [];
        const interactedUserIds = await prisma.interaction.findMany({
            where: { userId: userId },
            select: { targetUserId: true },
        });
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: userId,
                    notIn: interactedUserIds.map((i) => i.targetUserId),
                },
            },
            select: {
                id: true,
                name: true,
                age: true,
                bio: true,
                image: true,
                interests: true,
                isOnline: true,
                lastSeen: true,
            },
        });
        const profilesWithCompatibility = users.map((u) => {
            let compatibility = 75;
            if (myInterests.length > 0 && u.interests.length > 0) {
                const common = u.interests.filter((i) => myInterests.includes(i)).length;
                const total = Math.max(myInterests.length, u.interests.length);
                compatibility = Math.min(99, Math.max(60, Math.round((common / total) * 40 + 60)));
            }
            else if (u.interests.length > 0 || myInterests.length > 0) {
                compatibility = 70;
            }
            return {
                ...u,
                compatibility,
            };
        });
        res.json(profilesWithCompatibility);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para registrar uma interação (like/dislike)
app.post('/api/interactions', authMiddleware, async (req, res) => {
    const { targetUserId, liked } = req.body;
    const userId = req.userId;
    if (!targetUserId || typeof liked !== 'boolean') {
        return res.status(400).json({ message: 'Missing targetUserId or liked status' });
    }
    try {
        const newInteraction = await prisma.interaction.create({
            data: { userId, targetUserId, liked },
        });
        if (liked) {
            const mutualLike = await prisma.interaction.findUnique({
                where: {
                    userId_targetUserId: { userId: targetUserId, targetUserId: userId },
                    liked: true,
                },
            });
            if (mutualLike) {
                const newMatch = await prisma.match.create({
                    data: {
                        users: { connect: [{ id: userId }, { id: targetUserId }] },
                    },
                });
                const targetUser = await prisma.user.findUnique({
                    where: { id: targetUserId },
                    select: { id: true, name: true, image: true, bio: true, age: true },
                });
                // Send push notification to both users
                const user1 = await prisma.user.findUnique({ where: { id: userId } });
                const user2 = await prisma.user.findUnique({ where: { id: targetUserId } });
                if (user1?.pushToken && Expo.isExpoPushToken(user1.pushToken)) {
                    expo.sendPushNotificationsAsync([
                        {
                            to: user1.pushToken,
                            sound: 'default',
                            title: '⚡ NOVO MATCH GEEK!',
                            body: `Você deu match com ${user2?.name}!`,
                            data: { matchId: newMatch.id, type: 'match' },
                        },
                    ]);
                }
                if (user2?.pushToken && Expo.isExpoPushToken(user2.pushToken)) {
                    expo.sendPushNotificationsAsync([
                        {
                            to: user2.pushToken,
                            sound: 'default',
                            title: '⚡ NOVO MATCH GEEK!',
                            body: `Você deu match com ${user1?.name}!`,
                            data: { matchId: newMatch.id, type: 'match' },
                        },
                    ]);
                }
                return res.status(201).json({ match: true, interaction: newInteraction, matchId: newMatch.id, targetUser });
            }
        }
        res.status(201).json({ match: false, interaction: newInteraction });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para buscar os matches com dados atualizados do parceiro
app.get('/api/matches', authMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const matches = await prisma.match.findMany({
            where: { users: { some: { id: userId } } },
            include: {
                users: {
                    where: { id: { not: userId } },
                    select: {
                        id: true,
                        name: true,
                        age: true,
                        bio: true,
                        image: true,
                        interests: true,
                        isOnline: true,
                        lastSeen: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        text: true,
                        createdAt: true,
                        senderId: true,
                        isRead: true,
                    },
                },
            },
        });
        const formattedMatches = matches.map((m) => ({
            id: m.id,
            createdAt: m.createdAt,
            user: m.users[0],
            lastMessage: m.messages[0] || null,
        }));
        res.json(formattedMatches);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para buscar mensagens de um match
app.get('/api/matches/:matchId/messages', authMiddleware, async (req, res) => {
    const matchId = req.params.matchId;
    const userId = req.userId;
    try {
        const match = await prisma.match.findFirst({
            where: { id: matchId, users: { some: { id: userId } } },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { id: true, name: true } } },
                },
            },
        });
        if (!match) {
            return res.status(404).json({ message: 'Match not found or you are not part of this match' });
        }
        res.json(match.messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Inicializa o WebSocket server
setupWebSocket(server, prisma, expo);
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
//# sourceMappingURL=index.js.map