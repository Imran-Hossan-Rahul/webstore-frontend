"use client";

export default function TemplateCard({
  title,
  description,
  tags,
  price,
  rating,
  previewFile, // main template image
  profilePic, // profile image
}) {
  const truncateTitle = (text) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > 15 ? words.slice(0, 15).join(" ") + "..." : text;
  };

  return (
    <div className="card-template w-[350px] h-[380px] mr-6 mt-4 mb-6 hover:scale-[1.05] transition-all duration-300 relative rounded-3xl overflow-hidden">
      {/* Image Section */}
      <div className="relative w-full h-[250px] overflow-hidden rounded-2xl">
        {previewFile ? (
          <img
            src={previewFile}
            alt={title || "Preview"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Preview
          </div>
        )}

        {/* Star + Rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-md">
          {/* later replace with your SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="yellow"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="orange"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
          <span className="text-xs text-black font-semibold">{rating}</span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-2 left-2 right-2 text-white font-semibold text-sm bg-black/50 px-2 py-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300">
          {truncateTitle(title) || "Futurestic Button"}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex justify-between items-center mt-4 px-2">
        {/* Profile Pic + Tags */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>

          {/* Tags */}
          <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded-full">
            {tags || "Tag"}
          </span>
        </div>

        {/* Price always visible */}
        <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full shadow">
          ${price}
        </div>
      </div>

      {/* Description */}
      <div className="mt-2 px-2 text-gray-700 text-xs line-clamp-3">
        {description ||
          "This is fantastic button created by Imran. Nextjs, Tailwind Css and more.."}
      </div>
    </div>
  );
}
