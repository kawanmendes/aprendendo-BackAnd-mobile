const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../database/database');

class AuthService {
    async register(username, email, password) {
        console.log('registering user', username, email);
        const existingUser = await database.get('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser) {
            throw new Error('Username or email already exists');
        } 
        const usernameExists = await database.get('SELECT * FROM users WHERE username = $1', [username]);
        if (usernameExists) {
            throw new Error('Username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id';
        const values = [username, email, hashedPassword];
        const result = await database.query(query, values);
        const userId = result[0].id;

        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '8h' });
        return { user : { id: userId, username, email }, token };
    }
    async login(email, password) {
        const users = await database.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = users[0];
        if (!user) {
            throw new Error('Missing email or password');
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error('Missing/invalid email or password');
        }
        await database.query('UPDATE users SET last_login = NOW(), is_online = TRUE WHERE id = $1', [user.id]);
        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN });

        return {token, user: { id: user.id, username: user.username, email: user.email }, };
    }

    async getProfile(userId) {  
        const users = await database.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
        return users[0];
    }
    async setUserOnlineStatus(userId, isOnline) {
        await database.query('UPDATE users SET is_online = $1 WHERE id = $2', [isOnline, userId]);
        return { message: `User ${isOnline ? 'online' : 'offline'} status updated successfully` };
    }
};
module.exports = new AuthService();