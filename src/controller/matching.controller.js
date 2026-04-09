const matchingService = require('../services/matching.service');

class matchingController {
    async joinQueue(req, res) {
        try {
            const {category} = req.body;
            const userId = req.user.id;
            res.json({
            success : true,
            message : `Use webSocket for real-time maching matchmaking` 
            });
        } catch (error) {
            res.status(400).json({
                success: false, 
                message: error.message
            });
        }
    }
    async leaveQueue(req, res) {
        try {
            const userId = req.user.id;
            matchingService.leaveQueueFromAllCategories(userId);
            res.json({
                success: true,
                message: 'Successfully left the queue'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });}}
    async getQueueStatus(req, res) {
        try {
            const stats = matchingService.getQueueStats();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }        
}