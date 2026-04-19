"use client";

import React, { useState } from "react";
import { Heart, Download } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/ToastProvider";

const TemplateCard = ({
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
  currency = "USD",
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const { showToast } = useToast();

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
    const templateId = id;
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
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/template/${templateId}/like`,
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
      if (err.response?.status === 401) {
        showToast("Your session expired. Please login again.", "warning", "Session Expired");
        localStorage.removeItem("token");
      }
    }
  };

  // =======================
  // DOWNLOAD HANDLER
  // =======================
const handleDownload = async (e) => {
  e.stopPropagation();

  const templateId = id;
  const token = localStorage.getItem("token");
  let visitorId = localStorage.getItem("visitorId");

  if (!token && !visitorId) {
    showToast("Please login or visit the page to download.", "info", "Login Required");
    return;
  }

  try {
    const payload = token ? {} : { visitorId };
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/template/${templateId}/download`,
      payload,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      }
    );

    if (res.data?.url) {
      window.location.href = res.data.url; // free download
      return;
    }
  } catch (err) {
    const data = err?.response?.data;
    const status = err?.response?.status;

    console.log("❌ Download error:", data);

    if (status === 403 && data?.paid === true) {
      // 🔹 redirect to payment page
      const paymentUrl = `/payment?templateId=${data.templateId}&amount=${data.price}&currency=${data.currency}`;
      window.location.href = paymentUrl;
      return;
    }

    if (status === 401) {
      showToast("Your session expired. Please login again.", "warning", "Session Expired");
      localStorage.removeItem("token");
      return;
    }
  }
};


  // =======================
  // Payment Complete Handler
  // =======================
  const handlePaymentComplete = async () => {
    const token = localStorage.getItem("token");
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/template/${id}/confirm-purchase`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setShowPaymentModal(false);
    showToast("Payment successful! You can now download the template.", "success", "Payment Complete 🎉");
  };

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden shadow group cursor-pointer w-full h-64 bg-white transition-all duration-300"
        onClick={() => setEmbedModalOpen(true)}
      >
        {/* FREE or PAID Badge */}
        <div className="absolute top-2 right-2 z-30">
          {isFree ? (
            <span className="bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
              FREE
            </span>
          ) : (
            <div className="bg-yellow-400 text-black px-3 py-1 rounded-full shadow font-semibold text-sm flex items-center gap-2">
              {hasDiscount && (
                <span className="line-through text-red-700 text-xs">
                  ${price}
                </span>
              )}
              <span>
                {Number(finalPrice) === 0 || isNaN(Number(finalPrice)) ? (
                  <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-semibold">
                    FREE
                  </span>
                ) : (
                  `$${Number(finalPrice).toFixed(2)}`
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
          <h3 className="text-white absolute top-4 group-hover:-translate-y-11 text-lg font-semibold drop-shadow-lg transition-all duration-300">
            {truncatedTitle}
          </h3>

          {/* Description / Tags */}
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
                wordBreak: "break-word",
                height: descriptionHeight,
              }}
              className="absolute w-[100%] -translate-x-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-white text-sm bg-black/30 p-1 rounded backdrop-blur mt-1"
            >
              {description}
            </p>
          </div>

          {/* Like button */}
          <div className="absolute bottom-16 -right-3 group-hover:-translate-x-5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
            <button
              onClick={handleLike}
              className={`bg-transparent backdrop:blur-3xl rounded-full flex items-center gap-1 transform transition-transform duration-200 ${
                animating ? "scale-125" : "scale-100"
              }`}
            >
              <Heart
                size={20}
                className={`transition-colors duration-300 stroke-white ${
                  liked
                    ? "text-pink-600 fill-pink-600 stroke-pink-600"
                    : "text-gray-600"
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
                axios.post(`${process.env.NEXT_PUBLIC_API_URL}/template/view/${id}`)
                  .then(() => console.log('✅ View tracked for template:', id))
                  .catch(err => console.error('❌ View tracking failed:', err));
              }}
            ></iframe>
            <button
              onClick={() => setEmbedModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[380px] shadow relative">
            <h2 className="text-lg font-semibold mb-3">Purchase Template</h2>
            <p className="mb-4 text-gray-700">
              You need to purchase this template before downloading.
            </p>
            <button
              onClick={() => (window.location.href = paymentUrl)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Proceed to Payment
            </button>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="mt-2 w-full text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateCard;
