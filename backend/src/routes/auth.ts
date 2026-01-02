import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database';

const router = Router();

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
      phone?: string;
    name: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
      phone?: string;
  };
}

// Register endpoint
router.post('/register', async (req: RegisterRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const userExists = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    // Generate JWT
    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });

    res.json({ user: result.rows[0], token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req: LoginRequest, res: Response) => {
  try {
    const { email, phone, password

    // Validate input
    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

// Find user by email or phone
    let result;
    if (email) {
      result = await query('SELECT * FROM users WHERE email = $1', [email]);
    } else if (phone) {
      result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    }
    
    if (result?.rows.length === 0) {    const user = result.rows[0]; const isPasswordValid = await bcrypt.compare(password, user.password);
                                          return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
