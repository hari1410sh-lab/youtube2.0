import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendPaymentConfirmationEmail({
  to,
  userName,
  plan,
  amount,
  paymentId,
  orderId,
  date,
}) {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"YouTube 2.0" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Payment Confirmation - ${plan} Plan Upgrade`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #CC0000;">Payment Successful</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for upgrading to the <strong>${plan}</strong> plan. Here are your transaction details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Plan</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${plan}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Amount Paid</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Payment ID</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${paymentId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Order ID</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 8px;">Date</td>
            <td style="padding: 8px;">${date}</td>
          </tr>
        </table>
        <p style="color: #666; font-size: 13px;">This is an automated confirmation email. If you did not make this payment, please contact support immediately.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendOtpEmail({ to, code }) {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"YouTube 2.0" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your YouTube 2.0 login verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #CC0000;">Verify your login</h2>
        <p>We noticed a login from a new location or device. Enter this code to continue:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; padding: 16px; background: #f4f4f4; border-radius: 8px;">${code}</p>
        <p style="color: #666; font-size: 13px;">This code expires in 5 minutes. If you didn't attempt to log in, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}