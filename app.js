require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io'); // Corrigido de socktetIo
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Importações de banco e rotas
const database = require('./src/database/database');
const chatRoutes = require('./src/routes/chat.routes');
const matchingRoutes = require('./src/routes/matching.routes');
const authRoutes = require('./src/routes/auth.routes');
const websocketService = require('./src/services/websocket.service');

const app = express(); // Usando 'app' minúsculo para padronizar
const server = http.createServer(app); // Corrigido de servr e APP

const io = socketIo(server, { // Corrigido de socktetIo
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Conexão com o Banco de Dados
database.connect().catch(console.error);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Rotas Base
app.get('/api/', (_req, res) => {
    res.json({
        message: 'MeetStranger API',
        version: '2.0.0',
        status: 'running',
        author: 'kawan mendes',
        description: 'API for MeetStranger, a random chat application.'
    });
});

// Registro de Rotas
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/matching', matchingRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timeStamp: new Date().toISOString(),
        services: {
            database: 'connected',
            websocket: 'active'
        }
    });
});

// Inicialização do WebSocket
websocketService.initialize(io);

// Middleware de Erro Global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'internal server error'
    });
});

// Desligamento Gracioso
process.on('SIGINT', async () => { // Corrigido de SINGINT
    console.log('\n shutting down server gracefully...');
    if (database.close) await database.close();
    process.exit(0);
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => { // Corrigido de Server.listen para server.listen
        console.log(`Server is running on port ${PORT}`);
        console.log(`WebSocket server ready`);
        console.log(`api documentation: http://localhost:${PORT}/docs`);
        console.log(`database: SQLite`);
    });
}

module.exports = app;