require('dotenv').config();
const express = require('express');
const http = require('http');
const socktetIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
//const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const database = require('./src/database');
const chatRoutes = require('./src/routes/chat.routes');
const matchingRoutes = require('./src/routes/matching.routes');
const authroutes = require('./src/routes/auth.routes');
const websocketService = require('./src/services/websocket.service');
const { timeStamp } = require('console');

const APP = express();
const servr = http.createServer(APP);
const io = socktetIo(servr, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
database.connect().catch(console.error);
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
    origin: '*',
}));
app.use(express.json({limit: '10mb'}));

app.get('/api/', (_req, res) => {
    res.json({
        message: 'MeetStranger API',
        version: '2.0.0',
        status: 'running',
        author: 'kawan mendes',
        description: 'API for MeetStranger, a random chat application.'
    });
});
app.use('/api/auth', authroutes);
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

websocketService.initialize(io);
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({
        success: false,
        message: 'internal server error'
    });
});
process.on('SINGINT', async() => {
    console.log('\n shutting down server gracefully...');
    await database.close();
    process.exit(0);
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
    Server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(` WebSocket server ready`);
        console.log(`api documentation: http://localhost:${PORT}/docs`);
        console.log(`database: SQLite`)
    });  

}
module.exports = app;