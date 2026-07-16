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

  const textVersion = `
Hi ${userName},

Thanks for upgrading your YouTube 2.0 plan.

Plan: ${plan}
Amount Paid: Rs. ${amount}
Payment ID: ${paymentId}
Order ID: ${orderId}
Date: ${date}

If you did not make this payment, please reply to this email.

- YouTube 2.0 Team
  `.trim();

  const htmlVersion = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #CC0000;">Your ${plan} plan is active</h2>
      <p>Hi ${userName},</p>
      <p>Thanks for upgrading. Here's your receipt:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">Plan</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${plan}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">Amount Paid</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">Rs. ${amount}</td>
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
      <p style="color: #666; font-size: 13px;">If you did not make this payment, please reply to this email.</p>
    </div>
  `;

  const mailOptions = {
    from: `"YouTube 2.0" <${process.env.EMAIL_USER}>`,
    replyTo: process.env.EMAIL_USER,
    to,
    subject: `Your YouTube 2.0 receipt - ${plan} plan`,
    text: textVersion,
    html: htmlVersion,
  };

  await transporter.sendMail(mailOptions);
}