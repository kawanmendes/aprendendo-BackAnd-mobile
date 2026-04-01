const jwt = require('jsonwebtoken');
const matchingService = require('./matching.service');
const authService = require('./auth.service');
const {v4: uuidv4} = require('uuid');

class WebSocketService {
    constructor(){
        this.io = null;
        this.connectedUsers = new Map();
    }
    initialize(io) {
        this.io = io;
        io.on('connection', (socket) => {
            console.log(`New client connected: ${socket.id}`);
            socket.on('authenticate', async (data) => {
                try {
                    const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
                    socket.userId = decoded.userid;
                    this.connectedUsers.set(socket.userId, socket.id);
                    console.log(`User ${socket.userId} authenticated with socket ID ${socket.id}`);
                    await authService.updateUserStatus(decoded.userId, true);
                    socket.emit('authenticated', { success: true });
                } catch (error) {
                    socket.emit('authFailed', { success: false, message: 'token invalid' });
                }
            });
            socket.on('find-match', async (data) => {
            if (!socket.userId) {
                socket.emit('match-error', { message: 'User not authenticated' });
                return;
            }
            const { category } = data;
            if (!['games', 'series', 'movies'].includes(category)) {
                socket.emit('match-error', { message: 'Invalid category' });
                return;
            }
            /*
            const categoryMap = {
                'games': 'jogos',
                'series': 'series',
                'movies': 'filmes'
            };  
            const result = matchingService.joinQueue(socket.userId, socket.id, categoryMap[category]);
            */
            const result = matchingService.joinQueue(socket.userId, socket.id, category);
            if (result.matched) {
                const user1 = await authService.getUserById(socket.userId);
                const user2 = await authService.getUserById(result.partner);
                const partnerSocket = this.io.sockets.sockets.get(result.partnerSocketID);
                    socket.emit('match-found', {
                        roomId: result.roomId,
                        category: result.category,
                        partner: {username : user2 ? user2.username : 'Stranger'}
                    });
                    if (partnerSocket) {
                        partnerSocket.emit('match-found', {
                            roomId: result.roomId,
                            category: result.category,
                            partner: {username : user1 ? user1.username : 'Stranger'}
                        });
                    }
            } else {
                socket.emit('match-status', {
                    category: result.category,
                    position: result.position,
                    estimatedWaitTing: result.estimatedWaitTing
                
                });
            }}); 
            socket.on('leave-queue', (data) => {
                if (!socket.userId) {
                    socket.emit('match-error', { message: 'matchmaking failed' });
                    return;
            }}); 
            socket.on('join-room', (data) => {
                const room = matchingService.getRoom(data.roomId);
                if (room && (room.userId1 === socket.userId || room.userId2 === socket.userId)) {
                    socket.join(data.roomId);
                    socket.emit('room-joined', { roomId: data.roomId });     
            }});

            socket.on('typing_start', (data) => {
                if (socket.currentRoom) {
                    socket.to(socket.currentRoom).emit('partner_typing_start' , {isTyping: true});
                }});
            socket.on('typing_stop', (data) => {
                if (socket.currentRoom) {
                    socket.to(socket.currentRoom).emit('partner_typing_stop' , {isTyping: false});
                }});
            socket.on('leave-room', (data) => {
                this.handleLeaveRoom(socket, data.roomId);
                }); 
            socket.on('send-message', async (data) => {
                if(!socket.currentRoom || !socket.userId) return;
                const sender = await authService.getUserById(socket.userId);
                senderUsername = sender ? sender.username : 'Stranger';
                const message = {id: uuidv4(),
                    senderId: socket.userId,
                    message: data.message,
                    timestamp : new Date(),
                };  
                socket.to(socket.currentRoom).emit('new-message', {
                    id: message.id,
                    message: message.message,
                    username: senderUsername,
                    timestamp: message.timestamp
                });
            });
            socket.on('disconnect', async () => {
                console.log(`Client disconnected: ${socket.id}`);
                if (socket.userId) {
                    await authService.setUserOnlineStatus(socket.userId, false);
                    matchingService.leaveQueue(socket.userId);
                    this.connectedUsers.delete(socket.userId);
                    this.handleLeaveRoom(socket, socket.currentRoom, true);
            }});
        });
        setInterval(() => { matchingService.cleanupQueues(); }, 5 * 60 * 1000);
    }    
}
module.exports = new WebSocketService();