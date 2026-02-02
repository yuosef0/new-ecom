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
    <div className="bg-brand-primary overflow-hidden py-3 sm:py-4">
      <div className="flex items-center justify-center min-w-full px-4">
        <span className="text-white font-bold text-sm sm:text-base md:text-lg tracking-wider text-center uppercase">
          {settings.text}
        </span>
      </div>
    </div>
  );
}
