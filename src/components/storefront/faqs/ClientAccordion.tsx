"use client";

import { useState } from "react";
import { Icon } from "@/components/storefront/ui/Icon";

export function ClientAccordion({ id, question, answer }: { id: string; question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-colors hover:bg-white/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
            >
                <span className="font-semibold text-brand-cream text-lg">{question}</span>
                <Icon
                    name="expand_more"
                    className={`text-2xl text-brand-cream/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48' : 'max-h-0'
                    }`}
            >
                <div className="p-5 pt-0 text-brand-cream/70 leading-relaxed border-t border-white/5 mx-5 mt-2">
                    {answer}
                </div>
            </div>
        </div>
    );
}
