"use client";

interface MarqueeSettings {
  text: string;
  is_active: boolean;
}

interface MarqueeBannerProps {
  settings: MarqueeSettings;
}

export function MarqueeBanner({ settings }: MarqueeBannerProps) {
  if (!settings.is_active) {
    return null;
  }

  return (
    <div className="bg-brand-primary overflow-hidden py-2 sm:py-3">
      <div className="animate-marquee whitespace-nowrap !flex items-center min-w-full">
        {/* First Set */}
        <div className="flex shrink-0 items-center justify-around">
          {[...Array(10)].map((_, i) => (
            <span
              key={`set1-${i}`}
              className="text-white font-bold text-xs sm:text-sm tracking-wider mx-8"
            >
              {settings.text}
            </span>
          ))}
        </div>
        {/* Second Set (Duplicate) */}
        <div className="flex shrink-0 items-center justify-around">
          {[...Array(10)].map((_, i) => (
            <span
              key={`set2-${i}`}
              className="text-white font-bold text-xs sm:text-sm tracking-wider mx-8"
            >
              {settings.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
