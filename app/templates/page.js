"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Templates() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/");
  }, [router]);
  
  return null;
}
