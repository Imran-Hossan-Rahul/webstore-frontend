"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm({
  NameInput,
  EmailInput,
  PasswordInput,
  CheckBox,
  SignUpButton,
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name required";
    if (!form.email.trim()) newErrors.email = "Email required";
    if (!form.password.trim()) newErrors.password = "Password required";
    if (!form.confirmPassword.trim())
      newErrors.confirmPassword = "Please confirm your password";
    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    )
      newErrors.confirmPassword = "Passwords do not match";
    if (!form.accountType) newErrors.accountType = "Please select account type";
    return newErrors;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      accountType: "",
      general: "",
    });
    setSuccess(false);

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = form; // remove confirmPassword before sending
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Registration failed");

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-7" onSubmit={handleSignUp} noValidate>
      <NameInput
        value={form.name}
        onChange={(val) => handleChange("name", val)}
        error={errors.name}
      />
      <EmailInput
        value={form.email}
        onChange={(val) => handleChange("email", val)}
        error={errors.email}
      />
      <PasswordInput
        value={form.password}
        onChange={(val) => handleChange("password", val)}
        error={errors.password}
        placeholder="Password"
      />
      <PasswordInput
        value={form.confirmPassword}
        onChange={(val) => handleChange("confirmPassword", val)}
        error={errors.confirmPassword}
        placeholder="Confirm Password"
      />

      {/* Account Type */}
      <div className="flex flex-col mb-4 ml-5">
        <label className="text-sm font-medium mb-2 text-black">
          I want to:
        </label>
        <div className="flex flex-wrap gap-4">
          {["craftsman", "patron", "both"].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="radio"
                name="accountType"
                value={type}
                checked={form.accountType === type}
                onChange={(e) => handleChange("accountType", e.target.value)}
                className="accent-blue-500"
              />
              {type === "craftsman"
                ? "Work (Craftsman)"
                : type === "patron"
                ? "Hire (patron)"
                : "Work & Hire (Both)"}
            </label>
          ))}
        </div>
        {errors.accountType && (
          <p className="text-red-500 text-xs mt-1">{errors.accountType}</p>
        )}
      </div>

      {/* Checkbox + Forgot */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
        <CheckBox />
        <a
          href="#"
          className="text-[#6c7293] text-sm font-medium hover:text-[#3d4468]"
        >
          Forgot password?
        </a>
      </div>

      <SignUpButton loading={loading || success} />

      {errors.general && (
        <p className="text-red-500 text-xs mt-1 ml-5">{errors.general}</p>
      )}
      {success && (
        <p className="text-green-500 text-sm mt-2 ml-5 animate-pulse">
          Registration successful! Redirecting...
        </p>
      )}
    </form>
  );
}

