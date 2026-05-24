"use client";

import React, { useState, useContext } from "react";
import { Heart, Download } from "lucide-react";
import { api } from "@/utils/api";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { useToast } from "@/components/ui/ToastProvider";

const ArtifactCard = ({
  id,
  title = "Untitled",
  description = "No description available.",
  tags = [],
  previewFile,
  likes = 0,
  isLiked = false,
  userId = null,
  embedUrl,
  price = null,
  discount = 0,
  fileType = "image",
  featured = "",
  currency = "TKNS",
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const { showToast } = useToast();
  const { user, refreshUser } = useContext(DashboardContext);

  const canAfford = (user?.walletBalance || 0) >= (hasDiscount ? price - price * (discount / 100) : price);

  const truncatedTitle =
    title.length > 30 ? title.substring(0, 30) + "..." : title;
  const safeTags = Array.isArray(tags) ? tags : [];
  const descriptionHeight = 67;

  const isFree = !price || price === 0;
  const hasDiscount = price > 0 && discount > 0;
  const finalPrice = hasDiscount ? price - price * (discount / 100) : price;

  // =======================
  // LIKE HANDLER
  // =======================
  const handleLike = async (e) => {
    e.stopPropagation();
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await api.post(`/artifact/${id}/like`);
      if (res.liked !== undefined) {
        setLiked(res.liked);
      }
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  // =======================
  // DOWNLOAD HANDLER
  // =======================
const handleDownload = async (e) => {
  e.stopPropagation();

  try {
    const res = await api.post(`/artifact/${id}/download`);

    if (res.url) {
      window.location.href = res.url; // free download
      return;
    }
  } catch (err) {
    console.error("❌ Download error:", err);

    if (err.message.includes("403")) {
      // 🔹 Show native token purchase modal
      setShowPaymentModal(true);
      return;
    }
  }
};


  // =======================
  // Purchase Handler (TKNS Native)
  // =======================
  const handlePurchase = async () => {
    try {
        const res = await api.post(`/artifact/${id}/buy`);

        if (res.success) {
            setShowPaymentModal(false);
            showToast("Artifact purchased successfully! You can now download it.", "success", "Purchase Complete 🎉");
            await refreshUser(); // Update global balance
            // Re-trigger download
            handleDownload({ stopPropagation: () => {} });
        }
    } catch (err) {
        console.error("Purchase failed", err);
        showToast(err.message || "Purchase failed. Please check your balance.", "error", "Transaction Failed");
    }
  };

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#262626] group cursor-pointer w-full h-64 bg-white dark:bg-[#0A0A0A] transition-all duration-150"
        onClick={() => setEmbedModalOpen(true)}
      >
        {/* FREE or PAID Badge */}
        <div className="absolute top-2 right-2 z-30">
          {isFree ? (
            <span className="bg-green-500 text-white text-[10px] font-mono font-medium uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow">
              FREE
            </span>
          ) : (
            <div className="bg-yellow-400 text-black px-3 py-1 rounded-full shadow font-mono font-medium text-sm flex items-center gap-2">
              {hasDiscount && (
                <span className="line-through text-red-700 text-xs">
                  {price}
                </span>
              )}
              <span>
                  <span className="font-mono">{Number(finalPrice).toFixed(0)} {currency}</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Preview */}
        {previewFile && previewFile.endsWith(".mp4") ? (
          <video
            src={previewFile}
            className="absolute inset-0 w-full h-full object-cover transition"
            muted
            loop
            autoPlay
          />
        ) : (
          <img
            src={previewFile}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition"
          />
        )}

        {/* Overlay */}
        <div className="absolute bottom-2 left-0 right-0 z-20 px-4 flex flex-col gap-1 transition-all duration-300">
          <h3 className="text-white absolute top-4 group-hover:-translate-y-11 text-base font-medium drop-shadow-lg transition-all duration-300 font-sans">
            {truncatedTitle}
          </h3>

          {/* Description / Tags */}
          <div style={{ height: descriptionHeight }} className="relative">
            <div className="absolute top-12 flex flex-wrap h-5 gap-1 transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-3">
              {safeTags.slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="text-[9px] font-mono font-medium uppercase tracking-wider text-white bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>
            <p
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
                height: descriptionHeight,
              }}
              className="absolute w-[100%] -translate-x-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-white/90 text-sm bg-black/40 p-2 rounded-lg backdrop-blur-md mt-1 font-sans leading-relaxed"
            >
              {description}
            </p>
          </div>

          {/* Like button */}
          <div className="absolute bottom-16 -right-3 group-hover:-translate-x-5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
            <button
              onClick={handleLike}
              className="bg-transparent backdrop:blur-3xl rounded-full flex items-center gap-1 transition-all duration-150"
            >
              <Heart
                size={20}
                className={`transition-colors duration-300 stroke-white ${
                  liked
                    ? "text-pink-600 fill-pink-600 stroke-pink-600"
                    : "text-slate-600"
                }`}
              />
            </button>
          </div>

          {/* Download Icon */}
          <div
            onClick={handleDownload}
            className="absolute bottom-3 -right-3 group-hover:-translate-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <button className="bg-black/30 backdrop-blur text-black p-2 rounded-full shadow">
              <Download className="stroke-white" size={18} />
            </button>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
      </div>

      {/* Embed Modal */}
      {embedModalOpen && embedUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-4xl relative">
            <iframe
              src={embedUrl}
              className="w-full h-[500px] rounded"
              frameBorder="0"
              allowFullScreen
              onLoad={() => {
                // Track view when modal opens
                axios.post(`${process.env.NEXT_PUBLIC_API_URL}/artifact/view/${id}`)
                  .then(() => console.log('✅ View tracked for artifact:', id))
                  .catch(err => console.error('❌ View tracking failed:', err));
              }}
            ></iframe>
            <button
              onClick={() => setEmbedModalOpen(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 font-bold text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl w-[400px] border border-slate-200 dark:border-[#262626] relative">
            <h2 className="text-xl font-medium font-sans text-black dark:text-white mb-2 uppercase tracking-tight">Premium Artifact</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-normal font-sans">
              This premium resource requires a one-time token exchange.
            </p>
            
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl mb-8 border border-slate-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-widest">Price</span>
                    <span className="text-xl font-medium font-mono text-black dark:text-white tracking-tight">{finalPrice.toFixed(0)} <span className="text-xs font-sans opacity-60">{currency}</span></span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-white/10 my-3" />
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                    Purchasing will grant you lifetime access to download this artifact.
                </p>
            </div>

            <button
              onClick={handlePurchase}
              disabled={!canAfford}
              className={`w-full py-4 rounded-xl text-[11px] font-mono font-medium uppercase tracking-[0.2em] transition-all duration-150 mb-4 ${
                canAfford 
                ? "btn-primary" 
                : "bg-slate-200 dark:bg-[#171717] text-slate-400 cursor-not-allowed border border-slate-300 dark:border-[#262626]"
              }`}
            >
              {canAfford ? "Confirm Purchase" : "Insufficient Tokens"}
            </button>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full text-[10px] font-mono font-medium text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ArtifactCard;

