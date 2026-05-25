import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node.js to use IPv4 first for all DNS lookups.
// This completely fixes the ENETUNREACH IPv6 error on Render and Windows.
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
  // Validate environment variables first
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials (EMAIL_USER or EMAIL_PASS) are not configured on the server');
  }

  // Create a transporter
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Force Node to resolve to IPv4 instead of IPv6. 
    // This fixes the 'connect ENETUNREACH 2607:...' error.
    tls: {
      rejectUnauthorized: false
    },
    family: 4 
  });

  // Construct stylish HTML email for OnWheel EV
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background-color: #0b0c10; padding: 40px; border-radius: 16px; border: 1px solid #1f2937; color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4ade80; margin: 0; font-size: 28px; letter-spacing: -0.5px;">OnWheel <span style="color: #ffffff;">EV</span></h1>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Smart Trip Core</p>
      </div>
      
      <div style="background-color: #121212; border: 1px solid #374151; padding: 30px; border-radius: 12px; text-align: center;">
        <h2 style="margin-top: 0; color: #ffffff; font-size: 18px; font-weight: 500;">Your Verification Code</h2>
        <p style="color: #9ca3af; font-size: 14px; margin-bottom: 25px;">Please use the following 6-digit code to securely authenticate your session. This code will expire in 10 minutes.</p>
        
        <div style="background-color: #000000; padding: 20px; border-radius: 8px; border: 1px dashed #4ade80; display: inline-block;">
          <h1 style="margin: 0; color: #4ade80; font-family: monospace; font-size: 36px; letter-spacing: 8px;">${options.otp}</h1>
        </div>
      </div>
      
      <p style="color: #6b7280; font-size: 11px; text-align: center; margin-top: 30px;">
        If you didn't request this code, you can safely ignore this email.<br>
        &copy; ${new Date().getFullYear()} OnWheel EV Systems.
      </p>
    </div>
  `;

  // Define email options
  const mailOptions = {
    from: `"OnWheel EV Systems" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject || 'Your OnWheel EV Verification Code',
    html: htmlContent,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
