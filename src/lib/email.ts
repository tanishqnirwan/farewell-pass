import nodemailer from 'nodemailer';
import path from 'path';


const afsanaLogoPath = path.resolve('public/afsana.png');
const universityLogoPath = path.resolve('public/ipu.png');
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
  <title>Your Farewell Pass - Afsana 2025</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #f8f4f7;">
  <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
    <!-- Header with University Logo -->
    <div style="background-color: #f9f2f5; padding: 25px; text-align: center; border-bottom: 1px solid #eee;">
      <img src="cid:university-logo" alt="Guru Gobind Singh Indraprastha University" style="max-width: 400px; height: auto;">
    </div>
    
    <!-- Event Name Banner -->
    <div style="background-color: #fff0f3; padding: 15px; text-align: center;">
      <img src="cid:afsana-logo" alt="Afsana - Trail of Memories" style="max-width: 350px; height: auto;">
      <p style="color: #c76b85; margin: 10px 0 0 0; font-size: 18px; font-style: italic; font-family: 'Playfair Display', serif;">Class of 2025 Farewell Celebration</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 30px 40px;">
      <h2 style="color: #9d3d5c; margin: 0; font-family: 'Playfair Display', serif; font-size: 24px; text-align: center; margin-bottom: 25px; border-bottom: 2px solid #f5d0dd; padding-bottom: 10px;">Official Event Pass</h2>
      
      <p style="color: #5a5a5a; font-size: 16px; line-height: 1.6;">Dear <span style="font-weight: 500; color: #9d3d5c;">${name}</span>,</p>
      
      <p style="color: #5a5a5a; font-size: 16px; line-height: 1.6;">We're delighted to confirm your attendance at <strong>Afsana 2025</strong>. Please bring this digital pass with you to the event. The QR code below will be scanned at the entrance for verification.</p>
      
      <!-- QR Code Card -->
      <div style="text-align: center; margin: 30px 0; background: linear-gradient(135deg, #fff8fa 0%, #fdf2f6 100%); padding: 25px; border-radius: 12px; border: 1px dashed #e6bccb;">
        <div style="background-color: white; display: inline-block; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <img src="cid:qr-code@farewell" alt="QR Code Pass" style="width: 200px; height: 200px;">
        </div>
        <p style="color: #9d3d5c; margin-top: 15px; font-size: 14px; font-weight: 500;">SCAN FOR ENTRY</p>
      </div>
      
      <!-- Pass Details -->
      <div style="background-color: #fdf8fa; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 4px solid #e6bccb;">
        <h3 style="color: #9d3d5c; margin: 0 0 20px 0; font-family: 'Playfair Display', serif; font-size: 20px;">Attendee Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 5px; color: #5a5a5a; font-weight: 500; width: 35%;">Name:</td>
            <td style="padding: 10px 5px; color: #5a5a5a;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 5px; color: #5a5a5a; font-weight: 500;">Email:</td>
            <td style="padding: 10px 5px; color: #5a5a5a;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 5px; color: #5a5a5a; font-weight: 500;">Roll Number:</td>
            <td style="padding: 10px 5px; color: #5a5a5a;">${rollNumber}</td>
          </tr>
          ${classSection ? `
          <tr>
            <td style="padding: 10px 5px; color: #5a5a5a; font-weight: 500;">Class/Section:</td>
            <td style="padding: 10px 5px; color: #5a5a5a;">${classSection}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <!-- Event Information -->
      <div style="background-color: #fdf8fa; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 4px solid #e6bccb;">
        <h3 style="color: #9d3d5c; margin: 0 0 20px 0; font-family: 'Playfair Display', serif; font-size: 20px;">Event Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 5px; color: #5a5a5a; font-weight: 500; width: 35%;">Event:</td>
            <td style="padding: 10px 5px; color: #5a5a5a;">Afsana 2025 - Farewell Celebration</td>
          </tr>
          <tr>
            <td style="padding: 10px 5px; color: #5a5a5a; font-weight: 500;">Date & Time:</td>
            <td style="padding: 10px 5px; color: #5a5a5a;">April 28, 2025 | 5:00 PM onwards</td>
          </tr>
          <tr>
            <td style="padding: 10px 5px; color: #5a5a5a; font-weight: 500;">Venue:</td>
            <td style="padding: 10px 5px; color: #5a5a5a;">GGSIPU Campus, Dwarka</td>
          </tr>
          <tr>
            <td style="padding: 10px 5px; color: #5a5a5a; font-weight: 500;">Instructions:</td>
            <td style="padding: 10px 5px; color: #5a5a5a;">Please arrive 30 minutes before the event starts. Bring a valid ID card.</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #5a5a5a; font-size: 16px; line-height: 1.6;">For any queries regarding the event, please contact the event coordinators. We look forward to celebrating with you!</p>
      
      <p style="color: #5a5a5a; font-size: 16px; line-height: 1.6; margin-top: 25px; text-align: center;">
        <strong style="color: #9d3d5c;">Afsana 2025</strong><br>
        <span style="font-style: italic;">Trail of Memories of the Batch of 2025</span>
      </p>
    </div>
    
    <!-- Footer with Improved Credit Section -->
    <div style="text-align: center; padding: 25px; background-color: #fdf8fa; border-top: 1px solid #f5d0dd;">
      <p style="color: #9d3d5c; margin: 0 0 10px 0; font-size: 15px;">GGSIPU Farewell 2025</p>
      <p style="color: #888888; font-size: 13px; margin: 0;">This is an automated email. Please do not reply.</p>
      
      <!-- Styled Credit Section -->
      <div style="margin-top: 20px; background: linear-gradient(135deg, #9d3d5c 0%, #7a2f47 100%); display: inline-block; padding: 10px 20px; border-radius: 30px; box-shadow: 0 3px 10px rgba(157, 61, 92, 0.2);">
        <p style="color: white; margin: 0; font-size: 14px;">
          Crafted with ❤️ by 
          <a href="https://www.linkedin.com/in/tanishqnirwan" style="color: white; text-decoration: underline; font-weight: 500;">Tanishq Nirwan</a>
        </p>
      </div>
      <p style="font-size: 12px; color: #9d3d5c; margin-top: 10px; font-weight: 500;">
        Chair, Software Development Cell – GGSIPU
      </p>
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
    subject: "Your Afsana 2025 Farewell Pass",
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
      },
      {
        filename: "university-logo.png",
        path: universityLogoPath,
        cid: "university-logo"
      },
      {
        filename: "afsana-logo.png",
        path: afsanaLogoPath,
        cid: "afsana-logo"
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