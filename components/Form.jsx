import { useEffect } from "react";

export default function Form() {
  useEffect(() => {
    class NeumorphismLoginForm {
      constructor() {
        this.form = document.getElementById("loginForm");
        this.emailInput = document.getElementById("email");
        this.passwordInput = document.getElementById("password");
        this.passwordToggle = document.getElementById("passwordToggle");
        this.submitButton = this.form.querySelector(".login-btn");
        this.successMessage = document.getElementById("successMessage");
        this.socialButtons = document.querySelectorAll(".neu-social");

        this.init();
      }

      init() {
        this.bindEvents();
        this.setupPasswordToggle();
        this.setupSocialButtons();
        this.setupNeumorphicEffects();
      }

      bindEvents() {
        this.form.addEventListener("submit", (e) => this.handleSubmit(e));
        this.emailInput.addEventListener("blur", () => this.validateEmail());
        this.passwordInput.addEventListener("blur", () =>
          this.validatePassword()
        );
        this.emailInput.addEventListener("input", () =>
          this.clearError("email")
        );
        this.passwordInput.addEventListener("input", () =>
          this.clearError("password")
        );
        [this.emailInput, this.passwordInput].forEach((input) => {
          input.addEventListener("focus", (e) => this.addSoftPress(e));
          input.addEventListener("blur", (e) => this.removeSoftPress(e));
        });
      }

      setupPasswordToggle() {
        this.passwordToggle.addEventListener("click", () => {
          const type =
            this.passwordInput.type === "password" ? "text" : "password";
          this.passwordInput.type = type;
          this.passwordToggle.classList.toggle(
            "show-password",
            type === "text"
          );
          this.animateSoftPress(this.passwordToggle);
        });
      }

      setupSocialButtons() {
        this.socialButtons.forEach((button) => {
          button.addEventListener("click", () => {
            this.animateSoftPress(button);
          });
        });
      }

      setupNeumorphicEffects() {
        const neuElements = document.querySelectorAll(
          ".neu-icon, .neu-checkbox, .neu-social"
        );
        neuElements.forEach((el) => {
          el.addEventListener(
            "mouseenter",
            () => (el.style.transform = "scale(1.05)")
          );
          el.addEventListener(
            "mouseleave",
            () => (el.style.transform = "scale(1)")
          );
        });

        document.addEventListener("mousemove", (e) => {
          const card = document.querySelector(".login-card");
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const shadowX = ((x - centerX) / centerX) * 30;
          const shadowY = ((y - centerY) / centerY) * 30;
          card.style.boxShadow = `
            ${shadowX}px ${shadowY}px 60px #bec3cf,
            ${-shadowX}px ${-shadowY}px 60px #ffffff
          `;
        });
      }

      addSoftPress(e) {
        const inputGroup = e.target.closest(".neu-input");
        inputGroup.style.transform = "scale(0.98)";
      }

      removeSoftPress(e) {
        const inputGroup = e.target.closest(".neu-input");
        inputGroup.style.transform = "scale(1)";
      }

      animateSoftPress(element) {
        element.style.transform = "scale(0.95)";
        setTimeout(() => (element.style.transform = "scale(1)"), 150);
      }

      validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return this.showError("email", "Email is required");
        if (!emailRegex.test(email))
          return this.showError("email", "Please enter a valid email");
        this.clearError("email");
        return true;
      }

      validatePassword() {
        const password = this.passwordInput.value;
        if (!password)
          return this.showError("password", "Password is required");
        if (password.length < 6)
          return this.showError(
            "password",
            "Password must be at least 6 characters"
          );
        this.clearError("password");
        return true;
      }

      showError(field, message) {
        const errorElement = document.getElementById(`${field}Error`);
        errorElement.textContent = message;
        errorElement.classList.add("show");
      }

      clearError(field) {
        const errorElement = document.getElementById(`${field}Error`);
        errorElement.textContent = "";
        errorElement.classList.remove("show");
      }

      async handleSubmit(e) {
        e.preventDefault();
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        if (!isEmailValid || !isPasswordValid)
          return this.animateSoftPress(this.submitButton);
        this.setLoading(true);
        await new Promise((res) => setTimeout(res, 2000));
        this.showNeumorphicSuccess();
        this.setLoading(false);
      }

      setLoading(loading) {
        this.submitButton.disabled = loading;
        this.submitButton.classList.toggle("loading", loading);
      }

      showNeumorphicSuccess() {
        this.form.style.display = "none";
        this.successMessage.classList.add("show");
      }
    }

    new NeumorphismLoginForm();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e0e5ec] p-5">
      <div className="login-container w-full max-w-[420px]">
        <div className="login-card bg-[#e0e5ec] rounded-3xl p-12 shadow-[20px_20px_60px_#bec3cf,-20px_-20px_60px_#ffffff] transition-all duration-300">
          <div className="login-header text-center mb-10">
            <div className="neu-icon w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] bg-[#e0e5ec]">
              <div className="icon-inner w-10 h-10 flex items-center justify-center text-[#6c7293]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <h2 className="text-[#3d4468] text-2xl font-semibold mb-2">
              Welcome back
            </h2>
            <p className="text-[#9499b7] text-sm">Please sign in to continue</p>
          </div>

          <form id="loginForm" className="login-form" noValidate>
            {/* Email Input */}
            <div className="form-group mb-7 relative">
              <div className="neu-input relative bg-[#e0e5ec] rounded-xl shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff]">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder=" "
                  className="w-full bg-transparent border-none p-5 pl-14 text-[#3d4468] text-base font-medium outline-none"
                />
                <label
                  htmlFor="email"
                  className="absolute left-14 top-1/2 transform -translate-y-1/2 text-[#9499b7] text-base font-normal pointer-events-none transition-all"
                >
                  Email address
                </label>
                <div className="input-icon absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9499b7]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              </div>
              <span
                className="error-message text-red-500 text-xs mt-2 ml-5 opacity-0 transition-all"
                id="emailError"
              ></span>
            </div>

            {/* Password Input */}
            {/* Similar structure as email input, including toggle button */}
            {/* Social login, buttons, and success message also follow the same pattern */}
          </form>
        </div>
      </div>
    </div>
  );
}
