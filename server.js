/*
Simple backend for admin to view orders and manage clients.
Dependencies: express, mysql2, cors, dotenv (optional)
Install: npm init -y && npm install express mysql2 cors dotenv
Run: node server.js

Configuration via environment variables:
  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT
*/

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const path = require('path');

const PORT = process.env.PORT || 3000;

async function createPool() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'THAnos23',
    database: process.env.DB_NAME || 'restaurant',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return pool;
}

(async () => {
  const pool = await createPool();
  const app = express();
  // Serve static files (so visiting http://localhost:3000/ returns index.html or admin.html)
  app.use(express.static(path.join(__dirname)));
  app.use(cors());
  app.use(express.json());

  // Health
  app.get('/api/health', (req, res) => res.json({ok:true}));

  // Get all clients (users with role 'client')
  app.get('/api/clients', async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, name, email, created_at FROM users WHERE role = 'client' ORDER BY created_at DESC");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({error: 'db error'});
    }
  });

  // Delete client
  app.delete('/api/clients/:id', async (req, res) => {
    const id = req.params.id;
    try {
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
      res.json({ok:true});
    } catch (err) {
      console.error(err);
      res.status(500).json({error: 'db error'});
    }
  });

  // Get orders (basic join with users)
  app.get('/api/orders', async (req, res) => {
    try {
      const [orders] = await pool.query(
        `SELECT o.id, o.client_id, u.name as client_name, u.email as client_email, o.items, o.total, o.status, o.created_at
         FROM orders o
         LEFT JOIN users u ON u.id = o.client_id
         ORDER BY o.created_at DESC`);
      // items stored as JSON in orders.items (TEXT/JSON)
      res.json(orders.map(o => ({
        id: o.id,
        client_id: o.client_id,
        client_name: o.client_name,
        client_email: o.client_email,
        items: o.items ? JSON.parse(o.items) : [],
        total: o.total,
        status: o.status,
        created_at: o.created_at
      })));
    } catch (err) {
      console.error(err);
      res.status(500).json({error: 'db error'});
    }
  });

  // Update order status
  app.post('/api/orders/:id/status', async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({error: 'status required'});
    try {
      const [r] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
      res.json({ok:true});
    } catch (err) {
      console.error(err);
      res.status(500).json({error: 'db error'});
    }
  });

  // Register a new user (client by default)
  app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });
    try {
      // check email uniqueness
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length) return res.status(409).json({ error: 'Email already registered' });

      const id = (typeof require === 'function' && require('crypto') && require('crypto').randomUUID) ? require('crypto').randomUUID() : 'user-' + Date.now();
      const pwHash = await bcrypt.hash(password, 10);
      const userRole = role === 'admin' ? 'admin' : 'client'; // allow admin only if explicitly passed (consider protecting this in production)

      await pool.query('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)', [id, name, email, pwHash, userRole]);
      res.json({ ok: true, user: { id, name, email, role: userRole } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'db error' });
    }
  });

  // Simple login endpoint (returns user basic info if credentials correct)
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    try {
      const [rows] = await pool.query('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', [email]);
      if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password_hash || '');
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      // return basic user (no session/JWT in this simple example)
      res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'db error' });
    }
  });

  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})();
