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
      <div className="animate-marquee whitespace-nowrap">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="text-white font-bold text-xs sm:text-sm tracking-wider mx-8"
          >
            {settings.text}
          </span>
        ))}
      </div>
    </div>
  );
}
