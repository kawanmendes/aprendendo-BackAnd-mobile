const matchingService = require('../services/matching.service');
class chatController {
    async getRooms(req, res) {
        try {
            const userId = req.user.id;
            const rooms = matchingService.getUserRooms(userId);
            const formattedRooms = rooms.map(room => ({
                id: room.id,
                category: room.category,
                status: room.status,
                partner: {
                    username: 'anonimous',
                },
                createdAt: room.createdAt
            }));
            res.json({
                success : true ,
                data :{

                    rooms : formattedRooms
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getRoomMessages(req, res) {
        try {
            const {roomId} = req.params;
            const {page = 1, limit = 50} = req.query;
            const room = matchingService.getRoomById(roomId);
            if (!room || (room.user1Id !== req.user.userId && room.user2Id !== req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not a participant in this room.'
                });
            }
            res.json({
                success: true,
                data: {
                    messages: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        hasMore: false
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async sendMessage(req, res) {
        try {
            const {roomId} = req.params;
            const {content} = req.body;
            const room = matchingService.getRoomById(roomId);

            if (!room || (room.user1Id !== req.user.userid && room.user2Id !== req.user.userid)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to this room'
                });
            }
            res.json(201).json({
                success: true,
                message: 'Use webSocket for real-time messaging'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }
    async leaveRoom(req, res) {
        try {
            const {roomId} = req.params;
            const userId = req.user.id;
            const room = matchingService.leaveRoom(roomId, userId);
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: 'Room not found.'
                });
            }
            res.json({
                success: true,
                message: 'Successfully left the room'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}
module.exports = new chatController();