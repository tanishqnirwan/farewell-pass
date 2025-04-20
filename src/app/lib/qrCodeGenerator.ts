// src/app/lib/qrCodeGenerator.ts
import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  try {
    // Generate a QR code as a data URL
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export function generateUniquePassCode(): string {
  // Generate a random string for the pass code
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 10);
  return `FAREWELL-${timestamp.substring(timestamp.length - 6)}-${random.toUpperCase()}`;
}