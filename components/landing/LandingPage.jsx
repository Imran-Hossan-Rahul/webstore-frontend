import React from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen selection: bg-brand-main">
      <LandingNavbar />
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
