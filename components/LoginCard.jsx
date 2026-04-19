"use client";

import SignInButton from "@/components/Buttons/SignInButton";
import LoginForm from "@/components/Form/LoginForm";
import CheckBox from "@/components/Input/CheckBox";
import EmailInput from "@/components/Input/EmailInput";
import PasswordInput from "@/components/Input/PasswordInput";
import SocialButtons from "@/components/Input/SocialButtons";
import Link from "next/link";
import React from "react";

export default function LoginCard() {
  return (
    <div className="flex z-50 items-center justify-center min-h-screen bg-[#e0e5ec] p-5">
      <div className="w-full max-w-md">
        <div className="login-register-style-div bg-[#e0e5ec] rounded-[30px] p-10 relative">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="profile-icon-style w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[#e0e5ec] ">
              <div className="w-10 h-10 flex items-center justify-center text-[#6c7293]">
                <img src="/profile-svgrepo-com.svg" alt="profile svg" />
              </div>
            </div>
            <h2 className="text-[#3d4468] text-2xl font-semibold mb-2">
              Welcome back
            </h2>
            <p className="text-[#9499b7] text-[15px] font-normal">
              Please sign in to continue
            </p>
          </div>

          <LoginForm
            EmailInput={EmailInput}
            PasswordInput={PasswordInput}
            CheckBox={CheckBox}
            SignInButton={SignInButton}
          />

          {/* Divider and Social */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#bec3cf] to-transparent"></div>
            <span className="text-[#9499b7] text-xs font-medium uppercase tracking-wider">
              or continue with
            </span>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#bec3cf] to-transparent"></div>
          </div>

          <SocialButtons />

          {/* Signup */}
          <div className="text-center">
            <p className="text-[#9499b7] text-sm">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-[#6c7293] font-semibold hover:text-[#3d4468]"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
