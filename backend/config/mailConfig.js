const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn(
      "Email skipped: set EMAIL_USER and EMAIL_PASSWORD in .env to enable mail"
    );
    return;
  }

  try {
    await transporter.sendMail({
      from: `"HR Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendMail;
