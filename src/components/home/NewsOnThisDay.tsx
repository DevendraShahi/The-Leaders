"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { History, ArrowRight, ShieldCheck, Calendar, Landmark, CheckCircle2, FileText } from "lucide-react";
import { LEADER_PORTRAIT_MAP } from "./NewsArchiveSpotlight";
import styles from "./NewsHome.module.css";

interface HistoricEvent {
    id: string;
    dateLabel: { en: string; ne: string };
    year: { en: string; ne: string };
    era: { en: string; ne: string };
    title: { en: string; ne: string };
    summary: { en: string; ne: string };
    significance: { en: string; ne: string };
    relatedLeader: {
        name: { en: string; ne: string };
        slug: string;
        role: { en: string; ne: string };
    };
    proclamationQuote: { en: string; ne: string };
    officialGazette: { en: string; ne: string };
    image: string;
    imageCaption: { en: string; ne: string };
}

export function NewsOnThisDay() {
    const { language } = useLanguage();
    const isNepali = language === "ne";

    const resolve = (val: { en: string; ne: string } | undefined | null) => {
        if (!val) return "";
        return (isNepali ? val.ne : val.en) || val.en || val.ne || "";
    };

    const milestones: HistoricEvent[] = [
        {
            id: "event-1",
            dateLabel: { en: "Feb 18 (Falgun 7)", ne: "फागुन ७" },
            year: { en: "1951 AD (2007 BS)", ne: "२००७ साल" },
            era: { en: "End of Rana Rule", ne: "राणा शासनको अन्त्य" },
            title: {
                en: "The Fall of 104-Year Rana Rule: Nepal Enters the Democratic Era",
                ne: "१०४ वर्षे जहानियाँ राणा शासनको अन्त्य: नेपालमा प्रजातन्त्रको ऐतिहासिक थालनी"
            },
            summary: {
                en: "Following the armed revolution led by the Nepali Congress and broad civic uprising, King Tribhuvan proclaimed the end of hereditary Rana rule and announced a coalition cabinet.",
                ne: "नेपाली कांग्रेसको नेतृत्वमा भएको जनक्रान्तिको दबाबमा राजा त्रिभुवनले राणा शासन अन्त्यको शाही घोषणा गर्दै नेपालमा पहिलो संयुक्त सरकार गठन गरे।"
            },
            significance: {
                en: "Established the right to vote, legalized public political parties, and instituted the first fundamental civil liberties.",
                ne: "नेपाली नागरिकलाई पहिलो पटक बालिग मताधिकार, खुला राजनीतिक दल खोल्ने अधिकार र मौलिक हक प्रदान गर्‍यो।"
            },
            relatedLeader: {
                name: { en: "B.P. Koirala", ne: "विश्वेश्वरप्रसाद कोइराला" },
                slug: "bp-koirala",
                role: { en: "Home Minister in First Coalition Cabinet", ne: "प्रथम संयुक्त सरकारका गृहमन्त्री" }
            },
            proclamationQuote: {
                en: "“Henceforth, our subjects shall be governed in accordance with a democratic constitution framed by their own elected representatives.”",
                ne: "“अब उप्रान्त हाम्रा प्रजाको शासन उनीहरू आफैंले रोजेका प्रतिनिधिहरूको विधान सभाले बनाएको प्रजातान्त्रिक संविधान बमोजिम हुनेछ।”"
            },
            officialGazette: {
                en: "Royal Proclamation of Falgun 7, 2007 BS (Delhi Accord Gazette)",
                ne: "२००७ फागुन ७ को शाही घोषणा तथा दिल्ली सम्झौता"
            },
            image: "/art/milestone-1951.jpg",
            imageCaption: {
                en: "1951 Royal Proclamation: Citizens gathered at Basantapur, Kathmandu Durbar Square celebrating democracy",
                ne: "२००७ फागुन ७: काठमाडौं वसन्तपुर दरबार परिसरमा भेला भई प्रजातन्त्र घोषणाको स्वागत गर्दै नागरिकहरू"
            }
        },
        {
            id: "event-2",
            dateLabel: { en: "Apr 8 (Chaitra 26)", ne: "चैत २६" },
            year: { en: "1990 AD (2046 BS)", ne: "२०४६ साल" },
            era: { en: "Return of Multiparty Democracy", ne: "बहुदलको पुनस्र्थापना" },
            title: {
                en: "The 1990 People’s Movement: Restoration of Multiparty Constitutional Order",
                ne: "निर्दलीय पञ्चायती व्यवस्थाको अन्त्य: बहुदलीय प्रजातन्त्रको ऐतिहासिक पुनस्र्थापना"
            },
            summary: {
                en: "After 50 days of unified mass protests led by Supreme Commander Ganesh Man Singh, the King announced the lifting of the 30-year ban on political parties and agreed to constitutional monarchy.",
                ne: "सर्वोच्च कमाण्डर गणेशमान सिंहको नेतृत्वमा कांग्रेस र संयुक्त वाममोर्चाको ५० दिने ऐतिहासिक आन्दोलनपछि दलहरूमाथिको ३० वर्षे प्रतिबन्ध फुकुवा भयो।"
            },
            significance: {
                en: "Led to the 1990 Constitution, establishing parliamentary sovereignty, judicial review, and human rights charters.",
                ne: "२०४७ को संविधान निर्माण भई सार्वभौमसत्ता जनतामा निहित भयो र पूर्ण प्रेस स्वतन्त्रता स्थापित भयो।"
            },
            relatedLeader: {
                name: { en: "Ganesh Man Singh", ne: "गणेशमान सिंह" },
                slug: "ganesh-man-singh",
                role: { en: "Supreme Commander of 1990 Movement", ne: "२०४६ जनआन्दोलनका सर्वोच्च कमाण्डर" }
            },
            proclamationQuote: {
                en: "“The ban on political parties stands formally revoked, and national reconciliation shall guide the democratic transition.”",
                ne: "“नेपालमा राजनीतिक दलहरूमाथिको प्रतिबन्ध हटाइएको छ र प्रजातान्त्रिक परिवर्तन नै राष्ट्रको मुख्य बाटो हुनेछ।”"
            },
            officialGazette: {
                en: "Nepal Gazette Royal Communique, Chaitra 26, 2046 BS",
                ne: "नेपाल राजपत्र, शाही विज्ञप्ति, २०४६ चैत २६"
            },
            image: "/art/milestone-1990.jpg",
            imageCaption: {
                en: "Spring 1990: Mass rallies in Kathmandu calling for the lifting of party bans and multiparty democracy",
                ne: "२०४६ वसन्त: बहुदलीय प्रजातन्त्र पुनस्र्थापनाका लागि काठमाडौंको सडकमा उर्लिएको ऐतिहासिक जनसागर"
            }
        },
        {
            id: "event-3",
            dateLabel: { en: "Nov 9 (Kartik 23)", ne: "कार्तिक २३" },
            year: { en: "1990 AD (2047 BS)", ne: "२०४७ साल" },
            era: { en: "1990 Constitution Promulgation", ne: "२०४७ को संविधान जारी" },
            title: {
                en: "The 1990 Democratic Constitution: Sovereignty Transferred to the People",
                ne: "नेपाल अधिराज्यको संविधान २०४७ जारी: सार्वभौमसत्ता पहिलो पटक नेपाली जनतामा"
            },
            summary: {
                en: "Drafted under Prime Minister Krishna Prasad Bhattarai’s interim coalition government, the 1990 constitution enshrined parliamentary democracy, fundamental human rights, and an independent judiciary.",
                ne: "अन्तरिम सरकारका प्रधानमन्त्री कृष्णप्रसाद भट्टराईको नेतृत्वमा जनआन्दोलनको भावना अनुसार निर्मित २०४७ को संविधानले जनतामा सार्वभौमसत्ता निहित गर्दै बहुदलीय प्रजातन्त्र संस्थागत गर्‍यो।"
            },
            significance: {
                en: "Separated governmental branches, ended absolute monarchy, and guaranteed free press and freedom of association.",
                ne: "शक्तिको पृथकीकरण, संवैधानिक राजतन्त्र, पूर्ण प्रेस स्वतन्त्रता र नागरिकका मौलिक हकको ऐतिहासिक प्रत्याभूति गर्‍यो।"
            },
            relatedLeader: {
                name: { en: "Krishna Prasad Bhattarai", ne: "कृष्णप्रसाद भट्टराई" },
                slug: "krishna-prasad-bhattarai",
                role: { en: "Prime Minister of Interim Government", ne: "अन्तरिम सरकारका प्रधानमन्त्री" }
            },
            proclamationQuote: {
                en: "“This Constitution stands as a monument to the sacrifices of the Nepali people for freedom, human rights, and constitutional government.”",
                ne: "“यो संविधान स्वतन्त्रता, मानव अधिकार र विधिको शासनका लागि नेपाली जनताले गरेको त्याग र बलिदानको प्रतिफल हो।”"
            },
            officialGazette: {
                en: "Constitution of the Kingdom of Nepal 2047, Official Gazette Extraordinary",
                ne: "नेपाल अधिराज्यको संविधान २०४७, नेपाल राजपत्र विशेष अंक"
            },
            image: "/art/milestone-1996.jpg",
            imageCaption: {
                en: "Historic Accords: Formal promulgation of democratic constitutions and reconciliation pacts",
                ne: "ऐतिहासिक सम्झौता: संवैधानिक विकासक्रम र शान्ति सम्झौताका आधिकारिक दस्तावेजहरू"
            }
        },
        {
            id: "event-4",
            dateLabel: { en: "May 28 (Jestha 15)", ne: "जेठ १५" },
            year: { en: "2008 AD (2065 BS)", ne: "२०६५ साल" },
            era: { en: "Declaration of the Republic", ne: "गणतन्त्रको घोषणा" },
            title: {
                en: "Nepal Declared a Federal Republic: Constituent Assembly Votes to End Monarchy",
                ne: "नेपाल संघीय लोकतान्त्रिक गणतन्त्र घोषणा: संविधान सभाको पहिलो ऐतिहासिक बैठक"
            },
            summary: {
                en: "In its inaugural session, Nepal’s newly elected Constituent Assembly voted 560 to 4 to abolish the 240-year-old Shah monarchy and formally establish a federal republic.",
                ne: "जनताबाट निर्वाचित प्रथम संविधान सभाको पहिलो बैठकले ५६० विरुद्ध ४ मतले २४० वर्ष लामो राजतन्त्र अन्त्य गर्दै नेपाललाई संघीय लोकतान्त्रिक गणतन्त्र घोषणा गर्‍यो।"
            },
            significance: {
                en: "Transferred sovereign head-of-state authority to an elected civilian president and set federal restructuring in motion.",
                ne: "राष्ट्राध्यक्षको पद नागरिकले चुनेको राष्ट्रपतिमा स्थानान्तरण भई समावेशी राज्य निर्माणको मार्ग प्रशस्त गर्‍यो।"
            },
            relatedLeader: {
                name: { en: "Girija Prasad Koirala", ne: "गिरिजाप्रसाद कोइराला" },
                slug: "girija-prasad-koirala",
                role: { en: "Acting Head of State & Prime Minister", ne: "कार्यवाहक राष्ट्राध्यक्ष तथा प्रधानमन्त्री" }
            },
            proclamationQuote: {
                en: "“Nepal is hereby declared an independent, indivisible, sovereign, secular, and inclusive federal democratic republic.”",
                ne: "“नेपाल एक स्वतन्त्र, अविभाज्य, सार्वभौमसत्ता सम्पन्न, धर्मनिरपेक्ष तथा समावेशी संघीय लोकतान्त्रिक गणतन्त्र हुनेछ।”"
            },
            officialGazette: {
                en: "Constituent Assembly Resolution No. 1, Jestha 15, 2065 BS",
                ne: "संविधान सभाको पहिलो प्रस्ताव, २०६५ जेठ १५"
            },
            image: "/art/milestone-2008.jpg",
            imageCaption: {
                en: "May 28, 2008: Historic Constituent Assembly session declaring the Federal Democratic Republic of Nepal",
                ne: "२०६५ जेठ १५: प्रथम संविधान सभाको बैठकले नेपाललाई संघीय लोकतान्त्रिक गणतन्त्र घोषणा गरेको क्षण"
            }
        }
    ];

    const [selectedIdx, setSelectedIdx] = useState(0);
    const activeEvent = milestones[selectedIdx] || milestones[0];

    return (
        <section id="democracy-chronicles" className="py-14 bg-background border-b border-border">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-foreground pb-4 mb-6 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-foreground/80 flex items-center gap-1.5">
                            <History size={13} className="text-foreground/80" />
                            {isNepali ? "इतिहासका मुख्य मोडहरू · समयरेखा अभिलेख" : "HISTORIC MILESTONES · TURNING POINTS OF DEMOCRACY"}
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                            {isNepali ? "नेपालको प्रजातान्त्रिक आन्दोलनका निर्णायक मोडहरू" : "Turning Points in Nepal's Democratic History"}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                            {isNepali
                                ? "२००७ सालको क्रान्तिदेखि २०७२ को संविधानसम्म: राणा शासनको अन्त्य, बहुदलको पुनस्र्थापना र गणतन्त्र घोषणाका ऐतिहासिक दस्तावेजहरू।"
                                : "The 4 defining milestones from 1951 to the present day: how revolutions, treaties, and public assemblies built modern Nepal."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                            CHRONOLOGY: 1951 – 2008
                        </span>
                    </div>
                </div>

                {/* Broadsheet Chronometer Bar (Clean hairline timeline tabs, zero chunky card boxes) */}
                <div className="border-y border-border/40 py-3 mb-8 flex flex-wrap items-center justify-between gap-3">
                    {milestones.map((evt, idx) => {
                        const isSelected = idx === selectedIdx;
                        return (
                            <button
                                key={evt.id}
                                onClick={() => setSelectedIdx(idx)}
                                className={`font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer pb-1.5 flex items-baseline gap-2 ${
                                    isSelected
                                        ? "text-foreground font-bold border-b-2 border-foreground"
                                        : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                                }`}
                            >
                                <span className="font-serif font-black text-sm">{resolve(evt.year)}</span>
                                <span className="text-[11px] opacity-80">{resolve(evt.dateLabel)}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Pure Broadsheet Milestone Layout: Chronicle (Left 7 cols) + Proclamation (Right 5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start">
                    
                    {/* Left Chronicle Column (7 cols with hairline right divider) */}
                    <div className="lg:col-span-7 flex flex-col gap-3 lg:border-r border-border/40 lg:pr-8">
                        
                        {/* Meta Info Bar */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-border/30 text-xs font-mono">
                            <span className="font-bold text-foreground uppercase tracking-widest text-[10.5px]">
                                {resolve(activeEvent.dateLabel)} · {resolve(activeEvent.year)}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase">
                                {resolve(activeEvent.era)}
                            </span>
                        </div>

                        {/* Headline */}
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-foreground my-1">
                            {resolve(activeEvent.title)}
                        </h3>

                        {/* Historic Archival Artwork Plate */}
                        <div className="my-2">
                            <div className="overflow-hidden border border-border/60 relative aspect-[16/9] w-full bg-muted shadow-2xs">
                                <img
                                    src={activeEvent.image}
                                    alt={resolve(activeEvent.title)}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50" />
                                <span className="absolute bottom-2.5 right-3 text-[9.5px] font-mono tracking-wider text-white/95 bg-black/75 px-2 py-0.5 rounded backdrop-blur-sm uppercase">
                                    ARCHIVAL CHRONICLE ETCHING · {resolve(activeEvent.year)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10.5px] font-mono text-muted-foreground pt-1.5 border-t border-border/30 mt-1">
                                <span>{resolve(activeEvent.imageCaption)}</span>
                                <span className="uppercase text-[9.5px]">THE LEADERS CHRONICLES</span>
                            </div>
                        </div>

                        {/* Narrative Summary */}
                        <p className="text-sm text-foreground/85 leading-relaxed font-sans line-clamp-3">
                            {resolve(activeEvent.summary)}
                        </p>

                        {/* Historic Significance Takeaway (Clean hairline rule, no bulky box) */}
                        <div className="border-l-2 border-foreground/30 pl-3.5 my-2">
                            <span className="font-mono text-[9.5px] uppercase tracking-wider font-bold text-muted-foreground block mb-0.5">
                                {isNepali ? "ऐतिहासिक महत्व:" : "HISTORIC SIGNIFICANCE:"}
                            </span>
                            <p className="font-serif italic text-xs leading-relaxed text-foreground/80">
                                {resolve(activeEvent.significance)}
                            </p>
                        </div>

                        {/* Gazette / Archival Record Citation */}
                        <div className="pt-2.5 border-t border-border/30 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                            <FileText size={12} className="text-foreground/70 shrink-0" />
                            <span>{resolve(activeEvent.officialGazette)}</span>
                        </div>

                    </div>

                    {/* Right Proclamation Column (5 cols with broadsheet quote & leader) */}
                    <div className="lg:col-span-5 flex flex-col justify-between h-full lg:pl-8">
                        
                        <div>
                            {/* Proclamation Header */}
                            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/30 text-xs font-mono">
                                <span className="font-bold uppercase tracking-widest text-foreground text-[10.5px]">
                                    {isNepali ? "आधिकारिक घोषणा पाठ" : "HISTORIC PROCLAMATION"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {resolve(activeEvent.year)}
                                </span>
                            </div>

                            {/* Proclamation Quote */}
                            <blockquote className="font-serif italic text-sm sm:text-base text-foreground leading-relaxed pl-3.5 border-l-2 border-foreground/60 mb-5">
                                {resolve(activeEvent.proclamationQuote)}
                            </blockquote>

                            {/* Key Figure Spotlight (Clean broadsheet byline with archival portrait) */}
                            <div className="pt-3 border-t border-border/30">
                                <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground block mb-2">
                                    {isNepali ? "आन्दोलनका प्रमुख नेतृत्व:" : "HISTORIC LEADER IN FOCUS:"}
                                </span>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {LEADER_PORTRAIT_MAP[activeEvent.relatedLeader.slug] && (
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-border/60 shrink-0 bg-muted">
                                                <img
                                                    src={LEADER_PORTRAIT_MAP[activeEvent.relatedLeader.slug]}
                                                    alt={resolve(activeEvent.relatedLeader.name)}
                                                    className="w-full h-full object-cover filter grayscale contrast-110"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-serif font-bold text-sm sm:text-base text-foreground leading-tight">
                                                {resolve(activeEvent.relatedLeader.name)}
                                            </h4>
                                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                                                {resolve(activeEvent.relatedLeader.role)}
                                            </span>
                                        </div>
                                    </div>
                                    <Link 
                                        href={`/leaders/${activeEvent.relatedLeader.slug}`}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:underline uppercase tracking-wider font-mono text-[10.5px] shrink-0"
                                    >
                                        <span>{isNepali ? "जीवनी" : "Profile"}</span>
                                        <ArrowRight size={10} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border/30 text-[9.5px] font-mono text-muted-foreground flex items-center justify-between mt-4">
                            <span>DEMOCRACY REPOSITORY</span>
                            <span>TL-CHRONO</span>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}
