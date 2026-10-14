"use client";

import { useState } from "react";

export default function EditorSetupPage() {
  const [framework, setFramework] = useState("nextjs");
  const [devlogName, setDevlogName] = useState("");

  const handleCreateDevlog = async () => {
    if (!devlogName) {
      alert("অনুগ্রহ করে ডেভলগের নাম লিখুন।");
      return;
    }

    const res = await fetch("/api/create-devlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ framework, devlogName }),
    });

    const data = await res.json();
    if (data.success) {
      alert(`ডেভলগ "${devlogName}" সফলভাবে তৈরি হয়েছে!`);
    } else {
      alert("ডেভলগ তৈরি করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>নতুন ডেভলগ তৈরি করুন</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>ফ্রেমওয়ার্ক সিলেক্ট করুন: </label>
        <select
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
        >
          <option value="react">React</option>
          <option value="nextjs">Next.js</option>
          <option value="vue">Vue</option>
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>ডেভলগের নাম: </label>
        <input
          type="text"
          placeholder="ডেভলগের নাম লিখুন"
          value={devlogName}
          onChange={(e) => setDevlogName(e.target.value)}
        />
      </div>

      <button onClick={handleCreateDevlog}>Create Devlog</button>
    </div>
  );
}

