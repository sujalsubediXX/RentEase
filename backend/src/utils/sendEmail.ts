// utils/sendEmail.ts
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // e.g. smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,     // use an app password, not your real password
  },
});

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  await transporter.sendMail({
    from: `"RentEase" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};