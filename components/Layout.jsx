"use client";

import { useState } from "react";
import Background from "@/components/Background";
import InnerDiv from "@/components/InnerDiv";
import GlassNavbar from "./dashboard/GlassNavbar";
import TrackerClient from "./TrackerClient";
import SmoothCursor from "./MainCursor";
import CreatorAccountModal from "@/components/DashboardComponents/CreatorAccountModal";

export default function Layout({ children }) {
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  return (
    <Background>
      <SmoothCursor smoothness={0.05} />
      <TrackerClient />

      <InnerDiv>
        <GlassNavbar onOpenCreatorModal={() => setShowCreatorModal(true)} />

        <main className="w-full flex justify-center">
          <div className="w-full max-w-[1800px] px-3 md:px-6 lg:px-8 pb-16">
            {children}
          </div>
        </main>
      </InnerDiv>

      <CreatorAccountModal 
        isOpen={showCreatorModal} 
        onClose={() => setShowCreatorModal(false)}
      />
    </Background>
  );
}
