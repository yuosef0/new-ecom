"use client";

interface TopBarMessage {
  id: string;
  message_en: string;
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
      <p className="text-brand-charcoal font-bold text-xs sm:text-sm tracking-wider">
        {currentMessage.message_en}
      </p>
    </div>
  );
}
