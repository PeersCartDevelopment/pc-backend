import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRouter from './routes/userRoutes.js'; // Adjust path if necessary
import process from 'process';

dotenv.config();

const app = express();

// Allowed Origins - Include both localhost and production URLs
const allowedOrigins = [
  'http://localhost:5173', // Local development URL
  'https://peerscart.store', // Production frontend URL
  'https://d31mh2zg6ljbx9.cloudfront.net', // CloudFront URL
];

app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // For Postman or other tools without origin
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS')); // This ensures only allowed origins can make requests
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Add any other headers as necessary
    credentials: true, // If you are using cookies/sessions
  })
);

// Mount the user routes
app.use('/api/users', userRouter);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});