import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Statuscope — one lens on every tool",
  description: "Pull work from Jira, Azure DevOps, Monday.com & more into one clear, audience-ready status report — with risks flagged automatically.",
  authors: [{ name: "Christina Bervin" }],
  creator: "Christina Bervin",
};

// Set the saved theme on <html> before paint to avoid a flash of the wrong theme.
const themeInit = `try{document.documentElement.setAttribute('data-theme',localStorage.getItem('statuscope:theme')||'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  );
}
