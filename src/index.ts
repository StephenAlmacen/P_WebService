import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/login/auth'; // Corrected path to 'auth'
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to parse cookies
app.use(cookieParser());

// CORS configuration to allow credentials (cookies)
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  credentials: true, // Allow cookies to be sent
}));

// Use routes
app.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
