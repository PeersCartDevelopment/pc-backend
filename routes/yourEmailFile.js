import jwt from 'jsonwebtoken';
import { sendEmail } from './email.js'; // Make sure the path is correct

export async function sendVerificationEmail(user) {
  const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const verificationLink = ` https://pc-backend-17gq.onrender.com/${verificationToken}`;

  const emailContent = `
    <h2>Thank you for registering to PeersCart!</h2>
    <p>Please click the link below to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
  `;

  await sendEmail(user.email, 'Email Verification', emailContent);

  //Prints the verification token (Must delete later)
  console.log(verificationToken);
}

