"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, Minimize2, Maximize2, Phone } from "lucide-react";
import { webrtcManager } from "@/utils/webrtcManager";

export default function CallInterface({
  isOpen,
  isIncoming,
  callerName,
  callerAvatar,
  isVideoCall,
  onAccept,
  onReject,
  onEnd,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideoCall);
  const [callStatus, setCallStatus] = useState(isIncoming ? "Ringing..." : "Calling...");
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const attachLocalStream = () => {
      if (webrtcManager.localStream && localVideoRef.current && localVideoRef.current.srcObject !== webrtcManager.localStream) {
        localVideoRef.current.srcObject = webrtcManager.localStream;
      }
    };

    attachLocalStream();

    // Check periodically for local stream in case it's delayed
    const localStreamCheck = setInterval(attachLocalStream, 500);

    // Handle remote stream
    webrtcManager.onRemoteStream = (stream) => {
      setCallStatus("Connected");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
      }
    };

    return () => {
      webrtcManager.onRemoteStream = null;
      clearInterval(localStreamCheck);
    };
  }, [isOpen, isVideoCall, callStatus]);

  useEffect(() => {
    let interval;
    if (callStatus === "Connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  if (!isOpen) return null;

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleMute = () => {
    webrtcManager.toggleAudio(isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    webrtcManager.toggleVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  };

  const containerClasses = isMinimized
    ? "fixed bottom-6 right-6 z-[200] w-72 h-48 bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-white/20 transition-all duration-300"
    : "absolute inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300 transition-all";

  return (
    <div className={containerClasses}>
      {/* Top right minimize/maximize control */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-2 bg-brand-surface/10 hover:bg-brand-surface/20 rounded-full text-white transition-colors"
        >
          {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={20} />}
        </button>
      </div>
      
      {/* Remote Video / Audio Avatar */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isVideoCall && callStatus === "Connected" ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-white/10 bg-brand-surface/5 flex items-center justify-center overflow-hidden animate-pulse">
              {callerAvatar ? (
                <img src={getOptimizedUrl(callerAvatar)} alt="Caller" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-white/50" />
              )}
            </div>
            <div className="text-center">
              <h2 className={`${isMinimized ? 'text-lg' : 'text-3xl'} font-bold text-white mb-2 truncate px-4`}>{callerName || "Unknown Caller"}</h2>
              <p className="text-white/50 tracking-widest uppercase text-xs sm:text-sm">
                {callStatus === "Connected" ? formatDuration(callDuration) : callStatus}
              </p>
            </div>
          </div>
        )}

        {/* Hidden Audio Element for Audio-only calls */}
        <audio ref={remoteAudioRef} autoPlay playsInline />

        {/* Local Video Picture-in-Picture */}
        {isVideoCall && (
          <div className={`absolute ${isMinimized ? 'bottom-2 right-2 w-20 h-28' : 'bottom-32 right-8 w-48 h-64'} bg-black border border-white/20 rounded-xl overflow-hidden shadow-sm transition-all duration-300`}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`absolute ${isMinimized ? 'bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 scale-75' : 'bottom-10 left-1/2 -translate-x-1/2 px-8 py-4'} flex items-center gap-4 sm:gap-6 bg-brand-surface/10 backdrop-blur-md rounded-full border border-white/10 shadow-sm transition-all duration-300`}>
        {isIncoming && callStatus === "Ringing..." ? (
          <>
            <button
              onClick={onReject}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all shadow-sm hover:-translate-y-0.5"
            >
              <PhoneOff size={24} />
            </button>
            <button
              onClick={onAccept}
              className="w-14 h-14 bg-brand-teal hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-all shadow-sm hover:-translate-y-0.5"
            >
              <Phone size={24} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMuted ? "bg-brand-surface/20 text-white" : "bg-brand-surface text-black"
              }`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {isVideoCall && (
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  !isVideoEnabled ? "bg-brand-surface/20 text-white" : "bg-brand-surface text-black"
                }`}
              >
                {!isVideoEnabled ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            )}

            <button
              onClick={onEnd}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all shadow-sm hover:-translate-y-0.5 ml-4"
            >
              <PhoneOff size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
