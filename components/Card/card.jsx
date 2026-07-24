"use client";

import React, { useState } from "react";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import axios from "axios";
import { Download, Star } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

const ArtifactCard = ({
  id,
  title = "Untitled",
  description = "No description available.",
  tags = [],
  previewFile,
  embedUrl,
  price = 0,
  discount = 0,
  likes = 0,
  isLiked = false,
  userId = null,
  fileType = "image",
  featured = "",
  currency = "TKNS",
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const { showToast } = useToast();

  const descriptionHeight = 67;
  const safeTags = Array.isArray(tags) ? tags : [];

  const isFree = !price || price === 0;
  const hasDiscount = price > 0 && discount > 0;
  const finalPrice = hasDiscount ? price - price * (discount / 100) : price;

  // ======================================================
  // LIKE HANDLER
  // ======================================================
  const handleLike = async (e) => {
    e.stopPropagation();

    const artifactId = id;
    const token = localStorage.getItem("token");
    let visitorId = localStorage.getItem("visitorId");

    if (!token && !visitorId) {
      showToast("Please login or visit the page to like.", "info", "Login Required");
      return;
    }

    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const payload = token ? {} : { visitorId };

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/artifact/${artifactId}/like`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );

      if (res.data?.liked !== undefined) {
        setLiked(res.data.liked);
      }
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  // ======================================================
  // DOWNLOAD HANDLER (FREE / PAID / PURCHASE CHECK)
  // ======================================================
  const handleDownload = async (e) => {
    e.stopPropagation();

    const artifactId = id;
    const token = localStorage.getItem("token");
    let visitorId = localStorage.getItem("visitorId");

    if (!token && !visitorId) {
      showToast("Please login or visit the page to download.", "info", "Login Required");
      return;
    }

    try {
      const payload = token ? {} : { visitorId };

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/artifact/${artifactId}/download`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );

      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response.data?.paid) {
        const data = err.response.data;

        setPaymentInfo({
          artifactId: data.artifactId,
          price: data.price,
          currency: data.currency,
        });

        setShowPurchaseModal(true);
        return;
      }

      if (err.response?.status === 401) {
        showToast("Your session expired. Please login again.", "warning", "Session Expired");
        localStorage.removeItem("token");
        return;
      }
    }
  };

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#262626] group cursor-pointer w-full h-64 bg-white dark:bg-[#0A0A0A] transition-all duration-150"
        onClick={() => setEmbedModalOpen(true)}
      >
        {/* Badge */}
        <div className="absolute top-2 right-2 z-30">
          {isFree ? (
            <span className="bg-green-500 text-white text-[11px] font-mono font-medium px-3 py-1 rounded-full shadow tracking-wider">
              FREE
            </span>
          ) : (
            <div className="bg-yellow-400 text-black px-3 py-1 rounded-full shadow font-mono font-medium text-sm flex items-center gap-2">
              {hasDiscount && (
                <span className="line-through text-red-700 text-[10px] font-mono opacity-70">
                  {price} {currency}
                </span>
              )}
              <span className="text-xs font-mono font-bold tracking-tight">{Number(finalPrice).toFixed(0)} {currency}</span>
            </div>
          )}
        </div>

        {/* Preview */}
        {previewFile && previewFile.endsWith(".mp4") ? (
          <video
            src={previewFile}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition"
            muted
            loop
            autoPlay
          />
        ) : (
          <img
            src={getOptimizedUrl(previewFile)}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition"
          />
        )}

        {/* Overlay text */}
        <div className="absolute bottom-2 left-0 right-0 z-20 px-4 flex flex-col gap-1">
          <h3 className="text-white absolute top-4 group-hover:-translate-y-11 text-base font-medium drop-shadow-lg transition-all duration-300 font-sans">
            {title.length > 30 ? title.substring(0, 30) + "..." : title}
          </h3>

          <div style={{ height: descriptionHeight }} className="relative">
            <div className="absolute top-12 flex flex-wrap h-5 gap-1 transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-3">
              {safeTags.slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="text-[10px] text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur"
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
                height: descriptionHeight,
              }}
              className="absolute w-[100%] -translate-x-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-white/90 text-sm bg-black/40 p-2 rounded-lg backdrop-blur-md mt-1 font-sans leading-relaxed"
            >
              {description}
            </p>
          </div>

          {/* Like Button */}
          <div className="absolute bottom-3 left-3 group-hover:translate-x-2 transition-all duration-300">
            <button
              onClick={handleLike}
              className="bg-white p-2 rounded-full shadow flex items-center gap-1"
            >
              <Star
                size={18}
                className={`transition-colors duration-300 ${
                  liked ? "text-pink-600 fill-pink-600" : "text-slate-600"
                }`}
              />
              <span className="text-xs font-mono font-medium">{likeCount}</span>
            </button>
          </div>

          {/* Download Button */}
          <div
            className="absolute bottom-3 -right-3 group-hover:-translate-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={handleDownload}
          >
            <button className="bg-black/30 backdrop-blur text-white p-2 rounded-full shadow border border-white/50">
              <Download className="stroke-white" size={18} />
            </button>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
      </div>

      {/* EMBED MODAL */}
      {embedModalOpen && embedUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-4xl relative">
            <iframe
              src={embedUrl}
              className="w-full h-[500px] rounded"
              frameBorder="0"
              allowFullScreen
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

      {/* PURCHASE MODAL */}
      {showPurchaseModal && paymentInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-xl w-[380px] border border-slate-200 dark:border-[#262626]">
            <h2 className="text-lg font-semibold mb-3 text-black dark:text-white">Purchase Artifact</h2>

            <p className="mb-1 text-slate-500 text-xs font-sans">
              Artifact ID: <b className="font-mono text-slate-900">{paymentInfo.artifactId}</b>
            </p>

            <p className="mb-4 text-slate-500 text-xs font-sans">
              Price:{" "}
              <b className="font-mono text-indigo-600 text-lg">
                {paymentInfo.price} {paymentInfo.currency}
              </b>
            </p>

            <button
              onClick={() => {
                // Future: Integrate with internal wallet unlock API
                showToast("This feature will use your internal TKNS balance.", "info");
                setShowPurchaseModal(false);
              }}
              className="btn-primary w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs"
            >
              Unlock with TKNS
            </button>

            <button
              onClick={() => setShowPurchaseModal(false)}
              className="mt-2 w-full text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ArtifactCard;

