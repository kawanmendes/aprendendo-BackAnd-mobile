const joi = require('joi');
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    };
};
const schemas = {
    registerSchema: joi.object({
        username: joi.string().pattern(/^[a-zA-Z0-9_]+$/).required().messages({
            'string.pattern.base': 'Username can only contain letters, numbers, and underscores.'
        }),
        email: joi.string().email().required(),
        password: joi.string().min(12).required().messages({
            'string.min': 'Password must be at least 12 characters long.'
        })
    }),
    login: joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(12).required()
    }),
    message: joi.object({
        content: joi.string().max(500).required(),
    }),
    
    joinQueue: joi.object({
        interests: joi.object({
            category: joi.string().valid('games', 'series', 'movies').required(),
        }).required()

    }),      
};
module.exports = { validate, schemas };