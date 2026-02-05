"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SubscribeForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
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
                setSuccess(true);
                toast.success(data.message);
                setEmail("");

                // Reset success state after 3 seconds
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative mt-8 max-w-md">
            <AnimatePresence mode="wait">
                {success ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 text-primary py-2"
                    >
                        <div className="w-8 h-8 rounded-full border border-primary flex items-center justify-center">
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
                        onSubmit={handleSubmit}
                        className="relative group"
                    >
                        <input
                            type="email"
                            placeholder="YOUR EMAIL ADDRESS"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="w-full bg-transparent border-b border-border py-4 pr-12 text-sm md:text-base font-medium placeholder:text-muted-foreground/40 placeholder:font-bebas placeholder:tracking-wider focus:outline-none focus:border-primary transition-all duration-300 rounded-none font-manrope"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-0 bottom-4 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            )}
                        </button>

                        {/* Interactive focus line */}
                        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 group-focus-within:w-full" />
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}

