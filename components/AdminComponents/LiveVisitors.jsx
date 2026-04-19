"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL);

export default function LiveVisitors() {
  const [visitors, setVisitors] = useState([]);

  const fetchVisitors = () => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/visitors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {

        // FIX: API direct array দিচ্ছে
        if (Array.isArray(data)) {
          setVisitors(data);
        } else {
          setVisitors([]);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  useEffect(() => {
    socket.on("newVisitor", () => {
      fetchVisitors();
    });

    return () => socket.off("newVisitor");
  }, []);

  return (
    <div className="h-[400px] overflow-auto">
      <table className="w-full border">
        <thead className="sticky top-0 bg-gray-200">
          <tr>
            <th>Visitor ID</th>
            <th>Device</th>
            <th>Browser</th>
            <th>IP</th>
            <th>Location</th>
            <th>Last Visit</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((v) => (
            <tr key={v.visitorId}>
              <td>{v.visitorId}</td>
              <td>{v.device}</td>
              <td>{v.browser}</td>
              <td>{v.ip}</td>
              <td>{v.location?.country}</td>
              <td>{new Date(v.lastVisit).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
