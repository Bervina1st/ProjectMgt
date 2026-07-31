import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Status Report Studio — PM Status Autopilot",
  description: "Turn your project's work items into a clear, audience-ready status report in minutes.",
  authors: [{ name: "Christina Bervin" }],
  creator: "Christina Bervin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
