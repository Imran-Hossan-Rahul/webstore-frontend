"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CraftsmanDashboard from "@/components/DashboardComponents/CraftsmanDashboard";
import CraftsmanOnboardingModal from "@/components/modals/CraftsmanOnboardingModal";
import { api } from "@/utils/api";

export default function CraftsmanPage() {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get("/user/profile");
        if (res.success && res.data?.hasCraftsmanAccount) {
          setIsAllowed(true);
        } else {
          router.replace("/");
        }
      } catch {
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  if (loading || !isAllowed) return null;

  return (
    <>
      <CraftsmanDashboard />
      <CraftsmanOnboardingModal
        isOpen={showOnboarding}
        onClose={() => {}}
        onSuccess={() => setShowOnboarding(false)}
      />
    </>
  );
}
