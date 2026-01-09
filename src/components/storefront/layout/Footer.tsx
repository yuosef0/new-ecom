import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-burgundy text-brand-cream px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10">
      {/* About DXLR Section */}
      <div>
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
          <a
            href="#"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-brand-muted flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Facebook"
          >
            <span className="text-xs font-bold">fb</span>
          </a>
          <a
            href="#"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-brand-muted flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Instagram"
          >
            <span className="text-xs font-bold">ig</span>
          </a>
          <a
            href="#"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-brand-muted flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="YouTube"
          >
            <span className="text-xs font-bold">yt</span>
          </a>
          <a
            href="#"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-brand-muted flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="TikTok"
          >
            <span className="text-xs font-bold">tk</span>
          </a>
        </div>
      </div>

      {/* Quick Links Section */}
      <div>
        <h3 className="text-lg sm:text-xl font-normal mb-4">Quick Links</h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-brand-cream/80">
          <li>
            <Link href="/about" className="hover:text-white transition-colors">
              About us
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-white transition-colors">
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
