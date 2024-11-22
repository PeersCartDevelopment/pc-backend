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
  'https://localhost:5173', // Local development URL
  'http://localhost:5173',  // Local development URL (non-HTTPS)
  'https://peerscart.store', // Production frontend URL
  'https://d31mh2zg6ljbx9.cloudfront.net', // CloudFront URL
  'https://peerscart.netlify.app', // Netlify URL
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // For Postman or other tools without origin
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true); // Allow the origin
      } else {
        callback(new Error('Not allowed by CORS')); // Reject the request if not allowed
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods, including OPTIONS for preflight requests
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow credentials (cookies, headers)
  })
);

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Handling pre-flight OPTIONS request for CORS
app.options('*', cors()); // Allow all origins for OPTIONS requests

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
    process.exit(1); // Exit the process if MongoDB connection fails
  }
};

connectDB();

// Start the server and listen on the specified port
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on: https://localhost:${PORT}`);
});