import "./globals.css";

export const metadata = {
  title: "Recruit Flow",
  description: "Autonomous HR System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#f5f7fb",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}