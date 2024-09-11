import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail } from './email.js'; // Ensure this path is correct

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,  // Store hashed password
      isVerified: false,
    });

    await newUser.save();

    // Send verification email
    await sendVerificationEmail(newUser);

    res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error });
  }
});

// Send Verification Email Helper Function
const sendVerificationEmail = async (user) => {
  const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const verificationLink = `http://localhost:5001/api/users/verify/${verificationToken}`;

  const emailContent = `
    <h2>Thank you for registering to PeersCart!</h2>
    <p>Please click the link below to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
  `;

  await sendEmail(user.email, 'Email Verification', emailContent);
};

// Verify Email Route
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's verification status
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Find the user by username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(400).json({ message: 'Error logging in', error });
  }
});

// Request Account Deletion Route
router.post('/request-delete-account', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing.' });
    }

    // Split the header and get the token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Invalid Authorization header format. Expected format: Bearer <token>' });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create deletion token and link
    const deletionToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const deleteLink = `http://localhost:5001/api/users/delete-account/${deletionToken}`;

    const emailSubject = 'Delete your account';
    const emailContent = `<p>Click <a href="${deleteLink}">here</a> to delete your account.</p>`;

    await sendEmail(user.email, emailSubject, emailContent);

    res.status(200).json({ message: 'Account deletion email sent successfully.' });
  } catch (error) {
    console.error('Error during delete request:', error);
    res.status(500).json({ message: 'Error requesting account deletion.', error: error.message });
  }
});

// Delete Account Route
router.get('/delete-account/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Verify deletion token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Delete the user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account.', error: error.message });
  }
});

export default router;