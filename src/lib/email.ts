import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const createEmailTemplate = ({
  name,
  email,
  rollNumber,
  classSection
}: {
  name: string;
  email: string;
  rollNumber: string;
  classSection?: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Farewell Pass</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1a73e8; margin: 0; font-size: 28px;">Your Farewell Pass</h1>
    </div>
    
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">Dear ${name},</p>
    
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">Here is your QR code pass for the farewell event. Please keep this email and present the QR code at the entrance.</p>
    
    <div style="text-align: center; margin: 40px 0; background-color: #ffffff; padding: 20px; border-radius: 8px; border: 2px solid #e0e0e0;">
      <img src="cid:qr-code@farewell" alt="QR Code Pass" style="width: 250px; height: 250px; margin-bottom: 20px;">
    </div>
    
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1a73e8; margin: 0 0 15px 0;">Pass Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #4a4a4a; font-weight: bold;">Name:</td>
          <td style="padding: 8px 0; color: #4a4a4a;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4a4a4a; font-weight: bold;">Email:</td>
          <td style="padding: 8px 0; color: #4a4a4a;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4a4a4a; font-weight: bold;">Roll Number:</td>
          <td style="padding: 8px 0; color: #4a4a4a;">${rollNumber}</td>
        </tr>
        ${classSection ? `
        <tr>
          <td style="padding: 8px 0; color: #4a4a4a; font-weight: bold;">Class/Section:</td>
          <td style="padding: 8px 0; color: #4a4a4a;">${classSection}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">If you have any questions, please contact the event organizers.</p>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <p style="color: #888888; font-size: 14px;">This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendPassEmail = async (
  to: string,
  name: string,
  rollNumber: string,
  classSection: string | undefined,
  qrCodePath: string
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Farewell Pass",
    html: createEmailTemplate({
      name,
      email: to,
      rollNumber,
      classSection
    }),
    attachments: [
      {
        filename: "qr-code.png",
        path: qrCodePath,
        cid: "qr-code@farewell"
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}; 