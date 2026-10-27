import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Create the Express application
const app = express();

// Read settings from the .env file (with safe defaults)
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ===== Middleware =====
// Allow requests only from our React frontend
app.use(cors({ origin: CLIENT_URL }));

// Read JSON data sent in request bodies (e.g. login form data)
app.use(express.json());

// ===== Routes =====
// GET http://localhost:5000/
app.get('/', (req, res) => {
  res.send('SchoolRide API is running 🚐');
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// ===== Error handling (must be AFTER all routes) =====
app.use(notFound);
app.use(errorHandler);

// ===== Start: connect to the database first, then start the server =====
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

startServer();