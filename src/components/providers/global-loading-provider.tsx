"use client";

import { useEffect, useState } from "react";
import { PremiumLoader } from "@/components/ui/premium-loader";
import { TopProgressBar } from "@/components/ui/top-progress-bar";

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
    const [showInitialLoader, setShowInitialLoader] = useState(true);

    useEffect(() => {
        // Check session storage on mount to handle localized state correctly
        const hasVisited = sessionStorage.getItem("has-visited");
        if (hasVisited) {
            setShowInitialLoader(false);
        }
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
