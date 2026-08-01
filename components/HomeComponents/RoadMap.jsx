"use client";
// components/StepCards.jsx
export default function RoadMap() {
  const steps = [
    "Start learning fundamentals in any field you choose.",
    "Try to create something with everything you learn.",
    "Share what you’ve created as artifacts and what you’ve learned with the world as a codex or notes.",
    "Earn from what you’ve created or shared. Collaborate and get rewarded, with a big chance to be hired!",
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-6 mt-40">
      {steps.map((text, index) => (
        <div
          key={index}
          className="relative flex-1 rounded-[26px] bg-white text-black p-6 shadow-lg hover:bg-black hover:text-white transition-colors duration-300 min-h-[130px] flex flex-col justify-center"
        >
          {/* Circle */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
            {index + 1}
          </div>

          {/* Text */}
          <p className="text-center text-sm md:text-base leading-relaxed">
            {text}
          </p>
        </div>
      ))}
    </div>
  );
}

