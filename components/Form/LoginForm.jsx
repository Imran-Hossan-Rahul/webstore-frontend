"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginForm({
  EmailInput,
  PasswordInput,
  CheckBox,
  SignInButton,
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

const handleSignIn = async (e) => {
  e.preventDefault();
  setEmailError("");
  setPasswordError("");
  setGeneralError("");

  if (!email || !password) {
    if (!email) setEmailError("Email লাগবে");
    if (!password) setPasswordError("Password লাগবে");
    return;
  }

  setLoading(true);

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Login failed");

    // -----------------------------------------------------
    // 🔥 THIS IS IMPORTANT (Middleware reads token from cookie)
    // -----------------------------------------------------
    Cookies.set("token", data.data.accessToken, { expires: 7 });
    Cookies.set("hasCreatorAccount", data.data.hasCreatorAccount, { expires: 7 });

    // Optional but OK
    localStorage.setItem("user", JSON.stringify(data.data));
    localStorage.setItem("hasCreatorAccount", data.data.hasCreatorAccount);
    localStorage.setItem("userId", data.data._id);
    localStorage.setItem("token", data.data.accessToken);

    if (typeof loginUser === "function") loginUser(data.data);

    // -----------------------------------------------------
    // 🔥 Redirect based on creator account status
    // -----------------------------------------------------
    if (data.data.hasCreatorAccount) {
      router.push("/user/creator");
    } else {
      router.push("/dashboard");
    }
  } catch (err) {
    setGeneralError(err.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <div>
      <form className="space-y-7" id="loginForm" noValidate>
        {/* Email */}
        <EmailInput value={email} onChange={setEmail} error={emailError} />

        {/* Password */}
        <PasswordInput
          value={password}
          onChange={setPassword}
          error={passwordError}
        />

        {/* Options */}
        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
          <CheckBox />
          <a className="text-[#6c7293] text-sm font-medium hover:text-[#3d4468]">
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <SignInButton onClick={handleSignIn} loading={loading} />

        {/* General error */}
        {generalError && (
          <p className="text-red-500 text-xs mt-1 ml-5">{generalError}</p>
        )}
      </form>
    </div>
  );
}
