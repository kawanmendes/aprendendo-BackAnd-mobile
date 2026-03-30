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
    },
    async login(req, res) {
       try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            const user = await authService.login(email, password);
            res.status(200).json(user);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    },
    async logout(req, res) {   
        res.status(200).json({ message: 'Logged out successfully' });
    },
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await authService.getProfile(userId);
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};
module.exports = new AuthController();    