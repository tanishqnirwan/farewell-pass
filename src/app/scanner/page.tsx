// src/app/scanner/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, CameraOff, X, CheckCircle2, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { QrScanner } from "@/app/components/qr-scanner";

// Define types for scan results
interface ScanResult {
  success: boolean;
  data?: StudentData;
  message?: string;
}

interface StudentData {
  id: string;
  studentId: string;
  name: string;
  email: string;
  rollNumber?: string;
  [key: string]: unknown;
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanEnabled, setScanEnabled] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Sound references
  const successSound = useRef(typeof Audio !== 'undefined' ? new Audio('/audio/success.mp3') : null);
  const errorSound = useRef(typeof Audio !== 'undefined' ? new Audio('/audio/error.mp3') : null);
  
  useEffect(() => {
    // Preload sounds
    successSound.current?.load();
    errorSound.current?.load();
    
    // Request camera permission when component mounts
    if (!scanning) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          console.error("Initial camera check error:", err);
          if (err.name === "NotAllowedError") {
            setError("Camera access denied. Please grant camera permissions in your browser settings.");
          }
        });
    }

    // Hide navbar when scanning
    if (scanning) {
      document.body.style.overflow = 'hidden';
      const navbar = document.querySelector('nav');
      if (navbar) {
        navbar.style.display = 'none';
      }
    } else {
      document.body.style.overflow = '';
      const navbar = document.querySelector('nav');
      if (navbar) {
        navbar.style.display = '';
      }
    }

    return () => {
      document.body.style.overflow = '';
      const navbar = document.querySelector('nav');
      if (navbar) {
        navbar.style.display = '';
      }
    };
  }, [scanning]);
  
  const enterFullscreen = async () => {
    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setScanning(true);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setScanning(false);
    }
  };
  
  const vibrate = (pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };
  
  const playSound = (type: 'success' | 'error') => {
    try {
      const sound = type === 'success' ? successSound.current : errorSound.current;
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(console.error);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
  const handleScanResult = (success: boolean, message: string, data?: StudentData) => {
    // Disable scanning temporarily
    setScanEnabled(false);
    setShowNotification(true);
    setLastScanResult({ success, message, data });
    
    // Play appropriate sound and vibration
    if (success) {
      playSound('success');
      vibrate([100, 50, 100]); // Success pattern
    } else {
      playSound('error');
      vibrate([200, 100, 200, 100, 200]); // Error pattern
    }
    
    // Re-enable scanning after delay
    setTimeout(() => {
      setShowNotification(false);
      setScanEnabled(true);
    }, 1500);
  };
  
  const handleScan = async (data: string | null) => {
    if (!data || !scanEnabled) return;
    
    try {
      const parsedData = JSON.parse(data) as StudentData;
      
      if (!parsedData.id || !parsedData.studentId || !parsedData.name || !parsedData.email) {
        handleScanResult(false, "Invalid QR code format");
        return;
      }
      
      try {
        const response = await fetch("/api/scanner/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            passId: parsedData.id,
            studentId: parsedData.studentId 
          }),
        });
        
        const responseData = await response.json();
        
        if (responseData.success) {
          handleScanResult(true, "Pass verified successfully", {
            ...parsedData,
            ...responseData.student
          });
        } else {
          handleScanResult(false, responseData.message, parsedData);
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        handleScanResult(false, "Failed to verify pass");
      }
      
    } catch (parseError) {
      console.error("Parse error:", parseError);
      handleScanResult(false, "Invalid QR code format");
    }
  };
  
  const handleError = (err: Error) => {
    console.error("QR scanning error:", err);
    setError(err instanceof Error ? err.message : String(err));
  };

  return (
    <>
      
      <div ref={containerRef} className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="relative h-full flex flex-col">
          {!scanning ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm"
              >
                <Card className="w-full">
                  <CardContent className="p-6 text-center space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="w-full py-8 text-lg"
                        onClick={enterFullscreen}
                      >
                        <Camera className="mr-2 h-6 w-6" />
                        Start Scanning
                      </Button>
                    </motion.div>
                    <p className="text-sm text-muted-foreground">
                      Click to start scanning in fullscreen mode
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-background"
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0">
                  <QrScanner 
                    onScan={handleScan}
                    onError={(error: string | Error) => {
                      if (error instanceof Error) {
                        handleError(error);
                      } else {
                        console.error("QR scanning error:", error);
                        setError(error);
                      }
                    }}
                    constraints={{
                      facingMode: "environment",
                      width: { ideal: 1280 },
                      height: { ideal: 720 }
                    }}
                    videoRef={videoRef}
                  />
                  
                  {/* Scanning viewport with improved positioning */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      {/* Corner markers */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                      
                      {/* Scanning animation */}
                      <motion.div
                        className="absolute inset-0"
                        initial={false}
                        animate={scanEnabled ? "scanning" : "paused"}
                        variants={{
                          scanning: {
                            opacity: [0.3, 1, 0.3],
                            transition: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear"
                            }
                          },
                          paused: {
                            opacity: 0.3
                          }
                        }}
                      >
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-1 bg-white/50" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-64 bg-white/50" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Scan Result Notification Overlay */}
                  <AnimatePresence>
                    {showNotification && lastScanResult && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full"
                        >
                          <div className="flex flex-col items-center text-center space-y-4">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", damping: 10 }}
                            >
                              {lastScanResult.success ? (
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                              ) : (
                                <XCircle className="w-16 h-16 text-red-500" />
                              )}
                            </motion.div>
                            
                            <h2 className="text-xl font-semibold">
                              {lastScanResult.success ? "Success!" : "Error"}
                            </h2>
                            
                            <p className="text-muted-foreground">
                              {lastScanResult.message}
                            </p>

                            {lastScanResult.success && lastScanResult.data && (
                              <div className="w-full text-left space-y-2 mt-4">
                                <div className="grid grid-cols-2 gap-2">
                                  <p className="text-sm text-muted-foreground">Name:</p>
                                  <p className="text-sm font-medium">{lastScanResult.data.name}</p>
                                  
                                  <p className="text-sm text-muted-foreground">Roll Number:</p>
                                  <p className="text-sm font-medium">{lastScanResult.data.rollNumber}</p>
                                  
                                  <p className="text-sm text-muted-foreground">Email:</p>
                                  <p className="text-sm font-medium truncate">{lastScanResult.data.email}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Controls */}
                <div className="absolute top-4 right-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm"
                    onClick={exitFullscreen}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Status bar */}
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="w-full max-w-md mx-auto"
                  >
                    <Card className="bg-background/80 backdrop-blur-sm">
                      <CardContent className="p-4 flex justify-between items-center">
                        <p className="text-sm font-medium">
                          {scanEnabled ? "Ready to scan" : "Processing..."}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exitFullscreen}
                        >
                          <CameraOff className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 inset-x-4"
              >
                <Alert variant="destructive">
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}