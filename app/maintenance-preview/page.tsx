import Link from 'next/link';

export const metadata = {
  title: 'Preview · Maintenance Screens',
};

export default function MaintenancePreviewIndex() {
  return (
    <main className="min-h-[60dvh] flex flex-col items-center justify-center gap-6 bg-[#064928] px-6 text-center">
      <h1 className="font-clash font-bold uppercase tracking-tight text-[#c2e0a5] text-4xl sm:text-5xl">
        Maintenance previews
      </h1>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/maintenance-preview/sitewide"
          className="border border-[#84C87F]/40 px-6 py-3 font-bold uppercase tracking-widest text-[#84C87F] text-xs
            hover:bg-[#84C87F] hover:text-[#064928] transition-colors"
        >
          Sitewide maintenance →
        </Link>
        <Link
          href="/maintenance-preview/single"
          className="border border-[#84C87F]/40 px-6 py-3 font-bold uppercase tracking-widest text-[#84C87F] text-xs
            hover:bg-[#84C87F] hover:text-[#064928] transition-colors"
        >
          Single page maintenance →
        </Link>
      </div>
    </main>
  );
}
