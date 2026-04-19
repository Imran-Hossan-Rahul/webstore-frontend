"use client";

import { useEffect, useState } from "react";

export default function LastLoginTable() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/user-analysis`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        const json = await res.json();
        if (json.success) {
          setUsers(json.data.lastLoginStats);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="card-template p-3 rounded-2xl shadow-md text-black overflow-x-auto">
      <h2 className="text-lg font-bold mb-2">Last Login Users</h2>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="p-1 border">Name</th>
            <th className="p-1 border">Email</th>
            <th className="p-1 border">Last Login</th>
            <th className="p-1 border">Device</th>
            <th className="p-1 border">Browser</th>
            <th className="p-1 border">Referrer</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="p-1 border">{u.name}</td>
              <td className="p-1 border">{u.email}</td>
              <td className="p-1 border">
                {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "-"}
              </td>
              <td className="p-1 border">{u.device || "Unknown"}</td>
              <td className="p-1 border">{u.browser || "Unknown"}</td>
              <td className="p-1 border">{u.referrer || "Direct"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
