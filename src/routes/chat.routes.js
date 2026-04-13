const express = require('express');
const ChatController = require('../controller/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {validate , schemas} = require('../middleware/validation.middleware');

const {chatLimiter, messageLimiter} = require('../middleware/rateLimit.middleware');

const router = express.Router();
router.use(authMiddleware);
router.use(chatLimiter);

router.get('/rooms', 
    ChatController.getRooms
);
router.get('/rooms/:roomId/messages',
    ChatController.getRoomMessages
);
router.post('/rooms/:roomId/messages',
    validate(schemas.message),
    ChatController.sendMessage
);
router.post('/rooms/:roomId/leave',
    ChatController.leaveRoom
);
module.exports = router;