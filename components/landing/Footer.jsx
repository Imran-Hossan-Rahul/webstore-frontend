"use client";
import React from "react";
import Link from "next/link";
import { Twitter, Github, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  const links = {
    Product: ["Features", "Artifacts", "Integrations", "Pricing", "Changelog"],
    Company: ["About", "Careers", "Codex", "Contact", "Partners"],
    Resources: ["Documentation", "Help Center", "Community", "Developers"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
  };

  return (
    <footer className="bg-slate-50 dark:bg-black pt-20 pb-10 border-t border-slate-100 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
             <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl">
                    <div className="w-4 h-4 bg-white rounded-full opacity-50" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Amr<span className="text-indigo-600">Platform</span>
                </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">
                Empowering craftsmen to build the future of the web. 
                Simple, powerful, and beautiful.
            </p>
            <div className="flex gap-4">
                <a href="#" className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
                    <Twitter className="w-5 h-5" />
                </a>
                 <a href="#" className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm">
                    <Github className="w-5 h-5" />
                </a>
                 <a href="#" className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-500 hover:text-blue-700 transition-colors shadow-sm">
                    <Linkedin className="w-5 h-5" />
                </a>
                 <a href="#" className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-500 hover:text-pink-600 transition-colors shadow-sm">
                    <Instagram className="w-5 h-5" />
                </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} Codalina Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-sm text-slate-500">
                <span>Designed with</span>
                <span className="text-red-500">♥</span>
                <span>by Imran</span>
            </div>
        </div>

      </div>
    </footer>
  );
}

