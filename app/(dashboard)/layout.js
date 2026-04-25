import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import DashboardLayoutWrapper from "@/components/dashboard/DashboardLayoutWrapper";

export default async function DashboardLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET_ACCESS_TOKEN);
      await jwtVerify(token, secret);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (res.ok) {
        isAuthenticated = true;
      }
    } catch (err) {
      console.error("Token verification failed in dashboard layout:", err.message);
      isAuthenticated = false;
    }
  }

  return (
    <DashboardLayoutWrapper isGuest={!isAuthenticated}>
      {children}
    </DashboardLayoutWrapper>
  );
}
