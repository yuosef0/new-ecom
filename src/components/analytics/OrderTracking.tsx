"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/components/analytics/FacebookPixel";

interface OrderTrackingProps {
    orderId: string;
    total: number;
}

export function OrderTracking({ orderId, total }: OrderTrackingProps) {
    useEffect(() => {
        // Track Purchase event when order confirmation page loads
        trackPurchase(orderId, total, "EGP");
    }, [orderId, total]);

    return null;
}
