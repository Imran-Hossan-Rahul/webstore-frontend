"use client";

import { useState } from "react";
import Background from "@/components/Background";
import InnerDiv from "@/components/InnerDiv";
import GlassNavbar from "./dashboard/GlassNavbar";
import TrackerPatron from "./TrackerPatron";

import CraftsmanAccountModal from "@/components/DashboardComponents/CraftsmanAccountModal";

export default function Layout({ children }) {
  const [showCraftsmanModal, setShowCraftsmanModal] = useState(false);
  return (
    <Background>

      <TrackerPatron />

      <InnerDiv>
        <GlassNavbar onOpenCraftsmanModal={() => setShowCraftsmanModal(true)} />

        <main className="w-full flex justify-center">
          <div className="w-full max-w-[1800px] px-3 md:px-6 lg:px-8 pb-16">
            {children}
          </div>
        </main>
      </InnerDiv>

      <CraftsmanAccountModal 
        isOpen={showCraftsmanModal} 
        onClose={() => setShowCraftsmanModal(false)}
      />
    </Background>
  );
}
