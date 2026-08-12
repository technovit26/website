import Header from "./components/Header";
import Marquee from "./components/Marquee";

export default function Home() {
  return (
    <>
      <Header />
      <div className="relative z-10 -mt-1 bg-[#064928] text-[#84C87F] py-3.5 sm:py-4 overflow-hidden w-full">
        <Marquee />
      </div>
    </>
  );
}
