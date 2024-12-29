const nodemailer = require("nodemailer");
require("dotenv").config({ path: "../../.env" });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_ACCOUNT,
    pass: process.env.APP_PASSWORD,
  },
});

module.exports = transporter;
