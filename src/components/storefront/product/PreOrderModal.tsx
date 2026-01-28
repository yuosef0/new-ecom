"use client";

import { Icon } from "@/components/storefront/ui/Icon";

interface PreOrderModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    productName: string;
}

export function PreOrderModal({
    isOpen,
    onConfirm,
    onCancel,
    productName,
}: PreOrderModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-brand-dark border border-brand-cream/20 rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
                        <Icon name="schedule" className="text-4xl text-yellow-500" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-brand-cream mb-2">
                        Pre-order Confirmation
                    </h3>
                    <p className="text-brand-cream/70 text-sm">
                        This item is currently out of stock
                    </p>
                </div>

                {/* Product Name */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-brand-cream font-medium text-center">
                        {productName}
                    </p>
                </div>

                {/* Delivery Notice */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Icon name="info" className="text-yellow-500 text-xl mt-0.5" />
                        <div>
                            <h4 className="text-yellow-500 font-semibold mb-1">
                                Delivery Time
                            </h4>
                            <p className="text-brand-cream/80 text-sm">
                                This product will be delivered within{" "}
                                <span className="font-bold text-yellow-500">7-10 business days</span>{" "}
                                from the order date.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <p className="text-brand-cream/60 text-sm text-center">
                    Would you like to proceed with this pre-order?
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-brand-cream font-medium rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-lg transition-colors"
                    >
                        Confirm Pre-order
                    </button>
                </div>
            </div>
        </div>
    );
}
