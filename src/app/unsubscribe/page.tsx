"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Check, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

type UnsubscribeState = "loading" | "success" | "error" | "already-unsubscribed" | "not-found";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    
    const [state, setState] = useState<UnsubscribeState>("loading");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualEmail, setManualEmail] = useState("");

    useEffect(() => {
        if (email) {
            handleUnsubscribe(email);
        } else {
            setState("loading");
            setMessage("");
        }
    }, [email]);

    const handleUnsubscribe = async (emailToUnsubscribe: string) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailToUnsubscribe }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.message?.includes("already")) {
                    setState("already-unsubscribed");
                } else {
                    setState("success");
                }
                setMessage(data.message);
            } else {
                setState("error");
                setMessage(data.error || "Something went wrong");
            }
        } catch (error) {
            setState("error");
            setMessage("Failed to process unsubscribe request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualEmail) {
            handleUnsubscribe(manualEmail);
        }
    };

    const renderContent = () => {
        if (!email && state === "loading") {
            return (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="font-bebas text-4xl md:text-5xl tracking-wide text-primary">
                            Unsubscribe
                        </h1>
                        <p className="font-manrope text-muted-foreground">
                            Enter your email address to unsubscribe from our newsletter.
                        </p>
                    </div>

                    <form onSubmit={handleManualSubmit} className="space-y-4 max-w-md mx-auto">
                        <div>
                            <input
                                type="email"
                                placeholder="YOUR EMAIL ADDRESS"
                                value={manualEmail}
                                onChange={(e) => setManualEmail(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full bg-transparent border-b border-border py-4 pr-12 text-sm md:text-base font-medium placeholder:text-muted-foreground/40 placeholder:font-bebas placeholder:tracking-wider focus:outline-none focus:border-primary transition-all duration-300 rounded-none font-manrope"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-primary text-primary-foreground font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Unsubscribe"
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            );
        }

        if (state === "success") {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-bebas text-3xl tracking-wide text-foreground">
                        You have been unsubscribed
                    </h1>
                    <p className="font-manrope text-muted-foreground max-w-md mx-auto">
                        {message || "You will no longer receive emails from The Leaders."}
                    </p>
                    <div className="pt-4">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </motion.div>
            );
        }

        if (state === "already-unsubscribed") {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Check className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h1 className="font-bebas text-3xl tracking-wide text-foreground">
                        Already unsubscribed
                    </h1>
                    <p className="font-manrope text-muted-foreground max-w-md mx-auto">
                        {message || "This email was already unsubscribed from our newsletter."}
                    </p>
                    <div className="pt-4">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </motion.div>
            );
        }

        if (state === "error") {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="font-bebas text-3xl tracking-wide text-foreground">
                        Something went wrong
                    </h1>
                    <p className="font-manrope text-muted-foreground max-w-md mx-auto">
                        {message || "We couldn't process your unsubscribe request. Please try again."}
                    </p>
                    <div className="pt-4">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </motion.div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                {isSubmitting && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <UnsubscribeContent />
        </Suspense>
    );
}
