"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const hasConsented = localStorage.getItem("cookie-consent");
        if (!hasConsented) {
            // Show after a short delay for better UX
            const timer = setTimeout(() => {
                setShowConsent(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setShowConsent(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "declined");
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9998] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-4xl mx-auto bg-background/95 backdrop-blur-lg border border-border rounded-lg shadow-2xl overflow-hidden">
                <div className="relative p-6 md:p-8">
                    {/* Close button */}
                    <button
                        onClick={handleDecline}
                        className="absolute top-4 right-4 p-2 rounded-md hover:bg-accent transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {/* Content */}
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Text section */}
                        <div className="flex-1 space-y-2 pr-8">
                            <h3 className="font-bebas text-2xl text-foreground tracking-wide">
                                Your Privacy Matters
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We use cookies to enhance your browsing experience, analyze site traffic, and provide personalized content.
                                By clicking &ldquo;Accept&rdquo;, you consent to our use of cookies.
                            </p>
                            <a
                                href="/cookie-policy"
                                className="text-sm text-primary hover:underline inline-block"
                            >
                                Learn more about our cookie policy
                            </a>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
                            <Button
                                variant="outline"
                                onClick={handleDecline}
                                className="min-w-[120px] font-medium"
                            >
                                Decline
                            </Button>
                            <Button
                                onClick={handleAccept}
                                className="min-w-[120px] font-medium bg-primary hover:bg-primary/90"
                            >
                                Accept
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom accent line */}
                <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            </div>
        </div>
    );
}
