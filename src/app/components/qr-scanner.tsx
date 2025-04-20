// src/components/qr-scanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface QrScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: Error | string) => void;
  constraints?: MediaTrackConstraints;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export function QrScanner({ onScan, onError, constraints, videoRef: externalVideoRef }: QrScannerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafId = useRef<number | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      try {
        // First check if permissions are already granted
        const permissions = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = permissions.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          throw new Error("No camera devices found");
        }

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: constraints || { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // required for iOS
          
          // Wait for video to be ready
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = () => resolve(true);
            }
          });
          
          await videoRef.current.play();
          setHasPermission(true);
          scanQRCode();
        }
      } catch (err) {
        console.error("Camera setup error:", err);
        setHasPermission(false);
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            onError("Camera access denied. Please grant camera permissions in your browser settings.");
          } else if (err.name === "NotFoundError") {
            onError("No camera found. Please ensure your device has a camera and try again.");
          } else if (err.name === "NotReadableError") {
            onError("Camera is in use by another application. Please close other apps using the camera.");
          } else {
            onError(`Camera error: ${err.message}`);
          }
        } else {
          onError("Failed to access camera. Please check permissions and try again.");
        }
      }
    }

    function scanQRCode() {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const scan = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            onScan(code.data);
          } else {
            // If no QR code found, continue scanning
            rafId.current = requestAnimationFrame(scan);
          }
        } else {
          // Video not ready yet, continue scanning
          rafId.current = requestAnimationFrame(scan);
        }
      };

      rafId.current = requestAnimationFrame(scan);
    }

    // Start camera setup
    setupCamera();

    return () => {
      // Clean up
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, onError, constraints, videoRef]);

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-destructive/10 rounded-lg">
        <p className="text-destructive font-medium mb-4">Camera access denied</p>
        <p className="text-sm text-muted-foreground mb-4">
          Please grant camera permissions in your browser settings and refresh the page.
        </p>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          Retry Camera Access
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}