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
  // Filter only active messages
  const activeMessages = messages.filter((m) => m.is_active);

  if (activeMessages.length === 0) {
    return null;
  }

  const currentMessage = activeMessages[0];

  return (
    <div className="bg-brand-cream py-2 sm:py-3 text-center px-4 overflow-hidden relative min-h-[40px] sm:min-h-[48px] flex flex-col justify-center items-center">
      <div>
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
