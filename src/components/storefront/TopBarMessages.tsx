"use client";

import { useState, useEffect } from "react";

interface TopBarMessage {
  id: string;
  message_ar: string;
  message_en: string | null;
  is_active: boolean;
  display_order: number;
}

interface TopBarMessagesProps {
  messages: TopBarMessage[];
}

export function TopBarMessages({ messages }: TopBarMessagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter only active messages
  const activeMessages = messages.filter((m) => m.is_active);

  useEffect(() => {
    // If there's only one message or no messages, no need to rotate
    if (activeMessages.length <= 1) return;

    // Rotate every 3 seconds
    const interval = setInterval(() => {
      setIsAnimating(true);

      // After animation starts, change the message
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activeMessages.length);
        setIsAnimating(false);
      }, 300); // Animation duration
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(interval);
  }, [activeMessages.length]);

  if (activeMessages.length === 0) {
    return (
      <div className="bg-brand-cream py-2 sm:py-3 text-center px-4">
        <p className="text-brand-charcoal font-bold text-xs sm:text-sm tracking-wider">
          FREE SHIPPING ON All Orders
        </p>
      </div>
    );
  }

  const currentMessage = activeMessages[currentIndex];

  return (
    <div className="bg-brand-cream py-2 sm:py-3 text-center px-4 overflow-hidden relative h-10 sm:h-12">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isAnimating
            ? "transform -translate-y-full opacity-0"
            : "transform translate-y-0 opacity-100"
        }`}
      >
        <p className="text-brand-charcoal font-bold text-xs sm:text-sm tracking-wider">
          {currentMessage.message_ar}
        </p>
        {currentMessage.message_en && (
          <p className="text-brand-charcoal/70 text-[10px] sm:text-xs mt-0.5">
            {currentMessage.message_en}
          </p>
        )}
      </div>
    </div>
  );
}
