const e = require('express');
const {V4: uuidv4} = require('uuid');

const waitingQueue = {
    games: [],
    series: [],
    movies: []
};

const activeRooms = new Map();

class MatchingService {
    async joinQueue(userId, socketID, category) {
        console.log(`User ${userId} joined the ${category} queue with socket ID ${socketID}`);
        this.leaveQueue(userId); 
        const queue = waitingQueue[category];

        if (!queue) {
            throw new Error('Invalid category');
        }
        console.log(`Current queue for ${category}:`, queue);
        console.log(`users waiting:`, queue.length);
        if (queue.length > 0) {
            const partner = queue.shift();
            const roomId = uuidv4();
            const room = {
                id: roomId,
                userId1: partner.userId,
                userId2: userId,
                user1SocketID: partner.socketID,
                user2SocketID: socketID,
                status: 'active',
                category,
                createdAt: new Date()
            };
            activeRooms.set(roomId, room);
            console.log(`Matched users ${partner.userId} and ${userId} in room ${roomId}`);
            return {
                matched : true,
                roomId,
                category,
                partner: partner.userId,
                partnerSocketID: partner.socketID 
            };
        } else {
            const queueItem = { userId, socketID , Timestamp: new Date()};
            queue.push(queueItem);  

            return { matched: false, 
                category,
                position: queue.length,
                estimedWaitTime: this.estimateWaitTime(queue.length)
        };
        }
    }leaveQueue(userId, category = null ) {
        if (category) {
            const queue = waitingQueue[category];
            if (queue) {         
                const index = queue.findIndex(item => item.userId === userId);
                if (index > -1) {
                    queue.splice(index, 1);
                    return true;
                }
            }else {
                this.leaveQueueFromAllCategories(userId);
            }
            return false;
        }       
    }
    leaveQueueFromAllCategories(userId) {
        Object.keys(waitingQueue).forEach(category => {
            this.leaveQueue(userId, category);
        });
    }
    getUserRoom(userId) {
        return Array.from(activeRooms.values()).find(room => room.userId1 === userId || room.userId2 === userId);
    }
    leaveRoom(userId) {
        const room = this.getUserRoom(userId);
        if (room) {
            activeRooms.delete(room.id);
            const partnerId = room.userId1 === userId ? room.userId2 : room.userId1;
            const partnerSocketID = room.userId1 === userId ? room.user2SocketID : room.user1SocketID;
            return {...room, partnerId, partnerSocketID,status: 'ended', endedAt: new Date()};
        }return null;
    }
    calculateWaitTime(queuePosition) {
        const averageMatchTime = 30;
        const estimatedWaitTime = queuePosition * averageMatchTime;
        if (estimatedWaitTime < 60) {
            return `${estimatedWaitTime} seconds`;
        }else {
            const minutes = Math.floor(estimatedWaitTime / 60);
            const seconds = estimatedWaitTime % 60;
            return `${minutes} minutes ${seconds} seconds`;
        }
    }
    getQueueStats() {
        return {
            games: waitingQueue.games.length,
            series: waitingQueue.series.length,
            movies: waitingQueue.movies.length,
            activeRooms: activeRooms.size
        }
    }cleanupInactiveRooms() {
        const now = new Date();
        const timeout = 5 * 60 * 1000; //5 minutes
        activeRooms.forEach((room, roomId) => {
            if (now - room.createdAt > timeout) {
                activeRooms.delete(roomId);
                console.log(`Room ${roomId} has been removed due to inactivity.`);
            }
        });
    }
}
module.exports = new MatchingService();