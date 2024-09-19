// src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { MongoClient } from 'mongodb';

// MongoDB connection URI
const uri = 'mongodb://localhost:27017/'; // replace with your MongoDB URI
const dbName = 'MyApp'; // replace with your database name
let db: any;

// Connect to MongoDB
MongoClient.connect(uri)
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error(error));

const router = Router();

// Login route
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log('Login =' + req.body.email + req.body.password);
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const user = await db.collection('users').findOne({ email });
    
    console.log(user);
    if (user && user.password === password) { // Replace this with proper password hashing and comparison
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

export default router;
