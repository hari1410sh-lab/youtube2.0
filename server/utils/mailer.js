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