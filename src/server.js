require('dotenv').config();
const http = require('http');
const app = require('./app');
const { sequelize, testConnection } = require('./config/db');
const Contact = require('./models/contact.model');
const Admin = require('./models/admin.model');
const { setupWebSocketProxy } = require('./websocket/ws-proxy');

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync models with database
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized successfully.');

        // Create HTTP server
        const server = http.createServer(app);

        // Setup WebSocket proxy
        setupWebSocketProxy(server);

        // Start server
        server.listen(PORT, () => {
            console.log(`\n🚀 Server is running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            console.log(`🔐 Auth Endpoint: http://localhost:${PORT}/api/auth`);
            console.log(`🔗 Contacts Endpoint: http://localhost:${PORT}/api/contacts`);
            console.log(`🔌 WebSocket Proxy: ws://localhost:${PORT}/ws/demo-orders`);
            console.log(`\n📂 Upload folders:`);
            console.log(`   - Company Certificates: /uploads/company_certificates/`);
            console.log(`   - ID Proofs: /uploads/id_proofs/`);
            console.log(`\n💡 Run seed script to create super admin: node src/seed.js`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
