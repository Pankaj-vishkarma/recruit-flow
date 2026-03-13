import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Recruit Flow",
  description: "Autonomous HR System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className="
        min-h-screen
        bg-gradient-to-b
        from-[#f8fafc]
        via-[#f1f5f9]
        to-[#eef2ff]
        text-gray-800
        antialiased
      "
      >
        {children}
      </body>
    </html>
  );
}