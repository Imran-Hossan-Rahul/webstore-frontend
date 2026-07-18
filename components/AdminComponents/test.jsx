"use client"

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", { withCredentials: true, transports: ['polling', 'websocket'] }); // backend এর port ঠিক আছে কিনা চেক করো

export default function TestSocket() {
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    console.log("Connecting to Socket.io...");

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("newVisitor", (data) => {
      console.log("New visitor received:", data);
      setVisitors((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("newVisitor");
    };
  }, []);

  return (
    <div>
      <h1>Live Visitors</h1>
      <ul>
        {visitors.map((v, idx) => (
          <li key={idx}>
            {v.visitorId} - {v.device}
          </li>
        ))}
      </ul>
    </div>
  );
}
