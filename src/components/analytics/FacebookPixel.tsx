"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

interface FacebookPixelProps {
    pixelId: string;
    isActive: boolean;
}

export function FacebookPixel({ pixelId, isActive }: FacebookPixelProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!isActive || !pixelId) return;

        // Track page view on route change
        if (typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq("track", "PageView");
        }
    }, [pathname, searchParams, pixelId, isActive]);

    if (!isActive || !pixelId) {
        return null;
    }

    return (
        <>
            <Script
                id="facebook-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
                }}
            />
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
        </>
    );
}

// Helper functions to track events
export const trackViewContent = (productId: string, productName: string, price: number, currency: string = "EGP") => {
    if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "ViewContent", {
            content_ids: [productId],
            content_name: productName,
            content_type: "product",
            value: price,
            currency: currency,
        });
    }
};

export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number = 1, currency: string = "EGP") => {
    if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "AddToCart", {
            content_ids: [productId],
            content_name: productName,
            content_type: "product",
            value: price * quantity,
            currency: currency,
        });
    }
};

export const trackInitiateCheckout = (value: number, currency: string = "EGP") => {
    if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "InitiateCheckout", {
            value: value,
            currency: currency,
        });
    }
};

export const trackPurchase = (orderId: string, value: number, currency: string = "EGP") => {
    if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Purchase", {
            value: value,
            currency: currency,
            content_type: "product",
            order_id: orderId,
        });
    }
};
