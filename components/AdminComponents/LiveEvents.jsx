"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", { withCredentials: true, transports: ['polling', 'websocket'] });

export default function LiveEvents() {
  const [sessions, setSessions] = useState([]);

  const fetchSessions = () => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/sessions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setSessions(data.data);
        } else {
          setSessions([]);
        }
      })
      .catch((err) => console.error("FETCH ERROR:", err));
  };

  // Page load
  useEffect(() => {
    fetchSessions();
  }, []);

  // Socket listener for live updates
  useEffect(() => {
    socket.on("newEvent", () => {
      fetchSessions(); // live update
    });

    return () => {
      socket.off("newEvent");
    };
  }, []);

  return (
    <div className="h-[400px] overflow-auto border">
      <table className="w-full border-collapse border">
        <thead className="sticky top-0 bg-slate-200">
          <tr>
            <th>Visitor ID</th>
            <th>Session ID</th>
            <th>Event Types</th>
            <th>Page Views</th>
            <th>Start Time</th>
            <th>Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.sessionId} className="hover:bg-slate-100">
              <td>{s.visitorId || "Unknown"}</td>
              <td>{s.sessionId || "Unknown"}</td>
              <td>{(s.eventTypes || []).join(", ")}</td>
              <td>{s.pageViews || 0}</td>
              <td>{s.startTime ? new Date(s.startTime).toLocaleString() : "-"}</td>
              <td>{s.lastActivity ? new Date(s.lastActivity).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
