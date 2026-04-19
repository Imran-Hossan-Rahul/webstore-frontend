"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function InteractiveCharts() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      setRotation({ x: y, y: x });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getZIndex = (index) => {
    if (activeCard === index) return 30;
    return 10 - index;
  };

  const getTransform = (index) => {
    const baseRotate = [-6, -3, 0][index];
    const baseTranslateY = [0, 30, 60][index];
    const baseTranslateZ = [-60, -30, 0][index];
    
    if (activeCard === index) {
      return `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(${baseTranslateY}px) translateZ(50px) rotate(0deg) scale(1.05)`;
    }
    
    return `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(${baseTranslateY}px) translateZ(${baseTranslateZ}px) rotate(${baseRotate}deg)`;
  };

  // Chart Data
  const usersData = [
    { month: "Jan", value: 200 },
    { month: "Mar", value: 450 },
    { month: "May", value: 550 },
    { month: "Jul", value: 400 },
    { month: "Sep", value: 700 },
    { month: "Nov", value: 650 },
    { month: "Jan", value: 500 },
  ];

  const templatesData = [
    { month: "Jan", value: 150 },
    { month: "Mar", value: 350 },
    { month: "May", value: 450 },
    { month: "Jul", value: 300 },
    { month: "Sep", value: 600 },
    { month: "Nov", value: 550 },
    { month: "Jan", value: 400 },
  ];

  const blogsData = [
    { month: "Jan", value: 100 },
    { month: "Mar", value: 250 },
    { month: "May", value: 350 },
    { month: "Jul", value: 200 },
    { month: "Sep", value: 500 },
    { month: "Nov", value: 450 },
    { month: "Jan", value: 300 },
  ];

  return (
    <div
      className="relative w-[480px] h-[550px]"
      style={{ 
        perspective: "2000px",
        transformStyle: "preserve-3d"
      }}
    >
      {/* Chart 1 - Users */}
      <div
        className="absolute top-0 left-0 w-full bg-white rounded-[20px] p-5 shadow-xl transition-all duration-300 ease-out cursor-pointer"
        style={{ 
          transform: getTransform(0),
          transformStyle: "preserve-3d",
          zIndex: getZIndex(0)
        }}
        onMouseEnter={() => setActiveCard(0)}
        onMouseLeave={() => setActiveCard(null)}
      >
        <h3 className="text-[#1a1a1a] text-sm font-bold mb-3">
          Deals Closed vs Goal
        </h3>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usersData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 - Templates */}
      <div
        className="absolute top-0 left-0 w-full bg-white rounded-[20px] p-5 shadow-xl transition-all duration-300 ease-out cursor-pointer"
        style={{ 
          transform: getTransform(1),
          transformStyle: "preserve-3d",
          zIndex: getZIndex(1)
        }}
        onMouseEnter={() => setActiveCard(1)}
        onMouseLeave={() => setActiveCard(null)}
      >
        <h3 className="text-[#1a1a1a] text-sm font-bold mb-3">
          Templates Uploaded
        </h3>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={templatesData}>
              <defs>
                <linearGradient id="colorTemplates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} fillOpacity={1} fill="url(#colorTemplates)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3 - Blogs */}
      <div
        className="absolute top-0 left-0 w-full bg-white rounded-[20px] p-5 shadow-xl transition-all duration-300 ease-out cursor-pointer"
        style={{ 
          transform: getTransform(2),
          transformStyle: "preserve-3d",
          zIndex: getZIndex(2)
        }}
        onMouseEnter={() => setActiveCard(2)}
        onMouseLeave={() => setActiveCard(null)}
      >
        <h3 className="text-[#1a1a1a] text-sm font-bold mb-3">
          Blogs Published
        </h3>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={blogsData}>
              <defs>
                <linearGradient id="colorBlogs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="value" stroke="#f472b6" strokeWidth={2} fillOpacity={1} fill="url(#colorBlogs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
