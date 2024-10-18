import nodemailer from 'nodemailer';

export async function sendEmail(to, subject, htmlContent) {
  // Create a transporter using Hostinger's SMTP settings
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,      // Hostinger SMTP server
    port: process.env.SMTP_PORT,      // Port (usually 465 for SSL or 587 for TLS)
    secure: process.env.SMTP_PORT == 465, // True if port is 465 (SSL), otherwise false
    auth: {
      user: process.env.SMTP_USER,    // Your Hostinger email address
      pass: process.env.SMTP_PASS,    // Your Hostinger email password
    },
  });

  // Set up email data
  const mailOptions = {
    from: `"Your App Name" <${process.env.SMTP_USER}>`, // Sender address
    to: to,                                            // Receiver's address
    subject: subject,                                  // Subject of the email
    html: htmlContent,                                 // HTML body content
  };

  // Send the email
  await transporter.sendMail(mailOptions);
  console.log('Email sent successfully');
}