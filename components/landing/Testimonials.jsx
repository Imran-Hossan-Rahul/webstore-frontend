"use client";
import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Designer @ TechFlow",
    content: "This platform has completely transformed how we collaborate on design systems. It's fast, intuitive, and simply beautiful.",
    avatar: "S"
  },
  {
    name: "Michael Chen",
    role: "Frontend Dev @ StartupX",
    content: "The developer API is a game changer. We integrated it into our workflow in less than a day.",
    avatar: "M"
  },
  {
    name: "Emma Davis",
    role: "Freelance Creative",
    content: "Finally, a place where I can showcase my work and get paid for my artifacts without the headache.",
    avatar: "E"
  },
  {
    name: "James Wilson",
    role: "CTO @ CloudScale",
    content: "Security and scalability were our top concerns. Codalina nailed both.",
    avatar: "J"
  },
    {
    name: "Linda Martinez",
    role: "Marketing Director",
    content: "Our team loves the real-time collaboration features. It feels like we are in the same room.",
    avatar: "L"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
          Loved by <span className="text-pink-600">Craftsmen</span>
        </h2>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-black to-transparent z-10" />

        <div className="flex gap-6 animate-marquee hover:pause whitespace-nowrap py-4">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div 
              key={i} 
              className="w-[350px] flex-shrink-0 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 whitespace-normal"
            >
              <div className="flex items-center gap-1 mb-4 text-amber-400">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-slate-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                "{t.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 text-white flex items-center justify-center font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

