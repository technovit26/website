import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import SmoothScrolling from "./components/SmoothScrolling";
import TrailerModal from "./components/TrailerModal";

const clashDisplay = localFont({
  src: "../public/fonts/clash.woff2",
  variable: "--font-clash-display",
  display: "swap",
  weight: "200 700",
});

const cabinetGrotesk = localFont({
  src: "../public/fonts/cabinet.woff2",
  variable: "--font-cabinet-grotesk",
  display: "swap",
  weight: "200 700",
});

export const metadata: Metadata = {
  title: "TechnoVIT'26 | VIT Chennai",
  description:
    "TechnoVIT is the annual technical festival of VIT Chennai, where innovation meets creativity. Join us for a celebration of technology, knowledge, and collaboration.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${cabinetGrotesk.variable} antialiased`}>
      <body className="flex flex-col min-h-screen">
        <SmoothScrolling>
          <TrailerModal />
          <CustomCursor />
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </SmoothScrolling>
      </body>
    </html>
  );
}
