const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/freshmart.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database for testing');
        testDatabase();
    }
});

function testDatabase() {
    // Test creating tables
    db.run(`CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating test table:', err);
        } else {
            console.log('✅ Test table created successfully');
            
            // Test inserting data
            db.run('INSERT INTO test_table (name) VALUES (?)', ['Test Data'], function(err) {
                if (err) {
                    console.error('❌ Error inserting test data:', err);
                } else {
                    console.log('✅ Test data inserted successfully');
                    
                    // Test reading data
                    db.get('SELECT * FROM test_table WHERE id = ?', [this.lastID], (err, row) => {
                        if (err) {
                            console.error('❌ Error reading test data:', err);
                        } else {
                            console.log('✅ Test data read successfully:', row);
                        }
                        
                        // Clean up
                        db.run('DROP TABLE test_table', (err) => {
                            if (err) {
                                console.error('❌ Error cleaning up:', err);
                            } else {
                                console.log('✅ Test table cleaned up');
                            }
                            db.close();
                        });
                    });
                }
            });
        }
    });
}