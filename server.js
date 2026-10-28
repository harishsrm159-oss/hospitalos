/**
 * HospitalOps Intelligence - Local HTTP & Mock API Server
 * Built with standard Node.js (Zero external dependencies)
 * Serves the web workspace and simulates backend endpoints from Slide 9.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// In-memory mock database
const db = {
  incidents: [
    {
      id: 'INC-4091',
      title: 'MRI scanner offline',
      department: 'Imaging',
      location: 'Radiology Suite Rad-104',
      status: 'Assessing',
      severity: 'High',
      suggestedPlan: 'PLAN V2: Use verified alternate scanner'
    },
    {
      id: 'INC-2048',
      title: 'Network outage',
      department: 'IT / Telecom',
      location: 'Block C Core Distribution',
      status: 'Assigned',
      severity: 'Critical',
      suggestedPlan: 'Failover to secondary fiber trunk B'
    }
  ],
  auditLog: [],
  idempotencyKeys: new Set()
};

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Idempotency-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/incidents' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', data: db.incidents }));
      return;
    }

    if (pathname === '/api/webhook/reports' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const idempotencyKey = req.headers['x-idempotency-key'] || payload.idempotency_key || payload.message;

          if (idempotencyKey && db.idempotencyKeys.has(idempotencyKey)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'acknowledged',
              idempotent: true,
              message: 'Duplicate event detected. Zero side effects created.',
              incidentId: 'INC-2048'
            }));
            return;
          }

          if (idempotencyKey) {
            db.idempotencyKeys.add(idempotencyKey);
          }

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'created',
            idempotent: false,
            message: 'Report correlated successfully.',
            incidentId: 'INC-2048'
          }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      });
      return;
    }

    if (pathname === '/api/audit-log' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', data: db.auditLog }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
    return;
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  HOSPITALOPS INTELLIGENCE - PLATFORM RUNNING`);
  console.log(`  Access URL: http://localhost:${PORT}`);
  console.log(`  Directory:  ${PUBLIC_DIR}`);
  console.log(`=======================================================`);
});

