const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Basic orders endpoint
    router.get('/', (req, res) => {
        res.json({ message: 'Orders endpoint' });
    });

    return router;
};