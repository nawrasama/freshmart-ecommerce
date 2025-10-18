const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Ensure database directory exists
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Created database directory');
}

// Database initialization
const dbPath = path.join(dbDir, 'freshmart.db');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    console.log('🔄 Initializing database tables...');
    
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            category TEXT,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`,
        `CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )`
    ];

    let completed = 0;
    tables.forEach((sql, index) => {
        db.run(sql, (err) => {
            if (err) {
                console.error(`❌ Error creating table ${index + 1}:`, err.message);
            } else {
                console.log(`✅ Table ${index + 1} created/verified`);
            }
            completed++;
            
            if (completed === tables.length) {
                checkAndInsertSampleData();
            }
        });
    });
}

function checkAndInsertSampleData() {
    console.log('🔍 Checking for sample data...');
    
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) {
            console.error('❌ Error checking products:', err.message);
            return;
        }
        
        if (row.count === 0) {
            console.log('📦 Inserting sample products...');
            insertSampleProducts();
        } else {
            console.log(`✅ Products already exist: ${row.count} products`);
        }
    });
}

function insertSampleProducts() {
    const sampleProducts = [
        {
            name: "Munchee Super Cream Cracker 490g",
            description: "Delicious cream crackers perfect for snacks",
            price: 230.00,
            stock: 10,
            category: "Food & Refreshment",
            image: "images/munchee-crackers.jpg"
        },
        {
            name: "Sunlight Matic Liquid 1L",
            description: "Advanced laundry liquid for tough stains",
            price: 480.00,
            stock: 5,
            category: "Home Care",
            image: "images/sunlight-liquid.jpg"
        }
    ];

    const stmt = db.prepare(`INSERT INTO products (name, description, price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?)`);
    
    let inserted = 0;
    sampleProducts.forEach(product => {
        stmt.run([
            product.name,
            product.description,
            product.price,
            product.stock,
            product.category,
            product.image
        ], (err) => {
            if (err) {
                console.error('❌ Error inserting product:', err.message);
            } else {
                inserted++;
                console.log(`✅ Inserted: ${product.name}`);
            }
            
            if (inserted === sampleProducts.length) {
                stmt.finalize();
                console.log('🎉 Sample data insertion completed');
            }
        });
    });
}

// Import and use routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes(db));
app.use('/api/products', productRoutes(db));
app.use('/api/orders', orderRoutes(db));

// Debug endpoints
app.get('/api/debug', (req, res) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const tableData = {};
        let completed = 0;
        
        if (tables.length === 0) {
            return res.json({ message: 'No tables found', tables: [] });
        }
        
        tables.forEach(table => {
            db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
                tableData[table.name] = row ? row.count : 0;
                completed++;
                
                if (completed === tables.length) {
                    res.json({
                        message: 'Database status',
                        tables: tableData,
                        databasePath: dbPath
                    });
                }
            });
        });
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'FreshMart API is running',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🎉 FreshMart Server Started Successfully!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔧 API Base: http://localhost:${PORT}/api`);
    console.log(`📊 Debug: http://localhost:${PORT}/api/debug`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});

module.exports = db;