import { Geist } from "next/font/google";
import { ClientProviders } from "@/components/layout";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Healthcare Platform",
  description: "A platform for healthcare professionals and patients",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.className}`} suppressHydrationWarning>
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
