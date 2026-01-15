"use client";

import { motion } from "framer-motion";

const events = [
    { year: "1951", title: "The Dawn of Democracy", desc: "The Rana regime crumbles. The people's voice rises from the silence." },
    { year: "1990", title: "The People's Movement", desc: "Unity in the streets. A king bows to the will of the masses." },
    { year: "2006", title: "The Second Rising", desc: "The final blow to monarchy. A republic is born from chaos." },
    { year: "2015", title: "A Constitution Written", desc: "Ink on paper, promising a future that is yet to be fully realized." },
];

export function Timeline() {
    return (
        <section className="py-32 bg-background relative">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-5xl md:text-7xl font-bebas text-primary uppercase tracking-tighter mb-4">
                        Timeline of Chaos
                    </h2>
                    <div className="h-1 w-24 bg-foreground/10 mx-auto" />
                </motion.div>

                <div className="relative">
                    {/* Vertical Line with Gradient */}
                    <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent md:-translate-x-1/2" />

                    <div className="space-y-24">
                        {events.map((event, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ margin: "-100px", once: true }}
                                transition={{ duration: 0.6 }}
                                className={`relative flex flex-col md:flex-row gap-8 items-start ${index % 2 === 1 ? "md:flex-row-reverse" : ""
                                    }`}
                            >
                                {/* Node */}
                                <div className="absolute left-[11px] md:left-1/2 top-0 md:-translate-x-1/2 mt-3 z-10">
                                    <span className="block w-2.5 h-2.5 bg-primary rotate-45 shadow-[0_0_15px_rgba(229,9,20,0.8)]" />
                                    {/* Ripple Effect */}
                                    <span className="absolute inset-0 w-2.5 h-2.5 bg-primary/50 rotate-45 animate-ping" />
                                </div>

                                {/* Content */}
                                <div className={`md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? "md:pr-20 md:text-right" : "md:pl-20"}`}>
                                    <div className="relative">
                                        <span className={`text-[8rem] font-bebas text-foreground/[0.03] absolute -top-16 select-none z-0 pointer-events-none leading-none ${index % 2 === 0 ? "right-0" : "left-0"}`}>
                                            {event.year}
                                        </span>
                                        <div className="relative z-10">
                                            <span className="inline-block text-primary font-bebas text-2xl mb-2 tracking-widest border-b border-primary/30 pb-1">{event.year}</span>
                                            <h3 className="text-4xl md:text-5xl font-bebas text-foreground uppercase mb-4 leading-none drop-shadow-xl">
                                                {event.title}
                                            </h3>
                                            <p className="text-muted-foreground font-manrope text-lg leading-relaxed max-w-md ml-auto mr-auto md:mx-0">
                                                {event.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Empty side for layout balance */}
                                <div className="hidden md:block md:w-1/2" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
