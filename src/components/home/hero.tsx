"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-background">
            {/* Background with overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2576&auto=format&fit=crop')", // Book/Library aesthetic or Nepali landscape
                }}
            >
                <div className="absolute inset-0 bg-background/80 dark:bg-background/90" />
            </div>

            <div className="container relative z-10 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="inline-block py-1 px-4 rounded-none bg-primary text-black text-lg font-bebas tracking-widest uppercase mb-6">
                        <span className="block">Archive of Power</span>
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl md:text-9xl font-bebas font-bold tracking-tighter text-white mb-6 uppercase leading-none drop-shadow-2xl"
                >
                    The <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary dark:to-black to-black/5 stroke-foreground text-stroke-1">Leaders</span> <br />
                    <span className="text-primary tracking-normal">of Nepal</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground mb-12 font-sans font-light tracking-wide leading-relaxed"
                >
                    Discover the visionaries, revolutionaries, and statesmen who shaped the destiny of a nation. <span className="text-primary font-medium">Power. Legacy. Blood.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Button size="lg" className="h-16 px-10 text-2xl font-bebas tracking-wider bg-primary text-black hover:bg-accent rounded-none w-full sm:w-auto transition-transform hover:scale-105">
                        <span>Explore Biographies</span>
                    </Button>
                    <Button variant="outline" size="lg" className="h-16 px-10 text-2xl font-bebas tracking-wider border-primary/50 text-primary hover:bg-primary/20 hover:text-white rounded-none w-full sm:w-auto group">
                        <span className="flex items-center">View Timeline <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" /></span>
                    </Button>
                </motion.div>
            </div>

            {/* Decorative gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>
    );
}
