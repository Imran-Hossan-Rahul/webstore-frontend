"use client";

export default function EmailInput({ value, onChange, error }) {
  const isFilled = value && value.length > 0; // value আছে কিনা চেক

  return (
    <div className="relative min-h-[70px]">
      <input
        type="email"
        id="email"
        name="email"
        required
        autoComplete="email"
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer email-password-input-box w-full bg-[#e0e5ec] rounded-[15px] p-5 pl-[55px] text-[#3d4468] font-medium text-base outline-none transition-all duration-300"
      />
      <label
        htmlFor="email"
        className={`absolute left-[55px] top-1/2 transform -translate-y-1/2 text-[#9499b7] font-normal text-base pointer-events-none transition-all duration-300
          ${
            !isFilled
              ? "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#9499b7]"
              : "top-3 text-sm text-[#6c7293]"
          }
          peer-focus:top-3 peer-focus:text-sm peer-focus:text-[#6c7293]`}
      >
        Email address
      </label>
      <div className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9499b7] transition-colors duration-300">
        <img src="/email-svgrepo-com.svg" alt="email icon" />
      </div>
      {error && (
        <span className="text-red-500 text-xs absolute left-5 bottom-[-18px] w-full">
          {error}
        </span>
      )}
    </div>
  );
}
