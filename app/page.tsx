import Header from "./components/Header";
import Marquee from "./components/Marquee";
import HomepageContent from "./components/HomepageContent";
import UnderMaintenance from "./components/UnderMaintenance";
import { HOMEPAGE_MAINTENANCE } from "./maintenance";

export default function Home() {
  if (HOMEPAGE_MAINTENANCE) return <UnderMaintenance title="technoVIT'26" />;

  return (
    <>
      <div className="sticky top-0 z-0">
        <Header />
      </div>

      <div
        className="relative z-10 w-full pointer-events-none select-none shrink-0 -mt-10 sm:-mt-16 md:-mt-22 lg:-mt-28"
      >
        <img src="/bg.svg" alt="Background landscape" fetchPriority="high" className="w-full h-auto block" />
      </div>

      <div className="relative z-20 -mt-1 bg-[#064928] text-[#84C87F] py-3.5 sm:py-4 overflow-hidden w-full">
        <Marquee />
      </div>
      <HomepageContent />
    </>
  );
}
