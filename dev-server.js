#!/usr/bin/env node

// Simple development server for ES modules
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = path.join(ROOT_DIR, pathname);
    const ext = path.extname(filePath);
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Security check - prevent directory traversal
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // For SPA routing, serve index.html for unmatched routes
                if (ext === '' || ext === '.html') {
                    fs.readFile(path.join(ROOT_DIR, 'index.html'), (indexErr, indexData) => {
                        if (indexErr) {
                            res.writeHead(404);
                            res.end('Not Found');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(indexData);
                        }
                    });
                } else {
                    res.writeHead(404);
                    res.end('Not Found');
                }
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            // Set appropriate headers for ES modules
            const headers = { 'Content-Type': mimeType };
            
            if (ext === '.js') {
                headers['Cache-Control'] = 'no-cache';
            }
            
            // CORS headers for development
            headers['Access-Control-Allow-Origin'] = '*';
            headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
            
            res.writeHead(200, headers);
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Development server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${ROOT_DIR}`);
    console.log(`🔧 ES modules supported`);
    console.log('');
    console.log('🌐 Open in browser: http://localhost:' + PORT);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});