import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZeroDay Arena",
  description: "Enter the arena. Break the logic. Capture the flag.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="cyber-grid scanlines antialiased min-h-screen text-arena-neon">
        <div className="relative min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
