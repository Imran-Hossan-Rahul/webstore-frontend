"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Loader2, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
        };
      }
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions in your browser settings.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      // Draw the mirrored image
      context.translate(canvasRef.current.width, 0);
      context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0);
      
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setIsReady(false);
    startCamera();
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const file = new File([blob], "live_selfie.jpg", { type: "image/jpeg" });
      onCapture(file);
    } catch (err) {
      setError("Failed to process image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/5 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Identity Verification</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Biometric Scan</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Camera Feed Area */}
        <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
          <AnimatePresence mode="wait">
            {!capturedImage ? (
              <motion.div 
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover mirror-video"
                />
                
                {/* Simple Overlay UI */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 md:w-80 md:h-80 border border-white/20 rounded-2xl" />
                </div>

                {!isReady && !error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm">
                    <Loader2 strokeWidth={1.5} className="animate-spin text-indigo-600 mb-4" size={32} />
                    <p className="text-white text-sm font-bold uppercase tracking-widest">Waking up lens...</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full"
              >
                <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                <div className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Image Quality OK</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
                <AlertCircle size={32} strokeWidth={1.5} />
              </div>
              <h4 className="text-white font-bold mb-2">Camera Error</h4>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                {typeof error === 'string' ? error : (error?.message || "Failed to access camera.")}
              </p>
              <button 
                onClick={onClose} 
                className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-bold transition-all hover:-translate-y-0.5"
              >
                Return to Security Center
              </button>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-8 py-8 bg-slate-50 dark:bg-black/20 flex flex-col items-center gap-6">
          {!capturedImage ? (
            <>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium text-center">
                Please ensure you are in a well-lit area and your face is fully visible within the frame.
              </p>
              <div className="flex items-center gap-8">
                <button 
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={capture}
                  disabled={!isReady}
                  className="group relative w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                >
                  <Camera strokeWidth={1.5} className="text-white" size={24} />
                </button>
                <div className="w-12" /> {/* Spacer */}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 w-full">
                <button 
                  onClick={retake}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 font-bold transition-all hover:bg-white dark:hover:bg-white/5"
                >
                  <RefreshCw size={16} strokeWidth={1.5} /> Retake
                </button>
                <button 
                  onClick={confirm}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-900/10"
                >
                  {loading ? (
                    <Loader2 strokeWidth={1.5} className="animate-spin" size={16} />
                  ) : (
                    <><Check size={16} strokeWidth={1.5} /> Confirm Identity</>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <Zap size={14} strokeWidth={1.5} className="text-indigo-600" /> Processed via Secure Pipeline
              </div>
            </>
          )}
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <style jsx>{`
        .mirror-video {
          transform: rotateY(180deg);
        }
      `}</style>
    </motion.div>
  );
};

export default CameraCapture;
