"use client";

import { useEffect, useState } from "react";
import { PremiumLoader } from "@/components/ui/premium-loader";
import { TopProgressBar } from "@/components/ui/top-progress-bar";

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
    const [showInitialLoader, setShowInitialLoader] = useState(true);

    useEffect(() => {
        // Show initial loader for first visit only
        const hasVisited = sessionStorage.getItem("has-visited");

        if (hasVisited) {
            // Already visited in this session, don't show loader
            setShowInitialLoader(false);
        }
        // If not visited, we wait for PremiumLoader to call onComplete
    }, []);

    const handleLoaderComplete = () => {
        setShowInitialLoader(false);
        sessionStorage.setItem("has-visited", "true");
    };

    useEffect(() => {
        if (showInitialLoader) {
            document.body.classList.add("is-loading");
        } else {
            document.body.classList.remove("is-loading");
        }
        return () => document.body.classList.remove("is-loading");
    }, [showInitialLoader]);

    return (
        <>
            {showInitialLoader && <PremiumLoader onComplete={handleLoaderComplete} />}
            {!showInitialLoader && <TopProgressBar />}
            {children}
        </>
    );
}
