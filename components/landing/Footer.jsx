"use client";
import React from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, MessageCircle, Globe } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function Footer() {
  const { showToast } = useToast();
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
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Codalina
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 rounded-full">
                    Beta
                  </span>
                </div>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">
                Empowering craftsmen to build the future of the web. 
                Simple, powerful, and beautiful.
            </p>
            <div className="mb-4">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">Connect with the Founder</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
                Have questions, business inquiries, or found a bug? Reach out directly!
              </p>
              <div className="flex flex-wrap gap-3">
                  <a 
                    href="mailto:imranhossanrahul.dev@gmail.com" 
                    onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText("imranhossanrahul.dev@gmail.com");
                        showToast("Email address copied to clipboard!", "success");
                        window.location.href = "mailto:imranhossanrahul.dev@gmail.com";
                    }}
                    className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-500 hover:text-red-500 transition-colors shadow-sm cursor-pointer" 
                    title="Email"
                  >
                      <Mail className="w-5 h-5" />
                  </a>
                  <a href="whatsapp://send?phone=8801400226379" className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-full transition-colors shadow-sm" title="WhatsApp">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                      </svg>
                  </a>
                  <a href="https://www.linkedin.com/in/imran-hossan-584383411/" target="_blank" rel="noreferrer" className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-500 hover:text-blue-600 transition-colors shadow-sm" title="LinkedIn">
                      <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="https://github.com/Imran-Hossan-Rahul" target="_blank" rel="noreferrer" className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm" title="GitHub">
                      <Github className="w-5 h-5" />
                  </a>
                  <a href="https://imran-hossan-rahul-dev.vercel.app/" target="_blank" rel="noreferrer" className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-500 hover:text-indigo-500 transition-colors shadow-sm" title="Portfolio">
                      <Globe className="w-5 h-5" />
                  </a>
              </div>
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
                © {new Date().getFullYear()} Codalina Inc. All rights reserved. <span className="mx-2">•</span> Beta v1.0.0
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

