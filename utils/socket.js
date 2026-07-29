import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

// More robust socket configuration for production
const socket = io(SOCKET_URL, {
  autoConnect: typeof window !== "undefined",
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  timeout: 20000,
  // Try polling first, then upgrade to websocket
  transports: ['polling', 'websocket'],
  // Add path if needed
  path: '/socket.io/',
  // Disable upgrade if websocket fails
  upgrade: true,
  // Add withCredentials for CORS
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
  // Fallback to polling if websocket fails
  if (socket.io.opts.transports.includes('websocket')) {
    console.log('🔄 Falling back to polling transport');
  }
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`🔄 Reconnection attempt ${attemptNumber}`);
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`✅ Reconnected after ${attemptNumber} attempts`);
});

socket.on('reconnect_failed', () => {
  console.error('❌ Reconnection failed after all attempts');
});

export default socket;
