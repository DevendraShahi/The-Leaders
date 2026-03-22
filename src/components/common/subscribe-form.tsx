"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowRight, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import { cn } from "@/lib/utils";

type GoogleCredentialResponse = {
    credential?: string;
};

declare global {
    interface Window {
        google?: {
            accounts?: {
                id?: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: GoogleCredentialResponse) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                    }) => void;
                    renderButton: (
                        parent: HTMLElement,
                        options: {
                            theme?: "outline" | "filled_blue" | "filled_black";
                            size?: "large" | "medium" | "small";
                            text?: string;
                            shape?: "rectangular" | "pill" | "circle" | "square";
                            width?: string | number;
                            logo_alignment?: "left" | "center";
                        }
                    ) => void;
                };
            };
        };
    }
}

interface SubscribeFormProps {
    layout?: "default" | "dialog" | "footer";
    className?: string;
}

export function SubscribeForm({ layout = "default", className }: SubscribeFormProps) {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<"email" | "verify" | "google">("google");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleScriptReady, setGoogleScriptReady] = useState(false);
    const [googleButtonRendered, setGoogleButtonRendered] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement | null>(null);
    const emailInputRef = useRef<HTMLInputElement | null>(null);
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const isFooterLayout = layout === "footer";

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to subscribe");
            } else {
                setStep("verify");
                toast.success(data.message);
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !code) return;

        setLoading(true);
        try {
            const res = await fetch("/api/subscribe/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Verification failed");
                return;
            }

            setSuccess(true);
            toast.success(data.message || "Subscription completed");
            setEmail("");
            setCode("");
            setStep("email");
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setResending(true);
        try {
            const res = await fetch("/api/subscribe/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Failed to resend code");
                return;
            }
            toast.success(data.message || "Verification code resent");
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setResending(false);
        }
    };

    const handleGoogleCredential = useCallback(async (credential: string) => {
        if (!credential) return;
        setGoogleLoading(true);

        try {
            const res = await fetch("/api/subscribe/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Google sign-in failed");
                return;
            }

            setSuccess(true);
            setEmail("");
            setCode("");
            setStep("google");
            toast.success(data.message || "Subscription completed");
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            toast.error("Unable to continue with Google. Please try again.");
        } finally {
            setGoogleLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!googleScriptReady && typeof window !== "undefined" && window.google?.accounts?.id) {
            setGoogleScriptReady(true);
        }
    }, [googleScriptReady]);

    useEffect(() => {
        setGoogleButtonRendered(false);
        if (!googleClientId || !(step === "google" || step === "email")) return;
        if (!googleScriptReady) return;
        if (!googleButtonRef.current) return;
        if (!window.google?.accounts?.id) return;

        const buttonContainer = googleButtonRef.current;
        buttonContainer.innerHTML = "";

        window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response: GoogleCredentialResponse) => {
                if (!response.credential) {
                    toast.error("Google authentication was cancelled.");
                    return;
                }
                void handleGoogleCredential(response.credential);
            },
            auto_select: true,
            cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(buttonContainer, {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: "100%",
            logo_alignment: "left",
        });
        setGoogleButtonRendered(true);
    }, [googleClientId, layout, step, googleScriptReady, handleGoogleCredential]);

    return (
        <div className={cn(
            "relative w-full",
            layout === "default" ? "mt-8 max-w-md mx-auto" : layout === "dialog" ? "mt-3 max-w-none" : "mt-1 max-w-none",
            className
        )}>
            {googleClientId ? (
                <Script
                    src="https://accounts.google.com/gsi/client"
                    strategy="afterInteractive"
                    onLoad={() => setGoogleScriptReady(true)}
                />
            ) : null}
            <AnimatePresence mode="wait">
                {success ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-3 text-primary py-4 border border-primary bg-primary/5"
                    >
                        <div className="w-8 h-8 border border-primary flex items-center justify-center">
                            <Check className="w-4 h-4" />
                        </div>
                        <span className="font-bebas tracking-wide text-lg text-foreground">Successfully Subscribed</span>
                    </motion.div>
                ) : (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={step === "google" || step === "email" ? handleEmailSubmit : handleVerifySubmit}
                        className="relative group"
                    >
                        {step === "google" ? (
                            <div className="space-y-6">
                                {googleClientId ? (
                                    <div className="flex justify-center">
                                        <div ref={googleButtonRef} className="w-full max-w-[320px]" />
                                        {!googleButtonRendered ? (
                                            <button
                                                type="button"
                                                disabled
                                                className="flex h-12 w-full max-w-[320px] items-center justify-center border border-border bg-background text-sm font-medium text-foreground/80 opacity-70"
                                            >
                                                Continue with Google
                                            </button>
                                        ) : null}
                                        {googleLoading ? (
                                            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Processing Google sign-in...
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}

                                {!googleClientId || googleLoading ? null : (
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Or continue with email</span>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>
                                )}

                                {(!googleClientId || googleLoading) && (
                                    <div className="text-center text-xs text-muted-foreground mb-2">
                                        Or enter your email below
                                    </div>
                                )}

                                <div className="relative">
                                    <input
                                        ref={emailInputRef}
                                        type="email"
                                        placeholder="YOUR EMAIL ADDRESS"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="w-full bg-transparent border-b-2 border-border py-4 pr-12 text-sm md:text-base font-medium placeholder:text-muted-foreground/40 placeholder:font-bebas placeholder:tracking-wider focus:outline-none focus:border-primary transition-all duration-300 font-manrope"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 p-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <ArrowRight className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    Enter the 6-digit code sent to<br />
                                    <span className="text-foreground font-medium">{email}</span>
                                </p>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        disabled={loading}
                                        className="flex-1 bg-transparent border-b-2 border-border py-4 text-center text-lg font-mono font-medium placeholder:text-muted-foreground/40 placeholder:font-bebas placeholder:tracking-widest focus:outline-none focus:border-primary transition-all duration-300 uppercase"
                                        maxLength={6}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || code.length !== 6}
                                        className="px-6 py-4 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Verify"
                                        )}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-border text-xs">
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                                    >
                                        {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                        Resend code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep("google");
                                            setCode("");
                                        }}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        ← Change email
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
