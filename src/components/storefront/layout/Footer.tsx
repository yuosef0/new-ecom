import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function Footer() {
  const supabase = await createClient();
  const { data: socialMediaData } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "social_media")
    .single();

  const socialLinks = socialMediaData?.value as {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  } | null;

  return (
    <footer className="bg-brand-burgundy text-brand-cream px-4 sm:px-6 py-8 sm:py-10 pb-24 space-y-8 sm:space-y-10">
      {/* About DXLR Section */}
      <div id="about">
        <h3 className="text-lg sm:text-xl font-normal mb-3 uppercase tracking-wide">
          About DXLR
        </h3>
        <p className="text-xs sm:text-sm leading-relaxed text-brand-cream/80 mb-4">
          We are a clothing brand designed for tech enthusiasts and gamers who value simplicity.
          Our products blend comfort with minimalist design, offering a style that celebrates
          individuality in the digital age.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center text-xs sm:text-sm font-bold underline decoration-1 underline-offset-4 hover:text-white transition-colors"
        >
          Discover Products
          <span className="material-icons-outlined text-sm ml-1">north_east</span>
        </Link>

        {/* Social Media Icons */}
        <div className="flex space-x-3 sm:space-x-4 mt-6">
          {socialLinks?.facebook && (
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          )}

          {socialLinks?.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          )}

          {socialLinks?.tiktok && (
            <a
              href={socialLinks.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center text-white hover:opacity-80 transition-opacity"
              aria-label="TikTok"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Quick Links Section */}
      <div id="contact">
        <h3 className="text-lg sm:text-xl font-normal mb-4">Quick Links</h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-brand-cream/80">
          <li>
            <Link href="/#about" className="hover:text-white transition-colors">
              About us
            </Link>
          </li>
          <li>
            <Link href="/#contact" className="hover:text-white transition-colors">
              Contact us
            </Link>
          </li>
          <li>
            <Link href="/faqs" className="hover:text-white transition-colors">
              FAQs
            </Link>
          </li>
          <li>
            <Link href="/shipping" className="hover:text-white transition-colors">
              Shipping &amp; Delivery
            </Link>
          </li>
          <li>
            <Link href="/returns" className="hover:text-white transition-colors">
              Return &amp; Exchange
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </li>
        </ul>
      </div>

      {/* Email Subscription Section */}
      <div>
        <h3 className="text-lg sm:text-xl font-normal mb-2">
          Join For Exclusive Email Offers!
        </h3>
        <p className="text-xs sm:text-sm text-brand-cream/80 mb-4">
          Enter your email to receive the latest offers and new products.
        </p>
        <div className="bg-white rounded p-1 flex">
          <input
            type="email"
            placeholder="email@example.com"
            className="flex-grow bg-transparent border-none text-brand-charcoal text-xs sm:text-sm focus:ring-0 placeholder-gray-500 px-3 py-2"
          />
          <button className="bg-brand-primary text-white text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 rounded flex items-center hover:bg-brand-primary/90 transition-colors whitespace-nowrap">
            Subscribe
            <span className="material-icons-outlined text-sm ml-1">north_east</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
