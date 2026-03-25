const authService = require('../services/auth.service');

const AuthController = {
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email and password are required' });
            }
            const user = await authService.register(username, email, password);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });

        }
    }
};
module.exports = new AuthController();    