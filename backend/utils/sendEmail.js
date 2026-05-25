const sendEmail = async (options) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured on the server');
  }

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

  // Send email via Brevo HTTP API
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: 'OnWheel EV Systems',
        email: process.env.EMAIL_USER || 'no-reply@onwheelev.com'
      },
      to: [
        { email: options.email }
      ],
      subject: options.subject || 'Your OnWheel EV Verification Code',
      htmlContent: htmlContent
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to send via Brevo');
  }
  
  return data;
};

export default sendEmail;
