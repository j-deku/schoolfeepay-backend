const EmailOTP = (name:string, otp:string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background-color: #f5f5f5; color: #333;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; margin: 0; padding: 0;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600px" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td align="center" style="background-color: #0171c2; padding: 20px;">
                            <a href=${
                              process.env.FRONTEND_URL
                            } style="text-decoration: none;">
                            <img src=${process.env.LOGO} alt="GSES">
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px; text-align: center; font-size: 16px; color: #333;">
                            <h1 style="margin: 0; color: #444;">Hi ${name}!</h1>
                            <h2 style="margin: 20px 0; color: #0171c2;">Welcome to GSES</h2>
                            <p style="line-height: 1.6; color: #555;">
                                GSES is an online platform for florists to purchase their favorite products with ease.<br>
                                Our mission is to make the world of technologies a more beautiful and enjoyable place for everyone.
                            </p>
                            <h2 style="color: #444; margin-top: 30px;">Your One-Time Password (OTP)</h2>
                            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">To get started, please use the OTP provided below:</p>
                            <div style="background-color: #f0f8ff; padding: 15px 25px; font-size: 22px; font-weight: bold; color: #333; letter-spacing: 10px; border: 1px solid #ddd; display: inline-block; border-radius: 5px; margin-bottom: 20px;">
                                ${otp}
                            </div>
                            <p style="color: orange; font-size: 14px; margin-top: 10px;">⚠ This OTP will expire in 10 minutes.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="background-color: #171717; padding: 20px; color: #ccc; font-size: 12px; text-align: center;">
                            <nav style="margin-bottom: 10px;">
                                <a href="http://localhost:5173/about-us" style="color: #ccc; text-decoration: none; margin: 0 5px;">About</a> |
                                <a href="http://localhost:5173/contact-us" style="color: #ccc; text-decoration: none; margin: 0 5px;">Contact</a> |
                                <a href="http://localhost:5173/privacy-policy" style="color: #ccc; text-decoration: none; margin: 0 5px;">Privacy Policy</a> |
                                <a href="http://localhost:5173/terms-of-service" style="color: #ccc; text-decoration: none; margin: 0 5px;">Terms of Service</a>
                            </nav>
                            <p>&copy; GSES ${new Date().getFullYear()}. All Rights Reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

const EmailWelcome = (name:string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to GSES</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background-color: #f5f5f5; color: #333;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; margin: 0; padding: 0;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600px" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td align="center" style="background-color: lightblue; padding: 20px;">
                            <a href=${
                              process.env.FRONTEND_URL
                            } style="text-decoration: none;">
                            <img src=${process.env.GIF} alt="GSES">
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px; text-align: center; font-size: 16px; color: #333;">
                            <h1 style="margin: 0; color: #444;">Hi ${name},</h1>
                            <h2 style="margin: 20px 0; color: #0171c2;">Welcome Back to GSES!</h2>
                            <p style="line-height: 1.6; color: #555;">
                                We're thrilled to have you back. At GSES, we're committed to making your experience with technology products seamless and enjoyable.
                            </p>
                            <p style="line-height: 1.6; color: #555;">
                                If you have any questions or need assistance, our team is here to help. Explore your dashboard and let us make your technology journey extraordinary.
                            </p>
                            <a href=${
                              process.env.FRONTEND_URL
                            } style="display: inline-block; background-color: #0171c2; color: #ffffff; padding: 15px 25px; font-size: 16px; border-radius: 5px; text-decoration: none; margin-top: 20px;margin-bottom:50px;">
                                Go to Dashboard
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="background-color: #171717; padding: 20px; color: #ccc; font-size: 14px; text-align: center;">
                            <nav style="margin-bottom: 10px;">
                            <img src=${
                              process.env.LOGO
                            } width="70px" alt="GSES" style="float:left;">
                                <a href="http://localhost:5173/about-us" style="color: #ccc; text-decoration: none; margin: 0 5px;">About</a> |
                                <a href="http://localhost:5173/contact-us" style="color: #ccc; text-decoration: none; margin: 0 5px;">Contact</a> |
                                <a href="http://localhost:5173/privacy-policy" style="color: #ccc; text-decoration: none; margin: 0 5px;">Privacy Policy</a> |
                                <a href="http://localhost:5173/terms-of-service" style="color: #ccc; text-decoration: none; margin: 0 5px;">Terms of Service</a>
                            </nav>
                            <p>&copy; GSES ${new Date().getFullYear()}. All Rights Reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

const ResendEmail = (name:string, otp:string, verificationUrl:string) => `
<!DOCTYPE html>
<html>
<head>
<title>Resend OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333;">

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px 0;">
<tr>
<td align="center">

<table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
<tr>
<td align="center" style="padding: 20px; background-color: #0c617e; color: #ffffff;">
<h1 style="font-size: 24px; margin: 0;">Resend OTP</h1>
</td>
</tr>
<tr>
<td style="padding: 20px; text-align: left;">

<p style="font-size: 16px; margin: 0 0 10px;">Hello <h1>${name}</h1></p>
<p style="font-size: 16px; margin: 0 0 20px;">We received a request to resend your One-Time Password (OTP). Please use the code below to verify your identity:</p>

<div style="text-align: center; margin: 20px 0;">
<p style="font-size: 28px; font-weight: bold; color: #0c617e; margin: 0; letter-spacing:20px">${otp}</p>
</div>

<p style="font-size: 16px; margin: 0 0 20px; color:orange;">⚠This code is valid for the next 10 minutes. If you didn’t request this email, please ignore it.</p>

<div style="text-align: center; margin: 20px 0;">
<a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #0c617e; text-decoration: none; border-radius: 5px;">Verify Now</a>
</div>
</td>
</tr>
<tr>
<td align="center" style="padding: 20px; font-size: 12px; color: #999999; background-color: #f9f9f9;">
<p style="margin: 0;">Need help? <a href="#" style="color: #0c617e; text-decoration: none;">Contact Support</a></p>
<p style="margin: 5px 0;">Inc. © 2024 BlooFI. All rights reserved.</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;


const VerifiedEmail = (name:string) => `
<!DOCTYPE html>
<html>
<head>
  <title>Email Verified Successfully</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f9;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #1e88e5;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header img {
      max-width: 100px;
      margin-bottom: 10px;
    }
    .header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .body {
      padding: 20px 30px;
      color: #333333;
    }
    .body h1 {
      color: #1e88e5;
      font-size: 22px;
      margin-top: 0;
    }
    .body p {
      margin: 10px 0;
      font-size: 16px;
    }
    .body ul {
      padding-left: 20px;
      margin: 10px 0;
    }
    .body ul li {
      margin: 5px 0;
    }
    .button {
      display: inline-block;
      background-color: #1e88e5;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 5px;
      font-weight: bold;
      text-align: center;
      font-size: 16px;
      margin: 20px auto 0;
    }
    .button:hover {
      background-color: #1565c0;
    }
    .gif-container {
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #777777;
      font-size: 14px;
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      background-color: #f9f9f9;
    }
    .footer a {
      color: #1e88e5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header Section -->
    <div class="header">
      <img src=${process.env.LOGO} alt="GSES Logo">
      <h2>Welcome to BlooFi!</h2>
    </div>

    <!-- Body Section -->
    <div class="body">
      <h1>Email Verified Successfully! 🎉</h1>
      <p style="font-weight: bold;">
        Hi ${name},
      </p>
      <p>
        Congratulations! Your email has been successfully verified. We’re excited to have you as part of our growing community. Now you can start exploring everything BlooFi has to offer.
      </p>

      <!-- GIF Section -->
      <div class="gif-container">
        <img src=${process.env.GIF_HAPPY6} alt="Happy GIF" width="200" height="200">
      </div>

      <p>
        Here’s what you can do next:
      </p>
      <ul>
        <li>🚀 Access your personalized dashboard.</li>
        <li>🌟 Customize your profile and preferences.</li>
        <li>✨ Explore our exclusive features.</li>
      </ul>

      <!-- Call to Action Button -->
      <a href="https://www.bloofi.com/dashboard" class="button">Go to Dashboard</a>
    </div>

    <!-- Footer Section -->
    <div class="footer">
      <p>
        If you have any questions, feel free to <a href="https://www.bloofi.com/support">contact our support team</a>.
      </p>
      <p>
        Stay awesome,<br>
        The BlooFi Team
      </p>
    </div>
  </div>
</body>
</html>

`

export { EmailOTP, EmailWelcome, ResendEmail, VerifiedEmail };
