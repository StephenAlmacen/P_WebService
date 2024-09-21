import { Router, Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const uri = 'mongodb://localhost:27017/';
const dbName = 'MyApp';
let db: any;

const JWT_SECRET = process.env.JWT_SECRET || 'yourJWTSecret';
const JWT_EXPIRATION = '1h';

// Connect to MongoDB
MongoClient.connect(uri)
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error(error));

const router = Router();

// Middleware to parse cookies
router.use(cookieParser());

// Login route
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const user = await db.collection('users').findOne({ email });
    console.log(user)
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("invalid password")
      return res.status(401).send('Invalid email or password');
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    res.cookie('web_jwt', token, {
      // httpOnly: true, commented for now..need to find a way to secure and read cookie
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/', // Ensure it's available for all routes
    });

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Logout route
router.post('/logout', (req: Request, res: Response) => {
  res.cookie('web_jwt', '', { maxAge: 0 });
  res.status(200).send('Logged out successfully');
});

// Auth middleware
const authMiddleware = (req: Request, res: Response, next: any) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('No token, authorization denied');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).send('Invalid token');
  }
};

// Protected route
router.get('/protected', authMiddleware, (req: Request, res: Response) => {
  res.status(200).send(`Access granted. Your user ID: ${req.user}`);
});

export default router;
