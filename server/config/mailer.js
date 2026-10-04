import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

export default transporter;
