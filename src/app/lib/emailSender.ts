// src/app/lib/emailSender.ts
import nodemailer from 'nodemailer';
import { Student, Pass } from './models';

let transporter: nodemailer.Transporter | null = null;

export function configureEmailTransporter(email: string, password: string) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password,
    },
  });
}

export async function sendPassEmail(student: Student, pass: Pass, qrCodeDataUrl: string): Promise<boolean> {
  if (!transporter) {
    throw new Error('Email transporter not configured');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: 'Your Farewell Pass',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Farewell Pass</h2>
        <p>Dear ${student.name},</p>
        <p>Your farewell pass has been generated. Please find your QR code below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 200px;"/>
        </div>
        <p><strong>Pass Code:</strong> ${pass.pass_code}</p>
        <p>Please keep this QR code safe and show it at the event entrance.</p>
        <p>Best regards,<br>Farewell Pass Manager</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}