import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import BlogsDashboard from "@/components/dashboard/blogs/BlogsDashboard";

export default async function BlogsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const JWT_SECRET = "4625f0409cbe8a2008e3b6e1e779ad02f1fd4fc792b0b9dda08d4e72236fca086460f4fac2061d082f21449b64329ffc6bc6b2328bbd737f8aa92eb87661fc45";
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (res.ok) isAuthenticated = true;
    } catch (err) {
      console.error("Token invalid:", err);
    }
  }

  // Public page — everyone can browse blogs
  return <BlogsDashboard isGuest={!isAuthenticated} />;
}
