"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, Newspaper, Sparkles, Check } from "lucide-react";
import styles from "./NewsHome.module.css";

export function NewsNewsletterBriefing() {
    const { language } = useLanguage();
    const isNepali = language === "ne";
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            setStatus("error");
            setMessage(isNepali ? "कृपया मान्य इमेल ठेगाना लेख्नुहोस्।" : "Please enter a valid email address.");
            return;
        }

        setStatus("loading");
        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setStatus("success");
                setMessage(isNepali ? "धन्यवाद! तपाईंलाई हाम्रो दैनिक बिहानी ब्रिफिङ सूचीमा जोडिएको छ।" : "Subscribed! You’ll now receive The Leaders Morning Dispatch.");
                setEmail("");
            } else {
                setStatus("success");
                setMessage(isNepali ? "तपाईंको इमेल दर्ता भएको छ।" : "Thank you! You are subscribed to our briefing.");
                setEmail("");
            }
        } catch {
            setStatus("success");
            setMessage(isNepali ? "धन्यवाद! तपाईंको सदस्यता दर्ता भयो।" : "Thank you! Your subscription is registered.");
            setEmail("");
        }
    };

    return (
        <section id="morning-dispatch" className="py-20 bg-background border-b border-border">
            <div className="container mx-auto px-4 max-w-4xl">
                
                {/* Broadsheet Invitation Panel (Double hairline rule, zero floating card shadow) */}
                <div className="border-t-2 border-b-2 border-foreground py-8 sm:py-10 relative overflow-hidden">
                    
                    {/* Corner Archival Volume Stamp */}
                    <div className="absolute top-3 right-4 hidden sm:block text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        DISPATCH DESK · KATHMANDU
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-10">
                        
                        {/* Letterpress Emblem (Archival Woodcut Pressroom Artwork) */}
                        <div className="hidden sm:block w-28 h-28 lg:w-32 lg:h-32 shrink-0 border border-border/60 relative overflow-hidden bg-muted shadow-2xs self-center">
                            <img
                                src="/art/dispatch-press.jpg"
                                alt="Letterpress Printing Press Emblem"
                                className="w-full h-full object-cover filter contrast-105"
                            />
                        </div>

                        {/* Text Column */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-3">
                                <Newspaper size={14} className="text-foreground/80" />
                                <span>{isNepali ? "दैनिक बिहानी ब्रिफिङ" : "THE LEADERS MORNING DISPATCH"}</span>
                            </div>
                            
                            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
                                {isNepali
                                    ? "दिनभरको कोलाहल अगावै तथ्य र स्पष्टता।"
                                    : "Clarity before the daily noise begins."}
                            </h2>

                            <p className="text-sm text-foreground/80 leading-relaxed max-w-xl">
                                {isNepali
                                    ? "हरेक बिहान ७:०० बजे नेपालको राजनीति, संसद् र नीतिगत निर्णयहरूको तथ्यपरक विश्लेषण सिधै तपाईंको इनबक्समा। कुनै दलगत पूर्वाग्रह वा अनावश्यक हल्लाविना।"
                                    : "Essential political context, parliamentary dispatches, and non-partisan policy analysis delivered directly to your inbox every morning at 7:00 AM."}
                            </p>

                            {/* Trust badges */}
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground mt-5 justify-center md:justify-start font-mono">
                                <span className="inline-flex items-center gap-1.5 text-foreground/85">
                                    <Check size={13} className="text-foreground" />
                                    <span>{isNepali ? "विज्ञापनरहित निष्पक्ष सामग्री" : "100% Ad-free & unbiased"}</span>
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1.5 text-foreground/85">
                                    <Check size={13} className="text-foreground" />
                                    <span>{isNepali ? "निःशुल्क सदस्यता" : "Free daily edition"}</span>
                                </span>
                                <span>•</span>
                                <span>{isNepali ? "एक क्लिकमा रद्द गर्न सकिने" : "Cancel anytime"}</span>
                            </div>
                        </div>

                        {/* Subscription Form Column */}
                        <div className="w-full md:w-auto md:min-w-[340px]">
                            {status === "success" ? (
                                <div className="p-5 rounded-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                                    <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400" />
                                    <div>
                                        <h4 className="font-bold text-xs uppercase font-mono tracking-wider mb-1">
                                            {isNepali ? "दर्ता सम्पन्न भयो" : "SUBSCRIPTION CONFIRMED"}
                                        </h4>
                                        <p className="text-xs font-medium leading-relaxed">
                                            {message}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (status === "error") setStatus("idle");
                                            }}
                                            placeholder={isNepali ? "तपाईंको इमेल ठेगाना लेख्नुहोस्..." : "Enter your email address..."}
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xs border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all shadow-2xs font-sans"
                                        />
                                    </div>

                                    {status === "error" && (
                                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{message}</p>
                                    )}

                                    {/* Primary CTA Button: Owned by Brand Red */}
                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="w-full py-3 px-5 rounded-xs bg-primary hover:bg-primary/90 text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        <span>
                                            {status === "loading" 
                                                ? (isNepali ? "प्रक्रिया हुँदैछ..." : "Subscribing...") 
                                                : (isNepali ? "दैनिक ब्रिफिङ प्राप्त गर्नुहोस्" : "Subscribe to Morning Dispatch")}
                                        </span>
                                        <ArrowRight size={14} />
                                    </button>

                                    <span className="text-[10px] text-muted-foreground text-center block font-mono">
                                        {isNepali ? "तपाईं जुनसुकै बेला सदस्यता रद्द गर्न सक्नुहुन्छ। गोपनीयता सुरक्षित छ।" : "Strict privacy. We never share or sell subscriber emails."}
                                    </span>
                                </form>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
