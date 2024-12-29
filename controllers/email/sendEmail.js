require("dotenv").config({ path: "../../.env" });
const transporter = require("./transporter");

async function sendEmail(emailOptions) {
  const mailOptions = {
    replyTo: emailOptions.replyTo || process.env.REPLY_TO,
    to: emailOptions.to,
    subject: emailOptions.subject,
    text: emailOptions.text,
    html: emailOptions.html || null,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email: " + error);
  }
}

module.exports = sendEmail;
