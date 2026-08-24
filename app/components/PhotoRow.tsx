'use client';

export interface PhotoRowItem {
  seed: string;
}

export default function PhotoRow({
  items,
  reverse = false,
  speed = 80,
  tileClassName = 'w-[170px] h-[120px] sm:w-[230px] sm:h-[165px]',
  imgUrl,
  imgClassName = 'grayscale brightness-75 contrast-110',
  gapClassName = 'gap-1.5',
}: {
  items: PhotoRowItem[];
  reverse?: boolean;
  speed?: number;
  tileClassName?: string;
  imgUrl: (seed: string) => string;
  imgClassName?: string;
  gapClassName?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="relative w-full overflow-hidden" aria-hidden>
      <div
        className={`flex items-center ${gapClassName} whitespace-nowrap will-change-transform`}
        style={{ animation: `photorow-${reverse ? 'rev' : 'fwd'} ${speed}s linear infinite` }}
      >
        {doubled.map((item, i) => (
          <div key={i} className={`relative shrink-0 overflow-hidden rounded-md bg-[#03080a] isolate ${tileClassName}`}>
            <img
              src={imgUrl(item.seed)}
              alt=""
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className={`absolute inset-0 w-full h-full object-cover ${imgClassName}`}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes photorow-fwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes photorow-rev {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
