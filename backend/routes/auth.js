const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

module.exports = (db) => {
    // Register endpoint
    router.post('/register', async (req, res) => {
        console.log('📝 Registration request received:', req.body);
        
        try {
            const { name, email, password } = req.body;

            // Validation
            if (!name || !email || !password) {
                console.log('❌ Missing fields');
                return res.status(400).json({ 
                    success: false, 
                    message: 'All fields are required' 
                });
            }

            if (password.length < 6) {
                console.log('❌ Password too short');
                return res.status(400).json({ 
                    success: false, 
                    message: 'Password must be at least 6 characters long' 
                });
            }

            // Check if user already exists
            db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
                if (err) {
                    console.error('❌ Database error:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Database error' 
                    });
                }

                if (user) {
                    console.log('❌ User already exists:', email);
                    return res.status(400).json({ 
                        success: false, 
                        message: 'User already exists with this email' 
                    });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                console.log('🔐 Password hashed');

                // Insert new user
                db.run(
                    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                    [name, email, hashedPassword],
                    function(err) {
                        if (err) {
                            console.error('❌ Error creating user:', err);
                            return res.status(500).json({ 
                                success: false, 
                                message: 'Error creating user: ' + err.message 
                            });
                        }

                        console.log('✅ User registered successfully:', { email, userId: this.lastID });
                        res.json({ 
                            success: true, 
                            message: 'Registration successful! Please login.',
                            userId: this.lastID 
                        });
                    }
                );
            });

        } catch (error) {
            console.error('❌ Registration error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error during registration' 
            });
        }
    });

    // Login endpoint
    router.post('/login', async (req, res) => {
        console.log('🔑 Login request received:', req.body);
        
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email and password are required' 
                });
            }

            // Find user
            db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
                if (err) {
                    console.error('❌ Database error:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Database error' 
                    });
                }

                if (!user) {
                    console.log('❌ User not found:', email);
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Invalid email or password' 
                    });
                }

                // Check password
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    console.log('❌ Invalid password for:', email);
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Invalid email or password' 
                    });
                }

                // Login successful
                console.log('✅ Login successful for:', user.email);
                res.json({
                    success: true,
                    message: 'Login successful!',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    },
                    token: 'mock-jwt-token-' + user.id
                });
            });

        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error during login' 
            });
        }
    });

    // Get user profile (protected route)
    router.get('/profile', (req, res) => {
        // This would typically verify JWT token
        const token = req.headers.authorization;
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access token required' 
            });
        }

        // Mock user data - in real app, decode JWT token
        res.json({
            success: true,
            user: {
                id: 1,
                name: "Test User",
                email: "test@example.com"
            }
        });
    });

    return router;
};