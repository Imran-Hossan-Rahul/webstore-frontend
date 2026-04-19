"use client";

import React, { useState } from "react";
import axios from "axios";
import { Heart, Download } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

const TemplateCard = ({
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
  currency = "USD",
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
    }
  };

  // ======================================================
  // DOWNLOAD HANDLER (FREE / PAID / PURCHASE CHECK)
  // ======================================================
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
        window.location.href = res.data.url;
        return;
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response.data?.paid) {
        const data = err.response.data;

        setPaymentInfo({
          templateId: data.templateId,
          price: data.price,
          currency: data.currency,
        });

        setShowPaymentModal(true);
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
        className="relative rounded-xl overflow-hidden shadow group cursor-pointer w-full h-64 bg-white transition-all duration-300"
        onClick={() => setEmbedModalOpen(true)}
      >
        {/* Badge */}
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
              <span>${Number(finalPrice).toFixed(2)}</span>
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
            src={previewFile}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition"
          />
        )}

        {/* Overlay text */}
        <div className="absolute bottom-2 left-0 right-0 z-20 px-4 flex flex-col gap-1">
          <h3 className="text-white absolute top-4 group-hover:-translate-y-11 text-lg font-semibold drop-shadow-lg transition-all duration-300">
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
              className="absolute w-[100%] -translate-x-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-white text-sm bg-black/30 p-1 rounded backdrop-blur mt-1"
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
              <Heart
                size={20}
                className={`transition-colors duration-300 ${
                  liked ? "text-pink-600 fill-pink-600" : "text-gray-600"
                }`}
              />
              <span className="text-sm">{likeCount}</span>
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
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && paymentInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[380px] shadow">
            <h2 className="text-lg font-semibold mb-3">Purchase Template</h2>

            <p className="mb-1 text-gray-700">
              Template ID: <b>{paymentInfo.templateId}</b>
            </p>

            <p className="mb-4 text-gray-700">
              Price:{" "}
              <b>
                {paymentInfo.price} {paymentInfo.currency}
              </b>
            </p>

            <button
              onClick={() => {
                window.location.href = `/payment?templateId=${paymentInfo.templateId}&amount=${paymentInfo.price}&currency=${paymentInfo.currency}`;
              }}
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
