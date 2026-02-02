"use client";

import { useState } from "react";
import { Icon } from "@/components/storefront/ui/Icon";

export function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate submission
        setTimeout(() => {
            setSubmitted(true);
            setFormData({ name: "", email: "", subject: "", message: "" });
        }, 1000);
    };

    if (submitted) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="check" className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-brand-cream mb-2">Message Sent!</h3>
                <p className="text-brand-cream/70">
                    Thank you for contacting us. We will get back to you shortly.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-brand-primary hover:underline font-medium"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-brand-cream/80">
                        Your Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        required
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-brand-cream focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-brand-cream/80">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        required
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-brand-cream focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-brand-cream/80">
                    Subject
                </label>
                <select
                    id="subject"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-brand-cream focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors appearance-none"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                    <option value="" className="bg-brand-dark">Select a topic</option>
                    <option value="order" className="bg-brand-dark">Order Status</option>
                    <option value="return" className="bg-brand-dark">Returns & Exchange</option>
                    <option value="product" className="bg-brand-dark">Product Inquiry</option>
                    <option value="other" className="bg-brand-dark">Other</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-brand-cream/80">
                    Message
                </label>
                <textarea
                    id="message"
                    required
                    rows={5}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-brand-cream focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors resize-none"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
            </div>

            <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <Icon name="send" className="text-xl" />
                <span>Send Message</span>
            </button>
        </form>
    );
}
