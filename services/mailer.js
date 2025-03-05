const nodemailer = require("nodemailer");
const OTPTemplate = require("./../Template/OTP");
const dotenv = require("dotenv");

dotenv.config({path: "./config.env"});

const NODEMAILER_USER = process.env.NODEMAILER_USER;
const NODEMAILER_APP_PASSWORD = process.env.NODEMAILER_APP_PASSWORD;

// Create a transporter using your email service
let transporter = nodemailer.createTransport({
  host: "smtp.google.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: NODEMAILER_USER, // Your email
    pass: NODEMAILER_APP_PASSWORD, // Your email password or App password if using Gmail with 2-factor auth
  },
});

const Mailer = async ({ name, otp, email }) => {
  let mailOptions = {
    to: email, // Recipient email
    subject: "Verify your Chati Account", // Subject line
    html: OTPTemplate({ name, otp }), // HTML body
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Error sending mail");
  }
};

module.exports = Mailer;
