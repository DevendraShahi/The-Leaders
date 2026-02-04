"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Start loading
        // Start loading with a slight delay to avoid synchronous state update warning
        const startTimer = setTimeout(() => {
            setIsLoading(true);
            setProgress(20);
        }, 0);

        // Simulate progress
        const timer1 = setTimeout(() => setProgress(40), 100);
        const timer2 = setTimeout(() => setProgress(60), 200);
        const timer3 = setTimeout(() => setProgress(80), 300);

        // Complete
        const completeTimer = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, 200);
        }, 500);

        return () => {
            clearTimeout(startTimer);
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(completeTimer);
        };
    }, [pathname, searchParams]);

    if (!isLoading && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
            <div
                className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 transition-all duration-300 ease-out"
                style={{
                    width: `${progress}%`,
                    boxShadow: "0 0 10px rgba(170, 0, 0, 0.5)",
                }}
            />
        </div>
    );
}
