const wrapper = (bodyHtml: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
    <h2 style="color: #0f5132;">UniPay Ghana</h2>
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #6b7280;">
      If you did not request this, you can safely ignore this email.
    </p>
  </div>
`;

export const EmailOTP = (name: string, otp: string): string =>
  wrapper(`
    <p>Hi ${name},</p>
    <p>Use the code below to verify your UniPay Ghana account. This code expires in 10 minutes.</p>
    <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 24px 0;">${otp}</p>
  `);

export const ResendEmail = (name: string, otp: string): string =>
  wrapper(`
    <p>Hi ${name},</p>
    <p>Here is your new verification code. This code expires in 10 minutes.</p>
    <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 24px 0;">${otp}</p>
  `);

export const VerifiedEmail = (name: string): string =>
  wrapper(`
    <p>Hi ${name},</p>
    <p>Your UniPay Ghana account has been successfully verified.</p>
  `);

export const EmailWelcome = (name: string): string =>
  wrapper(`
    <p>Hi ${name},</p>
    <p>Welcome to UniPay Ghana. You can now manage and pay your school fees from one place.</p>
  `);