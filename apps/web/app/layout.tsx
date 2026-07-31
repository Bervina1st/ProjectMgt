import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Statuscope — one lens on every tool",
  description: "Pull work from Jira, Azure DevOps, Monday.com & more into one clear, audience-ready status report — with risks flagged automatically.",
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
