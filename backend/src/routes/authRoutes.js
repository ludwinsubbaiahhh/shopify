import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Simple email-based authentication (for demo purposes)
// In production, use proper user management with database

const DEMO_USERS = [
  {
    email: 'admin@example.com',
    password: '$2a$10$rOzJqZqZqZqZqZqZqZqZqO', // "password" hashed
  },
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Simple demo authentication - accept any email/password for demo
    // In production, use proper user management with database
    const user = DEMO_USERS.find(u => u.email === email) || { email };
    
    // For demo, accept any email/password (in production, use bcrypt.compare)
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register endpoint (demo)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // In production, hash password and store in database
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // For demo, just return success
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

