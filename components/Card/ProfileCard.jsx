// Card/ProfileCard.jsx
"use client";

export default function ProfileCard({
  profilePic,
  name,
  status = "offline", // online / offline
  solo = true,
  skills = ["#React", "#Next.js", "#Software Development"],
}) {
  return (
    <div className="w-48 rounded-2xl p-4 flex flex-col items-center relative">
      {/* Profile Picture */}
      <div className="relative">
        <img
          src={profilePic}
          alt={name}
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
        />
        {/* Status Circle */}
        <span
          className={`absolute bottom-1 right-3 w-4 h-4 rounded-full border-2 border-white ${
            status === "online" ? "bg-green-500" : "bg-yellow-400"
          }`}
        ></span>
      </div>

      {/* Name + Working Type */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className="text-lg font-semibold text-gray-800 cursor-pointer hover:underline"
          onClick={(e) => e.preventDefault()} // prevent default, placeholder
        >
          {name}
        </span>
        <span
          className="text-xs px-2 py-0.5 bg-gray-500 text-gray-300 rounded cursor-pointer hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          {solo ? "Solo" : "Team"}
        </span>
      </div>

      {/* Skills / Hashtags */}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-300"
            onClick={(e) => e.preventDefault()} // placeholder click
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
