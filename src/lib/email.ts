import nodemailer from 'nodemailer';

import path from 'path';

const afsanaLogoPath = path.join(process.cwd(), 'public', 'email', 'afsana.jpg');
const ipuLogoPath = path.join(process.cwd(), 'public', 'email', 'ipu.jpg');

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEventPassEmail = async ({
  name,
  email,
  rollNumber,
  classSection,
  qrCodeBuffer,
}: {
  name: string;
  email: string;
  rollNumber: string;
  classSection?: string;
  qrCodeBuffer: Buffer;
}) => {
  const html = generateEmailHTML({ name, email, rollNumber, classSection });

  const mailOptions = {
    from: `"Afsana 2025" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎟 Your E-Pass for Afsana 2025',
    html,
    attachments: [
      {
        filename: 'afsana.jpg',
        path: afsanaLogoPath,
        cid: 'afsana-logo',
      },
      {
        filename: 'ipu.jpg',
        path: ipuLogoPath,
        cid: 'ipu-logo',
      },
      {
        filename: 'qrcode.png',
        content: qrCodeBuffer,
        cid: 'qr-code',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

const generateEmailHTML = ({
  name,
  email,
  rollNumber,
  classSection,
}: {
  name: string;
  email: string;
  rollNumber: string;
  classSection?: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    body {
      font-family: 'Poppins', sans-serif;
      background: #fff0f5;
      margin: 0;
      padding: 0;
      color: #333;
    }

    .card {
      max-width: 600px;
      margin: 30px auto;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    }

    .header {
      background: linear-gradient(135deg, #ffe6f0 0%, #ffd6e8 100%);
      padding: 30px;
      text-align: center;
      position: relative;
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #ff6b6b, #ff8e8e, #ff6b6b);
    }

    .header img {
      max-height: 100px;
      margin-bottom: 15px;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
    }

    .event {
      background: linear-gradient(135deg, #fff5fa, #ffe8f0);
      text-align: center;
      padding: 25px;
      position: relative;
    }

    .event::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 1px;
      background: linear-gradient(90deg, transparent, #ffc4d6, transparent);
    }

    .event img {
      max-height: 80px;
      margin-bottom: 10px;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
    }

    .event p {
      font-size: 20px;
      color: #c96b85;
      margin: 0;
      font-style: italic;
      font-weight: 600;
    }

    .greeting {
      text-align: center;
      padding: 30px;
      background: #fff;
    }

    .greeting h1 {
      color: #9d3d5c;
      font-size: 28px;
      margin: 0;
      font-weight: 700;
    }

    .greeting p {
      color: #c96b85;
      font-size: 18px;
      margin: 10px 0 0;
    }

    .qr {
      text-align: center;
      padding: 30px;
      background: #fff9fc;
      position: relative;
    }

    .qr::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #ffc4d6, transparent);
    }

    .qr img {
      width: 250px;
      border-radius: 15px;
      box-shadow: 0 8px 20px rgba(157, 61, 92, 0.2);
      border: 4px solid #fff;
    }

    .qr p {
      margin-top: 15px;
      font-weight: 600;
      color: #9d3d5c;
      font-size: 18px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .info {
      padding: 25px 30px;
      background: #fff;
    }

    .info h3 {
      color: #9d3d5c;
      margin-top: 0;
      font-size: 22px;
      border-bottom: 2px solid #ffd6e1;
      padding-bottom: 10px;
      font-weight: 600;
    }

    .info-table {
      width: 100%;
      margin-top: 15px;
      border-collapse: collapse;
    }

    .info-table td {
      padding: 10px 0;
    }

    .info-table td:first-child {
      color: #c96b85;
      font-weight: 600;
      width: 40%;
    }

    .details {
      padding: 25px 30px;
      background: #fff9fc;
    }

    .details h3 {
      color: #9d3d5c;
      margin-top: 0;
      font-size: 22px;
      border-bottom: 2px solid #ffd6e1;
      padding-bottom: 10px;
      font-weight: 600;
    }

    .footer {
      text-align: center;
      background: linear-gradient(135deg, #ffe9f2, #ffd6e8);
      padding: 25px;
      font-size: 14px;
      color: #555;
    }

    .credit {
      margin-top: 15px;
      display: inline-block;
      background: linear-gradient(135deg, #9d3d5c, #7a2f47);
      color: white;
      padding: 12px 30px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(157, 61, 92, 0.2);
    }

    .developer-credit {
      margin-top: 20px;
      font-size: 12px;
      color: #666;
      line-height: 1.5;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95));
      padding: 12px 20px;
      border-radius: 15px;
      box-shadow: 0 2px 8px rgba(157, 61, 92, 0.08);
      max-width: 300px;
      margin-left: auto;
      margin-right: auto;
    }

    .developer-credit a {
      color: #9d3d5c;
      text-decoration: none;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .developer-credit a:hover {
      text-decoration: underline;
    }

    .developer-credit br {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <img src="cid:ipu-logo" alt="GGSIPU Logo" />
    </div>
    <div class="event">
      <img src="cid:afsana-logo" alt="Afsana Logo" />
      <p>Class of 2025 Farewell Celebration</p>
    </div>

    <div class="greeting">
      <h1>Hello ${name}!</h1>
      <p>Your E-Pass is ready for Afsana 2025</p>
    </div>

    <div class="qr">
      <img src="cid:qr-code" alt="QR Code" />
      <p>Scan for Entry</p>
    </div>

    <div class="info">
      <h3>Your Details</h3>
      <table class="info-table">
        <tr><td>Roll No:</td><td>${rollNumber}</td></tr>
        <tr><td>Email:</td><td>${email}</td></tr>
        ${classSection ? `<tr><td>Year:</td><td>${classSection}</td></tr>` : ''}
      </table>
    </div>

    <div class="details">
      <h3>Event Details</h3>
      <table class="info-table">
        <tr><td>Venue:</td><td>University Auditorium</td></tr>
      </table>
    </div>

    <div class="footer">
      This is an automated email. Do not reply.
      <div class="credit">Auto-generated by Farewell Pass Manager</div>
      <div class="developer-credit">
        Developed by <a href="https://linkedin.com/in/tanishqnirwan" target="_blank">Tanishq Nirwan</a><br>
        Chair - Software Development Cell, IPU EDC<br>
        IIOT Batch of 2026
      </div>
    </div>
  </div>
</body>
</html>`;
