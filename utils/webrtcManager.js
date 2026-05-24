import socket from "./socket";

class WebRTCManager {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStream = null;
    this.onCallEnded = null;
    this.targetUserId = null;
    this.chatId = null;

    this.configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    // Socket Listeners
    socket.on("webrtc:signal", this.handleSignal.bind(this));
    socket.on("call:ended", this.handleCallEnded.bind(this));
  }

  async initializeLocalStream(isVideo = true) {
    if (this.localStream) return this.localStream;
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      return this.localStream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
      throw error;
    }
  }

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Add local stream tracks to the connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle incoming ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.targetUserId) {
        socket.emit("webrtc:signal", {
          targetUserId: this.targetUserId,
          signal: { type: "candidate", candidate: event.candidate },
        });
      }
    };

    // Handle incoming remote stream
    this.peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.remoteStream = remoteStream;
      if (this.onRemoteStream) {
        this.onRemoteStream(remoteStream);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (
        this.peerConnection.connectionState === "disconnected" ||
        this.peerConnection.connectionState === "failed" ||
        this.peerConnection.connectionState === "closed"
      ) {
        this.endCall();
      }
    };
  }

  async initiateCall(targetUserId, chatId, isVideo = true) {
    this.targetUserId = targetUserId;
    this.chatId = chatId;

    await this.initializeLocalStream(isVideo);
    this.createPeerConnection();

    // Create an offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Send offer to target user
    socket.emit("webrtc:signal", {
      targetUserId: this.targetUserId,
      signal: { type: "offer", offer },
    });
  }

  async acceptCall(callerId, chatId, isVideo = true, currentUserId) {
    this.targetUserId = callerId;
    this.chatId = chatId;

    await this.initializeLocalStream(isVideo);
    this.createPeerConnection();

    // Tell the caller we accepted
    socket.emit("call:accept", { targetUserId: callerId, callerId: currentUserId }); 
  }

  async handleSignal({ senderId, signal }) {
    // Only handle signals if we are in a call setup process
    if (!this.peerConnection) return;

    try {
      if (signal.type === "offer") {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(signal.offer)
        );

        // Create answer
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Send answer back
        socket.emit("webrtc:signal", {
          targetUserId: senderId,
          signal: { type: "answer", answer },
        });
      } else if (signal.type === "answer") {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(signal.answer)
        );
      } else if (signal.type === "candidate") {
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(signal.candidate)
        );
      }
    } catch (error) {
      console.error("Error handling signal", error);
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = enabled;
      }
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = enabled;
      }
    }
  }

  endCall(notifyRemote = true) {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (notifyRemote && this.targetUserId) {
      socket.emit("call:end", { targetUserId: this.targetUserId });
    }

    this.targetUserId = null;
    this.chatId = null;

    if (this.onCallEnded) {
      this.onCallEnded();
    }
  }

  handleCallEnded() {
    this.endCall(false); // End call locally, don't ping back
  }
}

// Export a singleton instance
export const webrtcManager = new WebRTCManager();
