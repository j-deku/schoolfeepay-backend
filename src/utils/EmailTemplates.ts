// Registration Success Email Template
export const RegistrationSuccessEmail = (
  name: string, 
  email: string, 
  tempPassword: string, 
  otp: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1C3B2E; }
        .header h1 { color: #1C3B2E; font-family: 'Fraunces', serif; font-size: 24px; margin: 0; }
        .content { padding: 30px 0; }
        .otp-box { background-color: #EEF2EA; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #1C3B2E; letter-spacing: 8px; }
        .temp-password { background-color: #f8f8f8; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
        .temp-password code { font-size: 18px; font-weight: bold; color: #1C3B2E; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #E3E1D6; color: #5B6459; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #1C3B2E; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 UniPay Ghana</h1>
        </div>
        <div class="content">
          <h2>Welcome ${name}!</h2>
          <p>Your registration was successful. Please use the following OTP to verify your email address and activate your account.</p>
          
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px; color: #5B6459;">Your Verification Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 5px 0 0; font-size: 12px; color: #5B6459;">Valid for 10 minutes</p>
          </div>
          
          <div class="temp-password">
            <p style="margin: 0; font-size: 14px; color: #5B6459;">Your Temporary Password</p>
            <code>${tempPassword}</code>
            <p style="margin: 5px 0 0; font-size: 12px; color: #5B6459;">Please change your password after logging in</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify-otp?email=${email}" class="button">Verify Email</a>
          </div>
          
          <p style="font-size: 14px; color: #5B6459;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 UniPay Ghana. All rights reserved.</p>
          <p style="font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email OTP Template
export const EmailOTP = (name: string, otp: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1C3B2E; }
        .header h1 { color: #1C3B2E; font-family: 'Fraunces', serif; font-size: 24px; margin: 0; }
        .content { padding: 30px 0; }
        .otp-box { background-color: #EEF2EA; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #1C3B2E; letter-spacing: 8px; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #E3E1D6; color: #5B6459; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 UniPay Ghana</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Please use the following OTP to verify your email address.</p>
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px; color: #5B6459;">Your Verification Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 5px 0 0; font-size: 12px; color: #5B6459;">Valid for 10 minutes</p>
          </div>
          <p style="font-size: 14px; color: #5B6459;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 UniPay Ghana. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Resend Email Template
export const ResendEmail = (name: string, otp: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1C3B2E; }
        .header h1 { color: #1C3B2E; font-family: 'Fraunces', serif; font-size: 24px; margin: 0; }
        .content { padding: 30px 0; }
        .otp-box { background-color: #EEF2EA; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #1C3B2E; letter-spacing: 8px; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #E3E1D6; color: #5B6459; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #1C3B2E; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 UniPay Ghana</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>We've resent your verification code. Please use the following OTP to verify your email address.</p>
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px; color: #5B6459;">Your Verification Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 5px 0 0; font-size: 12px; color: #5B6459;">Valid for 30 minutes</p>
          </div>
          <p style="font-size: 14px; color: #5B6459;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2024 UniPay Ghana. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Verified Email Template
export const VerifiedEmail = (name: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1C3B2E; }
        .header h1 { color: #1C3B2E; font-family: 'Fraunces', serif; font-size: 24px; margin: 0; }
        .content { padding: 30px 0; text-align: center; }
        .checkmark { font-size: 64px; color: #1C3B2E; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #E3E1D6; color: #5B6459; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #1C3B2E; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 UniPay Ghana</h1>
        </div>
        <div class="content">
          <div class="checkmark">✅</div>
          <h2>Email Verified!</h2>
          <p>Congratulations ${name}! Your email has been successfully verified.</p>
          <p>You can now log in to your account and start managing your university payments.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2024 UniPay Ghana. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Welcome Email Template
export const EmailWelcome = (name: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1C3B2E; }
        .header h1 { color: #1C3B2E; font-family: 'Fraunces', serif; font-size: 24px; margin: 0; }
        .content { padding: 30px 0; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #E3E1D6; color: #5B6459; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #1C3B2E; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 UniPay Ghana</h1>
        </div>
        <div class="content">
          <h2>Welcome ${name}!</h2>
          <p>Thank you for joining UniPay Ghana. Your account has been successfully created.</p>
          <p>You can now:</p>
          <ul>
            <li>View your student profile</li>
            <li>Pay your school fees securely</li>
            <li>Track your payment history</li>
            <li>Manage your academic information</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2024 UniPay Ghana. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};