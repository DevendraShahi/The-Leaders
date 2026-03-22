"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, FileText, Users, Mail, AlertCircle } from "lucide-react";
import { SubscribeForm } from "@/components/common/subscribe-form";
import { useLanguage } from "@/components/providers/language-provider";

function formatNumber(num: number): string {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    }
    return num + '+';
}

interface Stats {
    subscribers: number;
    leaders: number;
    articles: number;
}

export default function SubscribePage() {
    const { language } = useLanguage();
    const isNepali = language === "ne";

    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [stats, setStats] = useState<Stats>({ subscribers: 0, leaders: 0, articles: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/stats');
                const data = await res.json();
                if (data.subscribers) setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const benefits = [
        {
            icon: FileText,
            title: isNepali ? "विशेष जीवनीहरू" : "Exclusive Biographies",
            description: isNepali
                ? "नेपालका राजनीतिक नेताहरूका गहन प्रोफाइलहरू, प्रमाणित करियर इतिहास सहित।"
                : "In-depth profiles of Nepal's political leaders with verified credentials and career timelines."
        },
        {
            icon: Clock,
            title: isNepali ? "ऐतिहासिक अभिलेख" : "Historical Archives",
            description: isNepali
                ? "दशकौंको राजनीतिक इतिहास, निर्वाचन तथ्याङ्क र नेपालको लोकतन्त्रका महत्वपूर्ण घटनाहरूमा पहुँच।"
                : "Access decades of political history, election data, and milestone events in Nepal's democracy."
        },
        {
            icon: Shield,
            title: isNepali ? "प्रमाणित विश्लेषण" : "Verified Analysis",
            description: isNepali
                ? "तथ्य-परीक्षित राजनीतिक विश्लेषण र निर्वाचन बुद्धिमत्ता जसमा तपाईं भर पर्न सक्नुहुन्छ।"
                : "Fact-checked political analysis and election intelligence you can trust."
        },
        {
            icon: Users,
            title: isNepali ? "नागरिक ज्ञान" : "Civic Insights",
            description: isNepali
                ? "नेपालको भविष्य निर्माण गर्ने नीतिहरू, दलहरू र व्यक्तित्वहरूलाई गहिरोसँग बुझ्नुहोस्।"
                : "Understand the policies, parties, and people shaping Nepal's future."
        }
    ];

    const faqs = [
        {
            question: isNepali ? "मलाई कति पटक इमेल आउनेछ?" : "How often will I receive emails?",
            answer: isNepali
                ? "हामी महिनामा २–४ पटक इमेल पठाउँछौं। दैनिक सन्देशहरूले तपाईंलाई कहिल्यै बिरक्त गराइँदैन।"
                : "We send emails 2-4 times per month. You'll never be spammed with daily messages."
        },
        {
            question: isNepali ? "के म जुनसुकै समयमा सदस्यता रद्द गर्न सक्छु?" : "Can I unsubscribe anytime?",
            answer: isNepali
                ? "हजुर, प्रत्येक इमेलमा एक-क्लिक अनसब्सक्राइब लिङ्क हुन्छ। तपाईं हाम्रो अनसब्सक्राइब पृष्ठमा गएर पनि आफ्नो सदस्यता व्यवस्थापन गर्न सक्नुहुन्छ।"
                : "Yes, every email includes a one-click unsubscribe link. You can also manage your subscription on our unsubscribe page."
        },
        {
            question: isNepali ? "के मेरो इमेल जानकारी सुरक्षित छ?" : "Is my email information secure?",
            answer: isNepali
                ? "बिल्कुल। हामी कहिल्यै तेस्रो पक्षसँग तपाईंको इमेल साझा गर्दैनौं। तपाईंको गोपनीयता हाम्रो सर्वोच्च प्राथमिकता हो।"
                : "Absolutely. We never share your email with third parties. Your privacy is our priority."
        },
        {
            question: isNepali ? "के सामग्री साँच्चै निःशुल्क छ?" : "Is the content really free?",
            answer: isNepali
                ? "हजुर, हाम्रो सबै न्युजलेटर सामग्री पूर्णतः निःशुल्क छ। हामी राजनीतिक जानकारीमा सबैको समान पहुँचमा विश्वास गर्छौं।"
                : "Yes, all our newsletter content is completely free. We believe in democratizing access to political information."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 md:py-28 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px),
                                         radial-gradient(circle at 75% 75%, currentColor 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }} />
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium tracking-[0.2em] uppercase bg-primary/10 text-primary">
                            {isNepali ? "हाम्रो समुदायमा सामेल हुनुहोस्" : "Join The Inner Circle"}
                        </span>
                        <h1 className="font-bebas text-5xl md:text-7xl tracking-wide text-foreground mb-6 leading-tight">
                            {isNepali ? (
                                <>
                                    नेपालको राजनीतिबारे
                                    <span className="block text-primary">सूचित रहनुहोस्</span>
                                </>
                            ) : (
                                <>
                                    Stay Informed About
                                    <span className="block text-primary">Nepal&apos;s Politics</span>
                                </>
                            )}
                        </h1>
                        <p className="font-manrope text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            {isNepali
                                ? "विशेष विश्लेषण, प्रमाणित जीवनीहरू र ऐतिहासिक अभिलेखहरू सिधै आफ्नो इनबक्समा पाउनुहोस्। नेपालको लोकतान्त्रिक विमर्शलाई आकार दिने हजारौं सूचित नागरिकहरूमा सामेल हुनुहोस्।"
                                : "Get exclusive insights, verified biographies, and historical archives delivered straight to your inbox. Join thousands of informed citizens shaping Nepal's democratic discourse."
                            }
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 px-6 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="font-bebas text-3xl md:text-4xl tracking-wide text-foreground mb-4">
                            {isNepali ? "सदस्यता किन लिने?" : "Why Subscribe"}
                        </h2>
                        <p className="font-manrope text-muted-foreground max-w-xl mx-auto">
                            {isNepali
                                ? "नेपालको जटिल राजनीतिक परिदृश्य बुझ्न सहयोग गर्ने उच्चस्तरीय राजनीतिक जानकारीमा पहुँच पाउनुहोस्।"
                                : "Access premium political intelligence that helps you understand Nepal's complex political landscape."
                            }
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="bg-background p-6 border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                            >
                                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <benefit.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-bebas text-xl tracking-wide text-foreground mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="font-manrope text-sm text-muted-foreground leading-relaxed">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Subscribe Form Section */}
            <section className="py-20 px-6" id="subscribe">
                <div className="max-w-xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center mb-8">
                            <h2 className="font-bebas text-3xl md:text-4xl tracking-wide text-foreground mb-3">
                                {isNepali ? "अहिले सदस्यता लिनुहोस्" : "Subscribe Now"}
                            </h2>
                            <p className="font-manrope text-muted-foreground">
                                {isNepali
                                    ? "सुरु गर्न आफ्नो मनपर्ने तरिका छान्नुहोस्"
                                    : "Choose your preferred method to get started"
                                }
                            </p>
                        </div>

                        <div className="border border-border p-8">
                            <SubscribeForm layout="default" />

                            <div className="mt-8 pt-6 border-t border-border">
                                <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <span>{isNepali ? "तपाईंको गोपनीयता सुरक्षित छ" : "Your privacy is protected"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{isNepali ? "कहिल्यै स्प्याम छैन" : "No spam, ever"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{isNepali ? "एक-क्लिक अनसब्सक्राइब" : "One-click unsubscribe"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6 bg-primary text-primary-foreground">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-3 gap-0 text-center border-l border-r border-primary-foreground/20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            className="py-4 border-r border-primary-foreground/20"
                        >
                            <div className="font-bebas text-4xl md:text-5xl tracking-wide">
                                165+
                            </div>
                            <div className="font-manrope text-sm opacity-80">
                                {isNepali ? "निर्वाचन क्षेत्रहरू" : "Constituencies"}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="py-4 border-r border-primary-foreground/20"
                        >
                            <div className="font-bebas text-4xl md:text-5xl tracking-wide">
                                {loading ? '...' : formatNumber(stats.leaders)}
                            </div>
                            <div className="font-manrope text-sm opacity-80">
                                {isNepali ? "स्तम्भहरू" : "Leaders"}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="py-4"
                        >
                            <div className="font-bebas text-4xl md:text-5xl tracking-wide">
                                {loading ? '...' : formatNumber(stats.articles)}
                            </div>
                            <div className="font-manrope text-sm opacity-80">
                                {isNepali ? "प्रकाशित लेखहरू" : "Published Articles"}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="font-bebas text-3xl md:text-4xl tracking-wide text-foreground mb-4">
                            {isNepali ? "बारम्बार सोधिने प्रश्नहरू" : "Frequently Asked Questions"}
                        </h2>
                        <p className="font-manrope text-muted-foreground">
                            {isNepali
                                ? "सदस्यता बारे जान्नुपर्ने सबै कुरा"
                                : "Everything you need to know about subscribing"
                            }
                        </p>
                    </motion.div>

                    <div className="space-y-0">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="border border-border"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors cursor-pointer"
                                >
                                    <span className="font-medium text-foreground">{faq.question}</span>
                                    <ArrowRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${openFaq === index ? 'rotate-90' : ''}`} />
                                </button>
                                {openFaq === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="px-6 pb-4 border-t border-border"
                                    >
                                        <p className="font-manrope text-muted-foreground leading-relaxed pt-4">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-bebas text-3xl md:text-4xl tracking-wide text-foreground mb-4">
                            {isNepali ? "सूचित रहन तयार हुनुहुन्छ?" : "Ready to Stay Informed?"}
                        </h2>
                        <p className="font-manrope text-muted-foreground mb-8">
                            {isNepali
                                ? "प्रमाणित राजनीतिक विश्लेषणका लागि द लिडर्समा भरोसा गर्ने हजारौं नागरिकहरूमा सामेल हुनुहोस्।"
                                : "Join thousands of citizens who trust The Leaders for verified political insights."
                            }
                        </p>
                        <a
                            href="#subscribe"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                            {isNepali ? "अहिले सदस्यता लिनुहोस्" : "Subscribe Now"}
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
