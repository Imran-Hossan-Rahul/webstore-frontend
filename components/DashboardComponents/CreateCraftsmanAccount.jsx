"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function CreateCraftsmanAccount({ onSuccess }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    skills: [],
    workType: "solo",
    portfolio: [],
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      website: "",
    },
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && formData.skills.length < 20) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/craftsman/create", formData);

      if (response.success) {
        // Update localStorage and cookies with new token
        localStorage.setItem("hasCraftsmanAccount", "true");
        
        // Update token if provided
        if (response.data.accessToken) {
          localStorage.setItem("token", response.data.accessToken);
          // Update cookie as well
          document.cookie = `token=${response.data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
          document.cookie = `hasCraftsmanAccount=true; path=/; max-age=${7 * 24 * 60 * 60}`;
        }
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Redirect to craftsman dashboard
        router.push("/user/craftsman");
      }
    } catch (err) {
      setError(err.message || "Failed to create craftsman account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Create Your Craftsman Account
      </h2>
      <p className="text-slate-600 mb-6">
        Unlock craftsman features: publish codex, share artifacts, and showcase your work!
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => handleChange("displayName", e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            placeholder="Your craftsman name"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            placeholder="Tell us about yourself..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-slate-500 mt-1">
            {formData.bio.length}/500 characters
          </p>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Skills (Max 20)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              placeholder="Add a skill"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-blue-600"
              disabled={formData.skills.length >= 20}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Work Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Work Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="solo"
                checked={formData.workType === "solo"}
                onChange={(e) => handleChange("workType", e.target.value)}
                className="mr-2"
              />
              Solo
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="team"
                checked={formData.workType === "team"}
                onChange={(e) => handleChange("workType", e.target.value)}
                className="mr-2"
              />
              Team
            </label>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Social & Professional Links <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="space-y-3">
            {["github", "linkedin", "twitter", "website"].map((platform) => (
              <div key={platform}>
                <label className="block text-xs text-slate-600 mb-1 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={formData.socialLinks[platform]}
                  onChange={(e) =>
                    handleSocialLinkChange(platform, e.target.value)
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder={`https://${platform}.com/yourprofile`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error.message || error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.displayName}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creating..." : "Create Craftsman Account"}
        </button>
      </form>
    </div>
  );
}



