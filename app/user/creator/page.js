"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreatorDashboard from "@/components/DashboardComponents/CreatorDashboard";
import CreatorOnboardingModal from "@/components/modals/CreatorOnboardingModal";
import { api } from "@/utils/api";

const ALLOWED_CREATOR_EMAIL = "imranhossanrahul.dev@gmail.com";

export default function CreatorPage() {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get("/user/profile");
        if (res.success && res.data?.email?.toLowerCase() === ALLOWED_CREATOR_EMAIL) {
          setIsAllowed(true);
          if (!res.data.hasCreatorAccount) {
            setShowOnboarding(true);
          }
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
      <CreatorDashboard />
      <CreatorOnboardingModal
        isOpen={showOnboarding}
        onClose={() => {}}
        onSuccess={() => setShowOnboarding(false)}
      />
    </>
  );
}
