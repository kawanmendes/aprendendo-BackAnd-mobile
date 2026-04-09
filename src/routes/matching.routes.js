const express = require('express');
const MatchingController = require('../controller/matching.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {validate , schemas} = require('../middleware/validation.middleware');
const {matchingLimiter, chatLimiter} = require('../middleware/rateLimit.middleware');
const { route } = require('./chat.routes');

const router = express.Router();
router.use(authMiddleware);
router.use(chatLimiter);

router.post('/find',
    validate(schemas.joinQueue),
    MatchingController.joinQueue
);
router.delete('/leave',
    MatchingController.leaveQueue
);
router.post('/stats',
    MatchingController.getQueueStatus
);

module.exports = router;