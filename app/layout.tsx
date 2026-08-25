import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import SmoothScrolling from "./components/SmoothScrolling";
import TrailerModal from "./components/TrailerModal";
import LoginDialog from "./components/LoginDialog";
import TeamDialog from "./components/TeamDialog";
import ContextMenu from "./components/ContextMenu";
import SoundManager from "./components/SoundManager";
import Terminal from "./components/Terminal";
import Konami from "./components/Konami";
import QuestionMark from "./components/QuestionMark";
import BottomNavCluster from "./components/BottomNavCluster";
import EggMaster from "./components/EggMaster";
import ConsoleEgg from "./components/ConsoleEgg";
import SiteMaintenance from "./components/SiteMaintenance";
import { SITE_MAINTENANCE_MODE } from "./maintenance";

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

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TechnoVIT'26 | VIT Chennai",
  description:
    "TechnoVIT is the annual technical festival of VIT Chennai, where innovation meets creativity. Join us for a celebration of technology, knowledge, and collaboration.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${cabinetGrotesk.variable} ${ibmPlexMono.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://technovit.cdn.a2ys.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://technovit.cdn.a2ys.dev" />
        <link rel="preload" as="image" href="/bg.svg" />
        <script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "f02c938088bc4e53841f29ebcd62b663"}'></script>
      </head>
      <body className="flex flex-col min-h-screen">
        {SITE_MAINTENANCE_MODE ? (
          <SiteMaintenance />
        ) : (
          <SmoothScrolling>
            <TrailerModal />
            <LoginDialog />
            <TeamDialog />
            <CustomCursor />
            <ContextMenu />
            <SoundManager />
            <Terminal />
            <Konami />
            <QuestionMark />
            <BottomNavCluster />
            <EggMaster />
            <ConsoleEgg />
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </SmoothScrolling>
        )}
      </body>
    </html>
  );
}
