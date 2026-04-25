"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Explore() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/?view=discover");
  }, [router]);
  
  return null;
}
