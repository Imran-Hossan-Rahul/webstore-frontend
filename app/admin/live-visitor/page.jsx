"use client";

import LiveVisitors from "@/components/AdminComponents/LiveVisitors";
import LiveEvents from "@/components/AdminComponents/LiveEvents";

export default function LiveInfo() {
  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen">
      <LiveVisitors />
    </div>
  );
}
