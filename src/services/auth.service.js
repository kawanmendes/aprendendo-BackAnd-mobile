const bcrypt = require('bcrypt');
const Database = require('../database/database');
const jwt = require('jsonwebtoken');
const database = require('../database/database');

class AuthService {
    async register(username, email, password) {
        console.log('registering user', username, email);
        const existingUser = await Database.get('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser) {
            throw new Error('Username or email already exists');
        } 
        const usernameExists = await Database.get('SELECT * FROM users WHERE username = $1', [username]);
        if (usernameExists) {
            throw new Error('Username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password) VALUES (1$, 2$, 3$) RETURNING id'
        const values = [username,email,password]
        const result = await database.query(query,values)
        const userId = result.rows[0].Id;

        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '8h' });
        return { user : { id: userId, username, email }, token };
    }
    async login(email, password) {
        const user = await Database.get('SELECT * FROM users WHERE email = $1', [email]);
        if (!user) {
            throw new Error('Missing email or password');
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error('Missing/invalid email or password');
        }
        await database.run('UPDATE users SET last_login = NOW(), is_online = TRUE WHERE id = $1', [user.id]);
        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN });

        return {token, user: { id: user.id, username: user.username, email: user.email }, };
    }

    async getProfile(userId) {  
        const user = await Database.get('SELECT id, username, email FROM users WHERE id = $1', [userId]);
        return await user;
    }
    async setUserOnlineStatus(userId, isOnline) {
        await database.run('UPDATE users SET is_online = $1 WHERE id = $2', [isOnline, userId]);
        return { message: `User ${isOnline ? 'online' : 'offline'} status updated successfully` };
    }
};
module.exports = new AuthService();