import React from "react";

/**
 * A highly customizable premium solid-color pulsing skeleton component
 * supporting both single nodes and complex composite presets (card, list, line, circle).
 * Grounded in the Refined Minimalism styling of the platform (8px borders, subtle static pulse).
 */
export default function Skeleton({
  variant = "rect",
  className = "",
  width,
  height,
  count = 1,
  style = {},
}) {
  // Static professional solid backgrounds with a gentle animate-pulse opacity shift
  const baseClasses = "animate-pulse bg-slate-200 /50  rounded-[4px]";

  // Compute inline styles if width or height is explicitly passed
  const customStyle = {
    ...style,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  // 1. Line Variant
  if (variant === "line") {
    return (
      <div className="flex flex-col gap-2.5 w-full">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} h-3.5 w-full rounded-[4px] ${className}`}
            style={customStyle}
          />
        ))}
      </div>
    );
  }

  // 2. Circle Variant
  if (variant === "circle") {
    return (
      <div
        className={`${baseClasses} rounded-full ${className}`}
        style={{
          width: width || "40px",
          height: height || "40px",
          ...style,
        }}
      />
    );
  }

  // 3. Card Variant (Composite skeleton for typical template/artifact grid items)
  if (variant === "card") {
    return (
      <div className={`p-4 border border-brand-navy/[0.08]/40  rounded-[8px] bg-brand-cloud/10  w-full flex flex-col gap-4 ${className}`}>
        {/* Media Block / Image Container */}
        <div className={`${baseClasses} w-full h-40 rounded-[6px]`} />
        
        {/* Header Block (Avatar + Title) */}
        <div className="flex items-center gap-3">
          <div className={`${baseClasses} w-9 h-9 rounded-full`} />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className={`${baseClasses} h-4 w-3/4 rounded-[4px]`} />
            <div className={`${baseClasses} h-3 w-1/2 rounded-[4px]`} />
          </div>
        </div>

        {/* Description / Content Lines */}
        <div className="flex flex-col gap-2">
          <div className={`${baseClasses} h-3 w-full rounded-[4px]`} />
          <div className={`${baseClasses} h-3 w-5/6 rounded-[4px]`} />
        </div>

        {/* Footer / Badge Action Row */}
        <div className="flex items-center justify-between border-t border-slate-100   pt-3">
          <div className={`${baseClasses} h-6 w-16 rounded-[4px]`} />
          <div className={`${baseClasses} h-6 w-20 rounded-[4px]`} />
        </div>
      </div>
    );
  }

  // 4. List Variant (Composite skeleton for listings/recent items)
  if (variant === "list") {
    return (
      <div className="flex flex-col gap-3 w-full">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`p-3 border border-slate-100   rounded-[8px] bg-brand-cloud/5  flex items-center gap-4 w-full ${className}`}
          >
            {/* Left circular node */}
            <div className={`${baseClasses} w-10 h-10 rounded-full shrink-0`} />
            
            {/* Center text blocks */}
            <div className="flex-1 flex flex-col gap-2">
              <div className={`${baseClasses} h-3.5 w-1/3 rounded-[4px]`} />
              <div className={`${baseClasses} h-3 w-2/3 rounded-[4px]`} />
            </div>

            {/* Right side stats/actions indicator */}
            <div className={`${baseClasses} h-5 w-14 rounded-[4px] shrink-0`} />
          </div>
        ))}
      </div>
    );
  }

  // 5. Default Rectangular block
  return (
    <div
      className={`${baseClasses} rounded-[6px] ${className}`}
      style={{
        width: width || "100%",
        height: height || "16px",
        ...customStyle,
      }}
    />
  );
}

