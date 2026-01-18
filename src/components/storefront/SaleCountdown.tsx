"use client";

import { useState, useEffect } from "react";

interface SaleCountdownProps {
  endDate: string;
  title: string;
}

export function SaleCountdown({ endDate, title }: SaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return null;
  }

  return (
    <div className="bg-brand-burgundy text-brand-cream py-4 sm:py-6 px-4 sm:px-6 md:px-8">
      <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-wider text-center mb-3 sm:mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-md mx-auto">
        <div className="border border-brand-muted rounded-lg p-2 sm:p-3 md:p-4">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold">
            {timeLeft.days}
          </p>
          <p className="text-xs sm:text-sm mt-1">Days</p>
        </div>
        <div className="border border-brand-muted rounded-lg p-2 sm:p-3 md:p-4">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold">
            {timeLeft.hours}
          </p>
          <p className="text-xs sm:text-sm mt-1">Hours</p>
        </div>
        <div className="border border-brand-muted rounded-lg p-2 sm:p-3 md:p-4">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold">
            {timeLeft.minutes}
          </p>
          <p className="text-xs sm:text-sm mt-1">Mins</p>
        </div>
        <div className="border border-brand-muted rounded-lg p-2 sm:p-3 md:p-4">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold">
            {timeLeft.seconds}
          </p>
          <p className="text-xs sm:text-sm mt-1">Secs</p>
        </div>
      </div>
    </div>
  );
}
