const rateLimit = require('express-rate-limit');
const AuthLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max : 20, // limit each IP to 20 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
});

const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max : 100, // limit each IP to 100 requests per windowMs
    message: 'Too many messages sent from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
});
const chatLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max : 50, // limit each IP to 50 requests per windowMs
    message: 'Too many messages sent from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
});
module.exports = { AuthLimiter, messageLimiter, chatLimiter };