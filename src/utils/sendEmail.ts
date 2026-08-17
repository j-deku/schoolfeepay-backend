import dotenv from 'dotenv';
dotenv.config();

import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<void> => {
  try {
    console.log({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
});
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      port: Number(process.env.SMTP_PORT), // ensure port is a number
      secure: true, // true for 465, false for other ports
      host: process.env.SMTP_HOST,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // bypass TLS errors for self-signed certs
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email sending failed.");
  }
};
