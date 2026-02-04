"use client";

import { PremiumLoader } from "@/components/ui/premium-loader";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LoaderDemo() {
    const [showLoader, setShowLoader] = useState(true);

    if (showLoader) {
        return <PremiumLoader />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-6">
                <h1 className="text-4xl font-bebas text-foreground">
                    Premium Loader Demo
                </h1>
                <Button onClick={() => setShowLoader(true)} size="lg">
                    Show Loader Again
                </Button>
                <p className="text-muted-foreground max-w-md">
                    The loader features GSAP-powered animations with breathing effects,
                    ambient lines, glow pulses, and follows the project's premium design aesthetic.
                </p>
            </div>
        </div>
    );
}
