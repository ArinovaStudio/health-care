import nodemailer from 'nodemailer'

const email = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: email, pass: pass }
});

export async function sendOTPEmail(toEmail, otp) {
  const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; text-align: center;">Email Verification</h2>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
                    <p style="font-size: 16px; color: #666;">Your verification code is:</p>
                    <h1 style="color: #007bff; text-align: center; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                    <p style="font-size: 14px; color: #999; text-align: center;">This code will expire in 10 minutes.</p>
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
                </div>
                <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
                    This is an automated email. Please do not reply.
                </p>
            </div>
        `;
  try {
    await transporter.sendMail({
      from: `"MediLink" <${email}>`,
      to: toEmail,
      subject: "MediLink - OTP Verification",
      html: htmlBody,
    });

    return { success: true };

  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: error.message };
  }
}
