"use client";
import React from "react";
import { Palette, LayoutArtifact, Users, Zap, Code2, BarChart, Globe } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Advanced Design Engine",
    description: "Create stunning visuals with our intuitive drag-and-drop editor. No design skills required.",
    className: "md:col-span-2",
  },
  {
    icon: LayoutArtifact,
    title: "500+ Artifacts",
    description: "Start fast with professional artifacts for every use case.",
    className: "md:col-span-1",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Work together with your team in real-time. Comments, cursors, and more.",
    className: "md:col-span-1",
  },
  {
    icon: Code2,
    title: "Developer API",
    description: "Extend functionality with our robust API and SDKs.",
    className: "md:col-span-2",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            Everything you need to <span className="text-purple-600">build better</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Powerful features designed to help you scale your creative workflow from idea to launch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 hover:shadow-2xl transition-all duration-300 ${feature.className}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-opacity group-hover:opacity-80 duration-500" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 text-slate-900 dark:text-white group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
          
          {/* Stats / Extra Info */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
             <div className="p-6 rounded-2xl bg-blue-600 text-white text-center">
                <div className="text-4xl font-extrabold mb-1">99%</div>
                <div className="text-sm opacity-80">Customer Satisfaction</div>
             </div>
             <div className="p-6 rounded-2xl bg-purple-600 text-white text-center">
                <div className="text-4xl font-extrabold mb-1">24/7</div>
                <div className="text-sm opacity-80">Support Available</div>
             </div>
              <div className="p-6 rounded-2xl bg-pink-600 text-white text-center">
                <div className="text-4xl font-extrabold mb-1">10k+</div>
                <div className="text-sm opacity-80">Community Members</div>
             </div>
             <div className="p-6 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-center flex items-center justify-center">
                <div className="font-bold text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5"/>
                    Global CDN
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

