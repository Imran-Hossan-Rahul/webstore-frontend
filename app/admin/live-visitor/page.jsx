"use client";

import LiveVisitors from "@/components/AdminComponents/LiveVisitors";
import LiveEvents from "@/components/AdminComponents/LiveEvents";

export default function LiveInfo() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl text-black font-bold mb-6">Live Information</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Live Visitors */}
        <div className="bg-white shadow rounded-lg p-4 h-[400px] overflow-auto">
          <LiveVisitors />
        </div>

        {/* Live Events */}
        <div className="bg-white shadow rounded-lg p-4 h-[400px] overflow-auto">
          <LiveEvents />
        </div>
      </div>
    </div>
  );
}
