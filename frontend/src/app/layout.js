import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Recruit Flow",
  description: "Autonomous HR System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ padding: "20px" }}>{children}</main>
      </body>
    </html>
  );
}