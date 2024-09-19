// src/server.ts
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/login/auth';
import cors from 'cors';
const app = express();
const port = 5000; // or any port of your choice

// Middleware
app.use(bodyParser.json());
app.use(cors());
// Use routes
app.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
