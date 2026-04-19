"use client";

import { useState } from "react";

export default function EditorSetupPage() {
  const [framework, setFramework] = useState("nextjs");
  const [projectName, setProjectName] = useState("");

  const handleCreateProject = async () => {
    if (!projectName) {
      alert("অনুগ্রহ করে প্রজেক্টের নাম লিখুন।");
      return;
    }

    const res = await fetch("/api/create-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ framework, projectName }),
    });

    const data = await res.json();
    if (data.success) {
      alert(`প্রজেক্ট "${projectName}" সফলভাবে তৈরি হয়েছে!`);
    } else {
      alert("প্রজেক্ট তৈরি করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>নতুন প্রজেক্ট তৈরি করুন</h1>

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
        <label>প্রজেক্টের নাম: </label>
        <input
          type="text"
          placeholder="প্রজেক্টের নাম লিখুন"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>

      <button onClick={handleCreateProject}>Create Project</button>
    </div>
  );
}
