/**
 * Feed / Home loading skeleton.
 * Renders immediately when navigating to the home feed.
 * Mirrors the card layout to prevent layout shift.
 */
export default function FeedLoading() {
  return (
    <div className="w-full">
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk {
          background-color: rgb(241 245 249);
          background-image: linear-gradient(
            90deg,
            transparent 0%,
            rgba(0,0,0,0.04) 40%,
            rgba(0,0,0,0.07) 50%,
            rgba(0,0,0,0.04) 60%,
            transparent 100%
          );
          background-size: 600px 100%;
          animation: shimmer 1.6s infinite linear;
        }
        .dark .sk {
          background-color: rgba(255,255,255,0.04);
          background-image: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.03) 40%,
            rgba(255,255,255,0.06) 50%,
            rgba(255,255,255,0.03) 60%,
            transparent 100%
          );
          background-size: 600px 100%;
        }
      `}</style>

      {/* Render 4 skeleton cards */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="border-b border-slate-100 dark:border-white/5 p-4 sm:p-5"
        >
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full sk flex-shrink-0" />

            <div className="flex-1 min-w-0">
              {/* Author row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-3 w-28 sk rounded-full" />
                <div className="h-3 w-12 sk rounded-full" />
                <div className="h-3 w-16 sk rounded-full" />
              </div>

              {/* Title */}
              <div className="space-y-2.5 mb-3">
                <div className="h-6 w-full sk rounded-lg" />
                <div className="h-6 w-3/4 sk rounded-lg" />
              </div>

              {/* Excerpt */}
              <div className="space-y-2 mb-4">
                <div className="h-3.5 w-full sk rounded-full" />
                <div className="h-3.5 w-5/6 sk rounded-full" />
                <div className="h-3.5 w-4/5 sk rounded-full" />
              </div>

              {/* Cover image — only on every 2nd card */}
              {i % 2 === 0 && (
                <div className="w-full aspect-[2/1] sk rounded-xl mb-4" />
              )}

              {/* Action bar */}
              <div className="flex items-center gap-5 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                {[44, 52, 40, 36, 44, 40].map((w, j) => (
                  <div
                    key={j}
                    className="h-5 sk rounded-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
