"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Bug, Lightbulb, CheckCircle2 } from "lucide-react";
import { api } from "@/utils/api";

import AppleSpinner from "@/components/ui/AppleSpinner";

export default function FeedbackModal({ isOpen, onClose, onOpenChat }) {
  const [feedbackType, setFeedbackType] = useState("suggestion"); // suggestion, bug, other
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate network request for feedback
      await new Promise((resolve) => setTimeout(resolve, 800)); 
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      alert("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-md z-[99990]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[99995] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[420px] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-3xl rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/5 dark:border-white/10 overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="px-8 pt-8 pb-2 flex items-start justify-between">
                <div>
                  <h2 className="text-[28px] font-semibold text-black dark:text-white tracking-tight leading-tight">Help & Feedback</h2>
                  <p className="text-[15px] text-[#86868b] mt-1 font-normal">How can we assist you today?</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-[30px] h-[30px] rounded-full bg-[#f2f2f7] dark:bg-[#2c2c2e] flex items-center justify-center text-[#8a8a8e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] transition-colors mt-1"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="px-8 pb-8 pt-4 flex flex-col gap-6 relative">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-center"
                  >
                    <div className="w-16 h-16 bg-[#34c759]/10 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} className="text-[#34c759]" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[22px] font-bold text-black dark:text-white tracking-tight">Thank You!</h3>
                    <p className="text-[15px] text-[#86868b] mt-2 font-medium">Your feedback has been received.</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Contact Support Option */}
                    <button 
                      onClick={() => {
                        onClose();
                        onOpenChat();
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-[4px] bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] transition-colors text-left group"
                    >
                      <div className="w-[46px] h-[46px] rounded-full bg-brand-blue flex items-center justify-center text-white shrink-0">
                        <MessageCircle size={22} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-medium text-black dark:text-white text-[17px] tracking-tight leading-tight">Chat with Support</h3>
                        <p className="text-[13px] text-[#86868b] mt-0.5 font-normal">Talk to our team directly</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-4 my-1">
                      <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5"></div>
                      <span className="text-[13px] font-medium text-[#86868b]">Or send feedback</span>
                      <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5"></div>
                    </div>

                    {/* Feedback Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      <div className="flex gap-1 p-[2px] bg-[#e5e5ea] dark:bg-[#2c2c2e] rounded-[9px]">
                        <button
                          type="button"
                          onClick={() => setFeedbackType("suggestion")}
                          className={`flex-1 flex justify-center items-center gap-2 py-[6px] text-[13px] font-medium rounded-[7px] transition-all ${feedbackType === "suggestion" ? "bg-white dark:bg-[#3a3a3c] text-black dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)]" : "text-[#8a8a8e]"}`}
                        >
                          <Lightbulb size={15} strokeWidth={2} />
                          Suggestion
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeedbackType("bug")}
                          className={`flex-1 flex justify-center items-center gap-2 py-[6px] text-[13px] font-medium rounded-[7px] transition-all ${feedbackType === "bug" ? "bg-white dark:bg-[#3a3a3c] text-black dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)]" : "text-[#8a8a8e]"}`}
                        >
                          <Bug size={15} strokeWidth={2} />
                          Bug Report
                        </button>
                      </div>

                      <div className="relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={feedbackType === "suggestion" ? "How can we improve your experience?" : "What went wrong?"}
                          className="w-full h-[120px] resize-none rounded-[4px] bg-[#f5f5f7] dark:bg-[#2c2c2e] border-0 px-4 py-3.5 text-[15px] text-black dark:text-white placeholder:text-[#8a8a8e] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all font-normal"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={!message.trim() || isSubmitting}
                        className="w-full flex justify-center items-center gap-2 py-3.5 bg-brand-blue text-white rounded-full font-semibold text-[17px] tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0077ed] transition-colors mt-2"
                      >
                        {isSubmitting ? (
                          <AppleSpinner size={20} />
                        ) : (
                          <>
                            <Send size={18} strokeWidth={2} />
                            Send {feedbackType === "suggestion" ? "Suggestion" : "Report"}
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
