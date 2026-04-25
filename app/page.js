import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import AuthenticatedHome from "@/components/dashboard/AuthenticatedHome";


export default async function Home() {
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
      console.error("Token verification failed in page.js:", err.message);
      isAuthenticated = false;
    }
  }

  // Always show the feed — guests get isGuest=true, authenticated users get full access
  return <AuthenticatedHome isGuest={!isAuthenticated} />;
}
