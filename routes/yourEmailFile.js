import jwt from 'jsonwebtoken';
import { sendEmail } from './email.js'; // Adjust the path accordingly

export async function sendVerificationEmail(user) {
  const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Ensure this is the correct route on the backend for email verification
  const verificationLink = `${process.env.API_URL}/api/users/verify/${verificationToken}`;

  const emailContent = `
    <h2>Thank you for registering to PeersCart!</h2>
    <p>Please click the link below to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>This link will expire in 1 hour.</p>
  `;

  await sendEmail(user.email, 'Email Verification', emailContent);

  // This is useful for debugging purposes; remove it in production.
  console.log('Verification Token:', verificationToken);
}