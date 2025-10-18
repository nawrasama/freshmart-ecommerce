const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🔧 Starting FreshMart Debug Setup...');

// Check if database file exists
const dbPath = path.join(__dirname, '../database/freshmart.db');
console.log('📁 Database path:', dbPath);
console.log('📂 Database exists:', fs.existsSync(dbPath));

// Create a simple test server
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Test database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Database connected successfully');
});

// Test endpoint - simple registration
app.post('/api/test-register', (req, res) => {
    console.log('📝 Test registration received:', req.body);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing fields' });
    }
    
    // Simple insert without hashing for testing
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
        [name, email, 'plain-text-for-test'], 
        function(err) {
            if (err) {
                console.error('❌ Insert failed:', err.message);
                return res.json({ success: false, message: err.message });
            }
            
            console.log('✅ User inserted with ID:', this.lastID);
            res.json({ 
                success: true, 
                message: 'Test registration successful',
                userId: this.lastID 
            });
        }
    );
});

// Check tables
app.get('/api/test-tables', (req, res) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            return res.json({ error: err.message });
        }
        res.json({ tables: tables.map(t => t.name) });
    });
});

// Check users
app.get('/api/test-users', (req, res) => {
    db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            return res.json({ error: err.message });
        }
        res.json({ users: rows });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Debug server running on http://localhost:${PORT}`);
    console.log(`🔧 Test endpoints:`);
    console.log(`   - GET  http://localhost:${PORT}/api/test-tables`);
    console.log(`   - GET  http://localhost:${PORT}/api/test-users`);
    console.log(`   - POST http://localhost:${PORT}/api/test-register`);
});