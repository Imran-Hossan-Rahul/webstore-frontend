"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { useUser } from "@/context/UserContext";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isGuest } = useUser();

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
          ? "bg-brand-surface/80 dark:bg-black/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 h-16"
          : "bg-transparent h-20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Codalina" className="h-8 w-8 object-contain" />
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Codalina
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue dark:text-indigo-400 border border-brand-blue/20 rounded-full">
              Beta
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-brand-slate dark:text-slate-300 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA & Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {isGuest ? (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-brand-slate dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/auth/register" className="px-5 py-2.5 bg-black dark:bg-brand-surface text-white dark:text-black text-sm font-bold rounded-full hover:opacity-80 transition-all flex items-center gap-2 group">
                Get Started
                <ArrowRight strokeWidth={1.5} className="w-4 h-4 group-hover:translate-x-1 transition-opacity" />
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className="px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-full hover:bg-brand-blue transition-all flex items-center gap-2 group">
              Dashboard
              <ArrowRight strokeWidth={1.5} className="w-4 h-4 group-hover:translate-x-1 transition-opacity" />
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-brand-slate dark:text-slate-300"
            >
            {mobileMenuOpen ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-brand-surface dark:bg-black border-b border-slate-100 dark:border-slate-800 p-4 md:hidden flex flex-col gap-4 shadow-sm animate-in slide-in-from-top-2">
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
          <div className="h-px bg-slate-100 dark:bg-brand-surface my-2" />
          {isGuest ? (
            <>
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center font-medium text-brand-slate dark:text-slate-200 bg-brand-cloud dark:bg-slate-900 rounded-xl block">
                Log in
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center font-bold text-white bg-brand-blue rounded-xl block">
                Get Started
              </Link>
            </>
          ) : (
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center font-bold text-white bg-brand-blue rounded-xl block">
              Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
