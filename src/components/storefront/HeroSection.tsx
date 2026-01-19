import Link from "next/link";
import Image from "next/image";

interface HeroSettings {
  image_url: string;
  title: string;
  button_text: string;
  button_link: string;
}

interface HeroSectionProps {
  settings: HeroSettings;
}

export function HeroSection({ settings }: HeroSectionProps) {
  return (
    <div className="relative">
      <div className="relative w-full h-[240px] sm:h-[300px] md:h-[400px]">
        <Image
          src={settings.image_url}
          alt={settings.title || "Hero Image"}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-x-0 bottom-4 sm:bottom-6 md:bottom-8 flex justify-center px-4">
        <Link
          href={settings.button_link}
          className="bg-brand-primary text-white py-2 sm:py-2.5 md:py-3 px-6 sm:px-8 md:px-10 rounded-lg font-bold flex items-center space-x-2 shadow-lg text-sm sm:text-base hover:bg-brand-primary/90 transition-all"
        >
          <span>{settings.button_text}</span>
          <span className="material-icons-outlined" style={{ fontSize: "20px" }}>
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}
