"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Pricing", href: "#pricing" }, // Added pricing for completeness
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 h-16"
          : "bg-transparent h-20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
             <div className="w-4 h-4 bg-white rounded-full opacity-50" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Amr<span className="text-indigo-600">Platform</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA & Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link href="/auth/login">
            <button className="text-sm font-medium text-slate-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors">
              Log in
            </button>
          </Link>
          <Link href="/auth/register">
            <button className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full hover:opacity-80 transition-all flex items-center gap-2 group">
              Get Started
              <ArrowRight strokeWidth={1.5} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-gray-300"
            >
            {mobileMenuOpen ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-black border-b border-slate-100 dark:border-slate-800 p-4 md:hidden flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-900 dark:text-white py-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
          <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
            <button className="w-full py-3 text-center font-medium text-slate-700 dark:text-gray-200 bg-slate-50 dark:bg-slate-900 rounded-xl">
              Log in
            </button>
          </Link>
          <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
            <button className="w-full py-3 text-center font-bold text-white bg-blue-600 rounded-xl">
              Get Started
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
