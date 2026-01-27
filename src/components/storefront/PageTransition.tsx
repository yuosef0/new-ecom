"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTransition() {
    const pathname = usePathname();
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        // Trigger transition animation
        setIsTransitioning(true);

        const timer = setTimeout(() => {
            setIsTransitioning(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [pathname]);

    if (!isTransitioning) return null;

    return (
        <div className="fixed inset-0 bg-brand-burgundy/20 backdrop-blur-[2px] z-50 pointer-events-none animate-fade-out">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 border-4 border-brand-cream/30 border-t-brand-cream rounded-full animate-spin"></div>
            </div>
        </div>
    );
}
