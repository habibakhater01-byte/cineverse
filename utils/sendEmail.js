const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: `"CineVerse" <${process.env.MAIL_USER}>`,
    to,
    subject: "Your password reset code",
    text: `Your OTP is ${otp}. It is valid for 15 minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto">
        <h2>Password reset</h2>
        <p>Use this code to reset your password:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px">${otp}</p>
        <p>It is valid for 15 minutes. If you did not request this, ignore this email.</p>
      </div>`,
  });
}

module.exports = { sendOtpEmail };