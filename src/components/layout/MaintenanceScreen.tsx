'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { Construction, ArrowLeft, Lock, ChevronLeft } from 'lucide-react';

interface MaintenanceScreenProps {
    reason?: string;
    returnHome?: boolean;
}

export default function MaintenanceScreen({ reason, returnHome = false }: MaintenanceScreenProps) {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Icon Entry
            gsap.from(iconRef.current, {
                y: -50,
                opacity: 0,
                duration: 1,
                ease: "elastic.out(1, 0.5)",
                delay: 0.2
            });

            // Text Entry
            gsap.from(textRef.current?.children || [], {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.5
            });

            // Breathing Animation for Icon
            gsap.to(iconRef.current, {
                y: 10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut",
                delay: 1.2
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="max-w-xl w-full text-center space-y-8 relative z-10">

                {/* Visual Icon */}
                <div ref={iconRef} className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 backdrop-blur-sm shadow-xl shadow-primary/5">
                    <Construction className="w-12 h-12 text-primary" />
                </div>

                <div ref={textRef} className="space-y-4">
                    <div className="space-y-2">
                        <h1 className="font-bebas text-5xl md:text-7xl tracking-wide text-foreground">
                            Under Maintenance
                        </h1>
                        <div className="h-1 w-20 bg-primary mx-auto rounded-full opacity-50" />
                    </div>

                    <div className="bg-card/50 border border-border/50 p-6 rounded-lg backdrop-blur-sm max-w-md mx-auto">
                        <p className="font-manrope text-lg text-muted-foreground leading-relaxed">
                            {reason || "We are currently optimizing our systems to serve you better. Access is temporarily restricted."}
                        </p>
                    </div>

                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50 pt-4">
                        Status: <span className="text-yellow-500 font-bold">In Progress</span>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4 pt-4">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-bold uppercase tracking-wider transition-all rounded-none border border-border"
                    >
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Go Back
                    </button>

                    {returnHome && (
                        <Link href="/" className="group flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-bold uppercase tracking-wider transition-all rounded-none border border-border">
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Return Home
                        </Link>
                    )}

                    <Link href="/admin/login" className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold uppercase tracking-wider transition-all rounded-none shadow-lg shadow-primary/20">
                        <Lock className="w-4 h-4" />
                        Admin Access
                    </Link>
                </div>


            </div>

            <div className="absolute bottom-8 text-center w-full text-xs text-muted-foreground/30 font-mono uppercase tracking-[0.2em]">
                System ID: 2026-NITI-LEADERS
            </div>
        </div>
    );
}
