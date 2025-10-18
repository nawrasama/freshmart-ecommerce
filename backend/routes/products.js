const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Get all products
    router.get('/', (req, res) => {
        db.all('SELECT * FROM products', (err, rows) => {
            if (err) {
                console.error('❌ Error fetching products:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(rows);
        });
    });

    // Get single product
    router.get('/:id', (req, res) => {
        const productId = req.params.id;
        db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
            if (err) {
                console.error('❌ Error fetching product:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(row);
        });
    });

    return router;
};