"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";

const ArtifactCard = ({
  title = "Untitled",
  description = "No description available.",
  tags = [],
  previewFile,
  embedUrl,
  price = null,
  discount = 0,
}) => {
  const [embedModalOpen, setEmbedModalOpen] = useState(false);

  const truncatedTitle =
    title.length > 30 ? title.substring(0, 30) + "..." : title;

  const safeTags = Array.isArray(tags) ? tags : [];

  // Fixed height for description box
  const descriptionHeight = 67;

  // Price Calculation
  const isFree = !price || price === 0;
  const hasDiscount = price > 0 && discount > 0;
  const finalPrice = hasDiscount ? price - price * (discount / 100) : price;

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden shadow group cursor-pointer w-full h-64 bg-white transition-all duration-300"
        onClick={() => setEmbedModalOpen(true)}
      >
        {/* FREE or PAID Badge */}
        <div className="absolute top-2 right-2 z-30">
          {isFree ? (
            <span className="bg-brand-teal text-white text-[11px] font-mono font-medium px-3 py-1 rounded-full shadow tracking-wider uppercase">
              FREE
            </span>
          ) : (
            <div className="bg-yellow-400 text-black px-3 py-1 rounded-full shadow font-mono font-medium text-sm flex items-center gap-2">
              {hasDiscount && (
                <span className="line-through text-red-700 text-xs">
                  ${price}
                </span>
              )}
              <span>
                {Number(finalPrice) === 0 || isNaN(Number(finalPrice)) ? (
                  <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                    FREE
                  </span>
                ) : (
                  <span className="font-mono font-bold">${Number(finalPrice).toFixed(2)}</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Full Preview */}
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

        {/* Overlay */}
        <div className="absolute bottom-2 left-0 right-0 z-20 px-4 flex flex-col gap-1 transition-all duration-300">
          {/* Title */}
          <h3 className="text-white absolute top-4 group-hover:-translate-y-11 text-base font-medium drop-shadow-lg transition-all duration-300 font-sans">
            {truncatedTitle}
          </h3>

          {/* Description / Tags Switch */}
          <div style={{ height: descriptionHeight }} className="relative">
            {/* Tags */}
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

            {/* Description */}
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

          {/* Download Icon */}
          <div className="absolute bottom-3 -right-3 group-hover:-translate-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button className="bg-white text-black p-2 rounded-full shadow hover:bg-slate-200">
              <Download size={18} />
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
    </>
  );
};

export default ArtifactCard;

