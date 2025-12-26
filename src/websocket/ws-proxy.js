const WebSocket = require('ws');
const url = require('url');

const EXTERNAL_WS_BASE = 'wss://veeshov1.veeshoplatform.com';
const ADMIN_SECRET = 'admin@livefxhub@123';

/**
 * Setup WebSocket proxy for demo orders
 * @param {http.Server} server - The HTTP server instance
 */
function setupWebSocketProxy(server) {
    const wss = new WebSocket.Server({ noServer: true });

    // Handle HTTP upgrade requests
    server.on('upgrade', (request, socket, head) => {
        const pathname = url.parse(request.url).pathname;

        // Only handle /ws/demo-orders path
        if (pathname === '/ws/demo-orders') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    });

    // Handle WebSocket connections
    wss.on('connection', (clientWs, request) => {
        const query = url.parse(request.url, true).query;
        const demoUserId = query.demoUserId;

        if (!demoUserId) {
            clientWs.send(JSON.stringify({ error: 'demoUserId required' }));
            clientWs.close();
            return;
        }

        console.log(`[WS Proxy] Client connected for demoUserId: ${demoUserId}`);

        // Connect to external WebSocket with header
        const externalWsUrl = `${EXTERNAL_WS_BASE}/ws/admin-secret/demo-orders?demoUserId=${demoUserId}`;
        const externalWs = new WebSocket(externalWsUrl, {
            headers: {
                'x-admin-secret': ADMIN_SECRET
            }
        });

        externalWs.on('open', () => {
            console.log(`[WS Proxy] Connected to external WS for user ${demoUserId}`);
            clientWs.send(JSON.stringify({ type: 'proxy_connected' }));
        });

        externalWs.on('message', (data) => {
            // Forward message from external WS to client
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(data.toString());
            }
        });

        externalWs.on('error', (error) => {
            console.error(`[WS Proxy] External WS error:`, error.message);
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'error', message: error.message }));
            }
        });

        externalWs.on('close', () => {
            console.log(`[WS Proxy] External WS closed for user ${demoUserId}`);
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.close();
            }
        });

        // Handle client disconnect
        clientWs.on('close', () => {
            console.log(`[WS Proxy] Client disconnected for demoUserId: ${demoUserId}`);
            if (externalWs.readyState === WebSocket.OPEN) {
                externalWs.close();
            }
        });

        clientWs.on('error', (error) => {
            console.error(`[WS Proxy] Client WS error:`, error.message);
            if (externalWs.readyState === WebSocket.OPEN) {
                externalWs.close();
            }
        });
    });

    console.log('✅ WebSocket proxy initialized for /ws/demo-orders');
}

module.exports = { setupWebSocketProxy };
