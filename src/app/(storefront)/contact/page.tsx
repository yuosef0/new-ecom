"use client";

import { Icon } from "@/components/storefront/ui/Icon";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
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

    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-brand-cream mb-4">Get in Touch</h1>
                        <p className="text-brand-cream/70 text-lg">
                            Have questions about your order or need style advice? We're here to help.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 bg-brand-primary/20 text-brand-primary rounded-lg flex items-center justify-center shrink-0">
                                <Icon name="email" className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-brand-cream">Email Us</h3>
                                <p className="text-brand-cream/60 text-sm mb-1">
                                    We'll respond within 24 hours
                                </p>
                                <a href="mailto:support@dxlr.com" className="text-brand-primary hover:underline">
                                    support@dxlr.com
                                </a>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center shrink-0">
                                <Icon name="phone" className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-brand-cream">Call Us</h3>
                                <p className="text-brand-cream/60 text-sm mb-1">
                                    Sat-Thu from 10am to 10pm
                                </p>
                                <a href="tel:+201000000000" className="text-brand-primary hover:underline">
                                    +20 100 000 0000
                                </a>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center shrink-0">
                                <Icon name="location_on" className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-brand-cream">Visit Us</h3>
                                <p className="text-brand-cream/60 text-sm">
                                    123 Fashion Avenue<br />
                                    Cairo, Egypt
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-brand-cream mb-6">Send us a Message</h2>

                    {submitted ? (
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
                    ) : (
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
                    )}
                </div>
            </div>

            {/* Back Link */}
            <div className="text-center pt-12">
                <Link href="/support" className="inline-flex items-center gap-2 text-brand-cream/60 hover:text-brand-cream transition-colors">
                    <Icon name="arrow_back" className="text-lg" />
                    Back to Support
                </Link>
            </div>
        </div>
    );
}
