"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";

export default function SettingsMain() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await api.get("/user/profile");
      if (res.success) {
          setUser(res.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      const res = await api.patch("/user/profile", data);
      if (res.success) {
          setUser(res.data);
          showToast("Settings saved successfully!", "success", "Saved!");
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast("Error saving settings. Please try again.", "error", "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard absolute left-20 top-16 md:w-[1800px] pr-10">
        <div className="text-center py-20">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard absolute left-20 top-16 md:w-[1800px] pr-10">
      <h1 className="text-4xl font-bold text-black mb-8">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {[
          { id: "profile", label: "Profile" },
          { id: "account", label: "Account" },
          { id: "payout", label: "Payout" },
          { id: "preferences", label: "Preferences" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => window.history.pushState({}, "", `?tab=${tab.id}`)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? "text-black border-b-2 border-black"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-[26px] p-8 shadow-lg">
        {activeTab === "profile" && (
          <ProfileSettings user={user} onSave={handleSave} saving={saving} />
        )}
        {activeTab === "account" && (
          <AccountSettings user={user} onSave={handleSave} saving={saving} />
        )}
        {activeTab === "payout" && (
          <PayoutSettings user={user} onSave={handleSave} saving={saving} />
        )}
        {activeTab === "preferences" && (
          <PreferencesSettings user={user} onSave={handleSave} saving={saving} />
        )}
      </div>
    </div>
  );
}

function ProfileSettings({ user, onSave, saving }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    skills: user?.skills?.join(", ") || "", // Display as comma separated string
    workType: user?.workType || "solo",
  });

  const handleSubmit = () => {
      // Convert skills string back to array
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      onSave({ ...formData, skills: skillsArray });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-black mb-6">Profile Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none"
          placeholder="Tell us about yourself..."
        />
        <p className="text-xs text-gray-400 text-right mt-1">{formData.bio.length}/500</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills (comma separated)
        </label>
        <input
          type="text"
          value={formData.skills}
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
          placeholder="React, Node.js, Python"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Type
        </label>
        <select
          value={formData.workType}
          onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
        >
          <option value="solo">Solo Creator</option>
          <option value="team">Team / Agency</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

function AccountSettings({ user, onSave, saving }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-black mb-6">Account Settings</h2>
      <p className="text-gray-600">Account settings coming soon...</p>
    </div>
  );
}

function PayoutSettings({ user, onSave, saving }) {
  const [formData, setFormData] = useState({
    payoneerEmail: user?.payoneerEmail || "",
    payoutMethod: user?.payoutMethod || "payoneer",
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-black mb-6">Payout Settings</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payoneer Email
        </label>
        <input
          type="email"
          value={formData.payoneerEmail}
          onChange={(e) => setFormData({ ...formData, payoneerEmail: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="your-email@payoneer.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payout Method
        </label>
        <select
          value={formData.payoutMethod}
          onChange={(e) => setFormData({ ...formData, payoutMethod: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="payoneer">Payoneer</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      <button
        onClick={() => onSave(formData)}
        disabled={saving}
        className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

function PreferencesSettings({ user, onSave, saving }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-black mb-6">Preferences</h2>
      <p className="text-gray-600">Preferences settings coming soon...</p>
    </div>
  );
}

