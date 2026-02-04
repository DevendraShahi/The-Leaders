"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-center">
            <h1 className="font-bebas text-8xl font-bold text-destructive">Error</h1>
            <h2 className="font-bebas text-3xl text-foreground">Something went wrong!</h2>
            <p className="max-w-[500px] text-muted-foreground">
                We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            <div className="mt-8 flex gap-4">
                <Button onClick={() => reset()} size="lg">
                    Try again
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = "/"}>
                    Return Home
                </Button>
            </div>
        </div>
    );
}
