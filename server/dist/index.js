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
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null)
        return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}
// Rota para buscar o perfil do usuário logado
app.get('/api/me', authMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                age: true,
                bio: true,
                image: true,
                photos: { orderBy: { order: 'asc' } },
                pushToken: true,
                interests: true,
                rpgClass: true,
                favoriteGames: true,
                favoriteAnimes: true,
                favoriteConsoles: true,
                favoriteGeekCategories: true,
                isOnline: true,
                latitude: true,
                longitude: true,
                locationName: true,
                isTravelMode: true,
                travelLocationName: true,
                travelLatitude: true,
                travelLongitude: true,
                musicGenres: true,
                favoriteBands: true,
                spotifyUrl: true,
                steamId: true,
                instagramHandle: true,
                twitterHandle: true,
                tiktokHandle: true,
                facebookUrl: true,
                showSocials: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para adicionar foto à galeria
app.post('/api/me/photos', authMiddleware, upload.single('image'), async (req, res) => {
    const userId = req.userId;
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }
    const photoUrl = `/uploads/${req.file.filename}`;
    try {
        const photosCount = await prisma.userPhoto.count({ where: { userId } });
        const newPhoto = await prisma.userPhoto.create({
            data: {
                url: photoUrl,
                order: photosCount,
                userId,
            },
        });
        // Se o usuário não tiver foto principal, atualiza
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.image) {
            await prisma.user.update({ where: { id: userId }, data: { image: photoUrl } });
        }
        res.status(201).json(newPhoto);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para deletar foto da galeria
app.delete('/api/me/photos/:photoId', authMiddleware, async (req, res) => {
    const userId = req.userId;
    const photoId = req.params.photoId;
    if (!photoId) {
        return res.status(400).json({ message: 'Missing photoId' });
    }
    try {
        const photo = await prisma.userPhoto.findFirst({ where: { id: photoId, userId } });
        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }
        await prisma.userPhoto.delete({ where: { id: photo.id } });
        res.json({ message: 'Photo deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para atualizar o perfil do usuário logado
app.put('/api/me', authMiddleware, async (req, res) => {
    const userId = req.userId;
    const { name, age, bio, pushToken, interests, rpgClass, favoriteGames, favoriteAnimes, favoriteConsoles, favoriteGeekCategories, latitude, longitude, locationName, isTravelMode, travelLocationName, travelLatitude, travelLongitude, musicGenres, favoriteBands, spotifyUrl, steamId, instagramHandle, twitterHandle, tiktokHandle, facebookUrl, showSocials, } = req.body;
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
        if (rpgClass !== undefined)
            dataToUpdate.rpgClass = rpgClass;
        if (Array.isArray(favoriteGames))
            dataToUpdate.favoriteGames = favoriteGames;
        if (Array.isArray(favoriteAnimes))
            dataToUpdate.favoriteAnimes = favoriteAnimes;
        if (Array.isArray(favoriteConsoles))
            dataToUpdate.favoriteConsoles = favoriteConsoles;
        if (Array.isArray(favoriteGeekCategories))
            dataToUpdate.favoriteGeekCategories = favoriteGeekCategories;
        if (latitude !== undefined)
            dataToUpdate.latitude = latitude ? Number(latitude) : null;
        if (longitude !== undefined)
            dataToUpdate.longitude = longitude ? Number(longitude) : null;
        if (locationName !== undefined)
            dataToUpdate.locationName = locationName;
        if (isTravelMode !== undefined)
            dataToUpdate.isTravelMode = Boolean(isTravelMode);
        if (travelLocationName !== undefined)
            dataToUpdate.travelLocationName = travelLocationName;
        if (travelLatitude !== undefined)
            dataToUpdate.travelLatitude = travelLatitude ? Number(travelLatitude) : null;
        if (travelLongitude !== undefined)
            dataToUpdate.travelLongitude = travelLongitude ? Number(travelLongitude) : null;
        if (Array.isArray(musicGenres))
            dataToUpdate.musicGenres = musicGenres;
        if (Array.isArray(favoriteBands))
            dataToUpdate.favoriteBands = favoriteBands;
        if (spotifyUrl !== undefined)
            dataToUpdate.spotifyUrl = spotifyUrl;
        if (steamId !== undefined)
            dataToUpdate.steamId = steamId;
        if (instagramHandle !== undefined)
            dataToUpdate.instagramHandle = instagramHandle;
        if (twitterHandle !== undefined)
            dataToUpdate.twitterHandle = twitterHandle;
        if (tiktokHandle !== undefined)
            dataToUpdate.tiktokHandle = tiktokHandle;
        if (facebookUrl !== undefined)
            dataToUpdate.facebookUrl = facebookUrl;
        if (showSocials !== undefined)
            dataToUpdate.showSocials = Boolean(showSocials);
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                name: true,
                email: true,
                age: true,
                bio: true,
                image: true,
                photos: { orderBy: { order: 'asc' } },
                pushToken: true,
                interests: true,
                rpgClass: true,
                favoriteGames: true,
                favoriteAnimes: true,
                favoriteConsoles: true,
                favoriteGeekCategories: true,
                isOnline: true,
                latitude: true,
                longitude: true,
                locationName: true,
                isTravelMode: true,
                travelLocationName: true,
                travelLatitude: true,
                travelLongitude: true,
                musicGenres: true,
                favoriteBands: true,
                spotifyUrl: true,
                steamId: true,
                instagramHandle: true,
                twitterHandle: true,
                tiktokHandle: true,
                facebookUrl: true,
                showSocials: true,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para buscar perfis com % de compatibilidade Geek Match estendida
app.get('/api/profiles', authMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                interests: true,
                rpgClass: true,
                favoriteGames: true,
                favoriteAnimes: true,
                favoriteConsoles: true,
                favoriteGeekCategories: true,
                musicGenres: true,
                latitude: true,
                longitude: true,
                isTravelMode: true,
                travelLatitude: true,
                travelLongitude: true,
            },
        });
        const myInterests = currentUser?.interests || [];
        const myGames = currentUser?.favoriteGames || [];
        const myAnimes = currentUser?.favoriteAnimes || [];
        const myConsoles = currentUser?.favoriteConsoles || [];
        const myCategories = currentUser?.favoriteGeekCategories || [];
        const myMusic = currentUser?.musicGenres || [];
        const myRpgClass = currentUser?.rpgClass;
        const myLat = currentUser?.isTravelMode ? currentUser?.travelLatitude || currentUser?.latitude : currentUser?.latitude;
        const myLon = currentUser?.isTravelMode ? currentUser?.travelLongitude || currentUser?.longitude : currentUser?.longitude;
        const interactedUserIds = await prisma.interaction.findMany({
            where: { userId: userId },
            select: { targetUserId: true },
        });
        const blockedUserIds = await prisma.block.findMany({
            where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
            select: { blockerId: true, blockedId: true },
        });
        const excludeIds = new Set([
            userId,
            ...interactedUserIds.map((i) => i.targetUserId),
            ...blockedUserIds.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId)),
        ]);
        const users = await prisma.user.findMany({
            where: {
                id: {
                    notIn: Array.from(excludeIds),
                },
            },
            select: {
                id: true,
                name: true,
                age: true,
                bio: true,
                image: true,
                photos: { orderBy: { order: 'asc' } },
                interests: true,
                rpgClass: true,
                favoriteGames: true,
                favoriteAnimes: true,
                favoriteConsoles: true,
                favoriteGeekCategories: true,
                isOnline: true,
                lastSeen: true,
                latitude: true,
                longitude: true,
                locationName: true,
                isTravelMode: true,
                travelLocationName: true,
                musicGenres: true,
                favoriteBands: true,
                spotifyUrl: true,
                steamId: true,
                instagramHandle: true,
                twitterHandle: true,
                tiktokHandle: true,
                facebookUrl: true,
                showSocials: true,
            },
        });
        const profilesWithCompatibility = users.map((u) => {
            let totalWeight = 0;
            let matchedWeight = 0;
            // Class RPG bonus (15%)
            if (myRpgClass && u.rpgClass) {
                totalWeight += 15;
                if (myRpgClass === u.rpgClass) {
                    matchedWeight += 15;
                }
                else {
                    matchedWeight += 8; // Party de classes diferentes também é compatível!
                }
            }
            // Interesses gerais (30%)
            if (myInterests.length > 0 || u.interests.length > 0) {
                totalWeight += 30;
                const common = u.interests.filter((i) => myInterests.includes(i)).length;
                const maxPossible = Math.max(1, Math.max(myInterests.length, u.interests.length));
                matchedWeight += Math.round((common / maxPossible) * 30);
            }
            // Jogos favoritos (20%)
            if (myGames.length > 0 || u.favoriteGames.length > 0) {
                totalWeight += 20;
                const commonGames = u.favoriteGames.filter((g) => myGames.includes(g)).length;
                const maxGames = Math.max(1, Math.max(myGames.length, u.favoriteGames.length));
                matchedWeight += Math.round((commonGames / maxGames) * 20);
            }
            // Animes favoritos (15%)
            if (myAnimes.length > 0 || u.favoriteAnimes.length > 0) {
                totalWeight += 15;
                const commonAnimes = u.favoriteAnimes.filter((a) => myAnimes.includes(a)).length;
                const maxAnimes = Math.max(1, Math.max(myAnimes.length, u.favoriteAnimes.length));
                matchedWeight += Math.round((commonAnimes / maxAnimes) * 15);
            }
            // Gêneros Musicais (20%)
            if (myMusic.length > 0 || u.musicGenres.length > 0) {
                totalWeight += 20;
                const commonMusic = u.musicGenres.filter((m) => myMusic.includes(m)).length;
                const maxMusic = Math.max(1, Math.max(myMusic.length, u.musicGenres.length));
                matchedWeight += Math.round((commonMusic / maxMusic) * 20);
            }
            const compatibilityPercent = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 40 + 60) : 75;
            const finalCompatibility = Math.min(99, Math.max(55, compatibilityPercent));
            const targetLat = u.isTravelMode ? u.travelLatitude || u.latitude : u.latitude;
            const targetLon = u.isTravelMode ? u.travelLongitude || u.longitude : u.longitude;
            const distanceKm = calculateDistanceKm(myLat, myLon, targetLat, targetLon);
            return {
                ...u,
                compatibility: finalCompatibility,
                distanceKm,
            };
        });
        // Ordena por maior porcentagem de compatibilidade geek
        profilesWithCompatibility.sort((a, b) => b.compatibility - a.compatibility);
        res.json(profilesWithCompatibility);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Rota para registrar uma interação (like/dislike/superlike)
app.post('/api/interactions', authMiddleware, async (req, res) => {
    const { targetUserId, liked, isSuperLike } = req.body;
    const userId = req.userId;
    if (!targetUserId || typeof liked !== 'boolean') {
        return res.status(400).json({ message: 'Missing targetUserId or liked status' });
    }
    try {
        const newInteraction = await prisma.interaction.create({
            data: { userId, targetUserId, liked, isSuperLike: Boolean(isSuperLike) },
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
                const titleText = isSuperLike ? '💥 CRITICAL HIT! VOCÊS DERAM MATCH!' : '⚡ NOVO MATCH!';
                if (user1?.pushToken && Expo.isExpoPushToken(user1.pushToken)) {
                    expo.sendPushNotificationsAsync([
                        {
                            to: user1.pushToken,
                            sound: 'default',
                            title: titleText,
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
                            title: titleText,
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
// Rota para bloquear um usuário
app.post('/api/blocks', authMiddleware, async (req, res) => {
    const { blockedId } = req.body;
    const userId = req.userId;
    if (!blockedId) {
        return res.status(400).json({ message: 'Missing blockedId' });
    }
    try {
        const block = await prisma.block.create({
            data: {
                blockerId: userId,
                blockedId,
            },
        });
        res.status(201).json({ message: 'User blocked successfully', block });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error or user already blocked' });
    }
});
// Rota para denunciar um usuário
app.post('/api/reports', authMiddleware, async (req, res) => {
    const { reportedId, reason, details } = req.body;
    const userId = req.userId;
    if (!reportedId || !reason) {
        return res.status(400).json({ message: 'Missing reportedId or reason' });
    }
    try {
        const report = await prisma.report.create({
            data: {
                reporterId: userId,
                reportedId,
                reason,
                details,
            },
        });
        res.status(201).json({ message: 'Report submitted successfully', report });
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