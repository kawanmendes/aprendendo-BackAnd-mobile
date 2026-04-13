const express = require('express');
const AuthController = require('../controller/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {validate , schemas} = require('../middleware/validation.middleware');
const {AuthLimiter} = require('../middleware/rateLimit.middleware');

const router = express.Router();

router.post('/register', AuthLimiter, validate(schemas.register), AuthController.register);
router.get('/profile', authMiddleware, AuthController.getProfile);
router.post('/login', AuthLimiter, validate(schemas.login), AuthController.login);
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;
