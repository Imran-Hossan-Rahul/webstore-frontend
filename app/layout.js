import "./globals.css";
import { Inter, Lora } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata = {
  title: "Creative Platform",
  description: "Showcase your creativity, share templates and blogs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable}`}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

