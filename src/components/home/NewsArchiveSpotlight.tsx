"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { Landmark, ArrowRight, ShieldCheck, Filter, Library, Award, FileText, User, ExternalLink } from "lucide-react";
import { ILeader } from "@/models/Leader";
import styles from "./NewsHome.module.css";

interface NewsArchiveSpotlightProps {
    leaders: ILeader[];
}

export const LEADER_PORTRAIT_MAP: Record<string, string> = {
    "bp-koirala": "/images/leaders/bp-koirala.jpg",
    "pushpa-lal-shrestha": "/images/leaders/pushpa-lal-shrestha.jpg",
    "ganesh-man-singh": "/images/leaders/ganesh-man-singh.jpg",
    "man-mohan-adhikari": "/images/leaders/man-mohan-adhikari.jpg",
    "krishna-prasad-bhattarai": "/images/leaders/krishna-prasad-bhattarai.jpg",
    "madan-bhandari": "/images/leaders/madan-bhandari.jpg",
    "madan-kumar-bhandari": "/images/leaders/madan-kumar-bhandari.jpg",
    "girija-prasad-koirala": "/images/leaders/girija-prasad-koirala.jpg",
    "ram-raja-prasad-singh": "/images/leaders/ram-raja-prasad-singh.jpg",
    "tribhuvan-shah": "/images/leaders/tribhuvan-shah.png",
    "prithvi-narayan": "/images/leaders/prithvi-narayan.jpg",
    "bhimsen-thapa": "/images/leaders/bhimsen-thapa.jpg",
    "king-birendra-bir-bikram-shah-dev": "/images/leaders/king-birendra-bir-bikram-shah-dev.jpg",
    "mahendra-bir-bikram-shah-dev": "/images/leaders/mahendra-bir-bikram-shah-dev.jpg",
};

export const LEADER_WIKI_MAP: Record<string, string> = {
    "bp-koirala": "https://en.wikipedia.org/wiki/B._P._Koirala",
    "pushpa-lal-shrestha": "https://en.wikipedia.org/wiki/Pushpa_Lal_Shrestha",
    "ganesh-man-singh": "https://en.wikipedia.org/wiki/Ganesh_Man_Singh",
    "man-mohan-adhikari": "https://en.wikipedia.org/wiki/Man_Mohan_Adhikari",
    "krishna-prasad-bhattarai": "https://en.wikipedia.org/wiki/Krishna_Prasad_Bhattarai",
    "madan-bhandari": "https://en.wikipedia.org/wiki/Madan_Bhandari",
    "madan-kumar-bhandari": "https://en.wikipedia.org/wiki/Madan_Bhandari",
    "girija-prasad-koirala": "https://en.wikipedia.org/wiki/Girija_Prasad_Koirala",
    "ram-raja-prasad-singh": "https://en.wikipedia.org/wiki/Ram_Raja_Prasad_Singh",
    "tribhuvan-shah": "https://en.wikipedia.org/wiki/Tribhuvan_of_Nepal",
    "prithvi-narayan": "https://en.wikipedia.org/wiki/Prithvi_Narayan_Shah",
    "bhimsen-thapa": "https://en.wikipedia.org/wiki/Bhimsen_Thapa",
    "king-birendra-bir-bikram-shah-dev": "https://en.wikipedia.org/wiki/Birendra_of_Nepal",
    "mahendra-bir-bikram-shah-dev": "https://en.wikipedia.org/wiki/Mahendra_of_Nepal",
};

export function NewsArchiveSpotlight({ leaders }: NewsArchiveSpotlightProps) {
    const { language } = useLanguage();
    const isNepali = language === "ne";
    const [filter, setFilter] = useState<"all" | "democratic" | "left" | "constitutional">("all");

    const resolve = (val: { en?: string; ne?: string } | string | undefined | null) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        return (isNepali ? val.ne : val.en) || val.en || val.ne || "";
    };

    // Curated historical biographical profiles for Nepal's founding political leaders with Wikipedia archive references
    const fallbackLeaders: ILeader[] = useMemo(() => [
        {
            slug: "bp-koirala",
            name: { en: "B.P. Koirala", ne: "विश्वेश्वरप्रसाद कोइराला" },
            desc: {
                en: "First democratically elected Prime Minister of Nepal, champion of democratic socialism, and pioneer of modern parliamentary statehood.",
                ne: "नेपालका प्रथम जननिर्वाचित प्रधानमन्त्री, प्रजातान्त्रिक समाजवादका प्रणेता तथा आधुनिक संसदीय प्रणालीका प्रवर्तक।"
            },
            quote: {
                en: "Democracy is not merely a voting system; it is the courage of ordinary citizens to live and think without fear.",
                ne: "प्रजातन्त्र केवल मतदान गर्ने अधिकार मात्र होइन, नागरिकले निर्भयतापूर्वक बाँच्न र सोच्न पाउने व्यवस्था हो।"
            },
            bio: { en: "", ne: "" },
            party: { en: "Nepali Congress", ne: "नेपाली कांग्रेस" },
            position: { en: "First Elected Prime Minister (1959)", ne: "प्रथम जननिर्वाचित प्रधानमन्त्री (२०१६)" },
            years: { en: "1914 – 1982", ne: "१९१४ – १९८२" },
            image: "/images/leaders/bp-koirala.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 2840,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/B._P._Koirala"
                }
            ]
        },
        {
            slug: "pushpa-lal-shrestha",
            name: { en: "Pushpa Lal Shrestha", ne: "पुष्पलाल श्रेष्ठ" },
            desc: {
                en: "Founding General Secretary of the Communist Party of Nepal and visionary architect of the united democratic movement against autocracy.",
                ne: "नेपाल कम्युनिस्ट पार्टीका संस्थापक महासचिव तथा निरंकुशता विरुद्ध संयुक्त जनआन्दोलनका दूरदर्शी रणनीतिकार।"
            },
            quote: {
                en: "A united front of democratic and progressive forces is the sole guarantor of people's sovereignty.",
                ne: "प्रजातान्त्रिक र वामपन्थी शक्तिहरूको संयुक्त आन्दोलन नै जनताको सार्वभौमसत्ताको एक मात्र आधार हो।"
            },
            bio: { en: "", ne: "" },
            party: { en: "Communist Party of Nepal", ne: "नेपाल कम्युनिस्ट पार्टी" },
            position: { en: "Founding General Secretary", ne: "संस्थापक महासचिव" },
            years: { en: "1924 – 1978", ne: "१९२४ – १९७८" },
            image: "/images/leaders/pushpa-lal-shrestha.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 2180,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Pushpa_Lal_Shrestha"
                }
            ]
        },
        {
            slug: "ganesh-man-singh",
            name: { en: "Ganesh Man Singh", ne: "गणेशमान सिंह" },
            desc: {
                en: "Supreme Commander of the historic 1990 People's Movement and Iron Man (Lauha Purush) who unified diverse parties to restore democracy.",
                ne: "ऐतिहासिक २०४६ जनआन्दोलनका सर्वोच्च कमाण्डर तथा प्रजातन्त्र पुनर्बहालीका लागि सबै दललाई एकताबद्ध गर्ने लौहपुरुष।"
            },
            quote: {
                en: "Power attained without moral conviction leads only to new despotism.",
                ne: "नैतिक आदर्श बिना प्राप्त गरिएको सत्ताले केवल नयाँ तानाशाहीलाई जन्म दिन्छ।"
            },
            bio: { en: "", ne: "" },
            party: { en: "Nepali Congress", ne: "नेपाली कांग्रेस" },
            position: { en: "Supreme Commander of 1990 Movement", ne: "२०४६ जनआन्दोलनका सर्वोच्च कमाण्डर" },
            years: { en: "1915 – 1997", ne: "१९१५ – १९९७" },
            image: "/images/leaders/ganesh-man-singh.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 1950,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Ganesh_Man_Singh"
                }
            ]
        },
        {
            slug: "man-mohan-adhikari",
            name: { en: "Man Mohan Adhikari", ne: "मनमोहन अधिकारी" },
            desc: {
                en: "First democratically elected communist Prime Minister in South Asia, pioneering landmark social security and rural empowerment reforms.",
                ne: "दक्षिण एसियाकै पहिलो निर्वाचित कम्युनिस्ट प्रधानमन्त्री तथा सामाजिक सुरक्षा र गाउँ केन्द्रित नीतिका प्रारम्भकर्ता।"
            },
            quote: {
                en: "Social justice within a parliamentary constitutional order is our solemn promise.",
                ne: "संसदीय संवैधानिक मर्यादाभित्र सामाजिक न्यायको प्रत्याभूति नै हाम्रो मूल निष्ठा हो।"
            },
            bio: { en: "", ne: "" },
            party: { en: "CPN (UML)", ne: "नेकपा (एमाले)" },
            position: { en: "Prime Minister of Nepal (1994–1995)", ne: "पूर्व प्रधानमन्त्री (२०५१–२०५२)" },
            years: { en: "1920 – 1999", ne: "१९२० – १९९९" },
            image: "/images/leaders/man-mohan-adhikari.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 1820,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Man_Mohan_Adhikari"
                }
            ]
        },
        {
            slug: "krishna-prasad-bhattarai",
            name: { en: "Krishna Prasad Bhattarai", ne: "कृष्णप्रसाद भट्टराई (किशुनजी)" },
            desc: {
                en: "Interim Prime Minister who drafted and promulgated the 1990 Constitution, upholding clean governance and unwavering press freedom.",
                ne: "२०४७ को संविधान जारी गर्ने अन्तरिम प्रधानमन्त्री तथा निष्कलंक राजनीति र प्रेस स्वतन्त्रताका अटल पक्षधर।"
            },
            quote: {
                en: "A completely free press and an independent judiciary are the bedrock of human dignity.",
                ne: "पूर्ण प्रेस स्वतन्त्रता र स्वतन्त्र न्यायपालिका नै मानवीय मर्यादाका आधारस्तम्भ हुन्।"
            },
            bio: { en: "", ne: "" },
            party: { en: "Nepali Congress", ne: "नेपाली कांग्रेस" },
            position: { en: "Interim Prime Minister (1990)", ne: "अन्तरिम प्रधानमन्त्री (२०४७)" },
            years: { en: "1924 – 2011", ne: "१९२४ – २०११" },
            image: "/images/leaders/krishna-prasad-bhattarai.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 1640,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Krishna_Prasad_Bhattarai"
                }
            ]
        },
        {
            slug: "madan-bhandari",
            name: { en: "Madan Bhandari", ne: "मदन भण्डारी" },
            desc: {
                en: "Visionary political philosopher who formulated People's Multiparty Democracy (JaBaJa), democratizing the progressive movement in Nepal.",
                ne: "जनताको बहुदलीय जनवाद (जबज) का प्रणेता, जसले नेपालको कम्युनिस्ट आन्दोलनलाई लोकतान्त्रिक प्रतिस्पर्धामा समाहित गरे।"
            },
            quote: {
                en: "Theory is grey, but the golden tree of life springs green through the democratic mandate of the people.",
                ne: "सिद्धान्त जीवनको लागि हो, जीवन सिद्धान्तको लागि होइन; विचारको सार्थकता लोकतान्त्रिक जनमतमा निर्भर हुन्छ।"
            },
            bio: { en: "", ne: "" },
            party: { en: "CPN (UML)", ne: "नेकपा (एमाले)" },
            position: { en: "Theorist of Multiparty Democracy", ne: "जनताको बहुदलीय जनवादका प्रणेता" },
            years: { en: "1952 – 1993", ne: "१९५२ – १९९३" },
            image: "/images/leaders/madan-bhandari.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 2490,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Madan_Bhandari"
                }
            ]
        },
        {
            slug: "girija-prasad-koirala",
            name: { en: "Girija Prasad Koirala", ne: "गिरिजाप्रसाद कोइराला" },
            desc: {
                en: "Key architect of the 2006 Comprehensive Peace Accord and five-time Prime Minister who steered the transition to the Federal Republic.",
                ne: "२०६३ को विस्तृत शान्ति सम्झौताका प्रमुख वास्तुकार तथा संघीय लोकतान्त्रिक गणतन्त्रको संक्रमण नेतृत्व गर्ने राजनेता।"
            },
            quote: {
                en: "Consensus, cooperation, and unity are the irreplaceable requirements for lasting national peace.",
                ne: "सहमति, सहकार्य र एकता नै दिगो राष्ट्रिय शान्तिका अनिवार्य सर्त हुन्।"
            },
            bio: { en: "", ne: "" },
            party: { en: "Nepali Congress", ne: "नेपाली कांग्रेस" },
            position: { en: "Five-Time Prime Minister", ne: "पूर्व प्रधानमन्त्री (पाँच पटक)" },
            years: { en: "1925 – 2010", ne: "१९२५ – २०१०" },
            image: "/images/leaders/girija-prasad-koirala.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 2210,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Girija_Prasad_Koirala"
                }
            ]
        },
        {
            slug: "ram-raja-prasad-singh",
            name: { en: "Ram Raja Prasad Singh", ne: "रामराजा प्रसाद सिंह" },
            desc: {
                en: "Pioneering republican thinker and legal scholar who advocated for a sovereign democratic republic decades before the 2008 declaration.",
                ne: "गणतन्त्रका प्रथम प्रणेता एवं संविधानविद्, जसले २०६५ को घोषणाभन्दा दशकौँ अघि लोकतान्त्रिक गणतन्त्रको आधारशिला राखे।"
            },
            quote: {
                en: "Sovereignty is inherent in the citizens and cannot be alienated by crown or decree.",
                ne: "सार्वभौमसत्ता जनतामा निहित हुन्छ, जसलाई कुनै राजमुकुट वा उर्दीले हरण गर्न सक्दैन।"
            },
            bio: { en: "", ne: "" },
            party: { en: "Nepal Janabadi Morcha", ne: "नेपाल जनवादी मोर्चा" },
            position: { en: "Pioneer of Republican Movement", ne: "गणतन्त्र आन्दोलनका प्रणेता" },
            years: { en: "1936 – 2012", ne: "१९३६ – २०१२" },
            image: "/images/leaders/ram-raja-prasad-singh.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 1420,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Ram_Raja_Prasad_Singh"
                }
            ]
        },
        {
            slug: "tribhuvan-shah",
            name: { en: "King Tribhuvan", ne: "राजा त्रिभुवन" },
            desc: {
                en: "Monarch who allied with democratic forces and Nepali Congress in 1951 to dismantle the 104-year autocratic Rana regime.",
                ne: "१०४ वर्षे जहानियाँ राणा शासन अन्त्य गर्न २००७ सालमा प्रजातान्त्रिक आन्दोलनसँग सहकार्य गर्ने राजा।"
            },
            quote: {
                en: "The governance of Nepal shall henceforth be conducted according to a constitution framed by an elected constituent assembly.",
                ne: "नेपालको शासन व्यवस्था अब उप्रान्त जनताद्वारा निर्वाचित संविधान सभाले बनाएको विधान बमोजिम हुनेछ।"
            },
            bio: { en: "", ne: "" },
            party: { en: "Constitutional Crown (1951)", ne: "संवैधानिक राजसंस्था" },
            position: { en: "King of Nepal (1911–1955)", ne: "नेपालका राजा (१९६८–२०११ वि.सं.)" },
            years: { en: "1906 – 1955", ne: "१९०६ – १९५५" },
            image: "/images/leaders/tribhuvan-shah.png",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 1750,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Tribhuvan_of_Nepal"
                }
            ]
        },
        {
            slug: "prithvi-narayan",
            name: { en: "Prithvi Narayan Shah", ne: "पृथ्वीनारायण शाह" },
            desc: {
                en: "Founder and unifier of modern Nepal whose strategic statecraft consolidated fragmented principalities into a sovereign Himalayan nation.",
                ne: "आधुनिक नेपालका निर्माता तथा एकीकरणकर्ता, जसले बाइसे-चौबिसे राज्यहरूलाई एकताबद्ध गरी सार्वभौम राज्यको जग बसाले।"
            },
            quote: {
                en: "Nepal is a garden of four castes and thirty-six ethnic groups.",
                ne: "नेपाल चार वर्ण छत्तीस जातको साझा फूलबारी हो।"
            },
            bio: { en: "", ne: "" },
            party: { en: "National Unification", ne: "राष्ट्रिय एकीकरण" },
            position: { en: "Unifier of Modern Nepal", ne: "आधुनिक नेपालका निर्माता" },
            years: { en: "1723 – 1775", ne: "१७२३ – १७७५" },
            image: "/images/leaders/prithvi-narayan.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 3100,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Prithvi_Narayan_Shah"
                }
            ]
        },
        {
            slug: "bhimsen-thapa",
            name: { en: "Bhimsen Thapa", ne: "भीमसेन थापा" },
            desc: {
                en: "Longest-serving Mukhtiyar (Prime Minister) who modernized Nepal's defense forces, administrative architecture, and public monuments.",
                ne: "नेपालका पहिलो आधुनिक मुख्तियार (प्रधानमन्त्री), जसले प्रशासनिक सुधार, धरहरा निर्माण र सैन्य आधुनिकीकरणको नेतृत्व गरे।"
            },
            quote: {
                en: "Our sovereignty cannot be compromised by foreign pressure or treaty.",
                ne: "हाम्रो राष्ट्रिय स्वाभिमान कुनै बाह्य दबाब वा सन्धिबाट खण्डित हुन सक्दैन।"
            },
            bio: { en: "", ne: "" },
            party: { en: "Early Statecraft", ne: "प्रारम्भिक प्रशासनिक नेतृत्व" },
            position: { en: "Mukhtiyar (Prime Minister 1806–1837)", ne: "मुख्तियार / प्रधानमन्त्री (१८६३–१८९४ वि.सं.)" },
            years: { en: "1775 – 1839", ne: "१७७५ – १८३९" },
            image: "/images/leaders/bhimsen-thapa.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 1880,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Bhimsen_Thapa"
                }
            ]
        },
        {
            slug: "king-birendra-bir-bikram-shah-dev",
            name: { en: "King Birendra", ne: "राजा वीरेन्द्र" },
            desc: {
                en: "Monarch who accepted the popular verdict of the 1990 Movement, promulgating the multiparty democratic constitution and Zone of Peace proposal.",
                ne: "२०४६ को जनआन्दोलनको भावनालाई स्वीकार गरी बहुदलीय प्रजातान्त्रिक संविधान जारी गर्ने तथा शान्ति क्षेत्र प्रस्तावका प्रणेता।"
            },
            quote: {
                en: "Let Nepal be declared a Zone of Peace.",
                ne: "नेपाललाई शान्ति क्षेत्र घोषणा गरियोस्।"
            },
            bio: { en: "", ne: "" },
            party: { en: "Constitutional Monarchy (1990)", ne: "संवैधानिक राजसंस्था" },
            position: { en: "King of Nepal (1972–2001)", ne: "नेपालका राजा (२०२८–२०५८ वि.सं.)" },
            years: { en: "1945 – 2001", ne: "१९४५ – २००१" },
            image: "/images/leaders/king-birendra-bir-bikram-shah-dev.jpg",
            cover: "",
            stats: {},
            timeline: [],
            status: "published",
            isFeatured: true,
            isActive: false,
            views: 2650,
            dataSources: [
                {
                    title: "Wikipedia Biographical Archive",
                    url: "https://en.wikipedia.org/wiki/Birendra_of_Nepal"
                }
            ]
        }
    ], []);

    // Prioritize Nepal's founding democratic and historical statesmen
    const sortedList = useMemo(() => {
        const priorityOrder: Record<string, number> = {
            "bp-koirala": 1,
            "pushpa-lal-shrestha": 2,
            "ganesh-man-singh": 3,
            "man-mohan-adhikari": 4,
            "krishna-prasad-bhattarai": 5,
            "madan-bhandari": 6,
            "madan-kumar-bhandari": 6,
            "girija-prasad-koirala": 7,
            "ram-raja-prasad-singh": 8,
            "tribhuvan-shah": 9,
            "king-birendra-bir-bikram-shah-dev": 10,
            "prithvi-narayan": 11,
            "bhimsen-thapa": 12,
            "mahendra-bir-bikram-shah-dev": 13,
        };

        const base = leaders.length >= 4 ? leaders : fallbackLeaders;
        return [...base].sort((a, b) => {
            const orderA = priorityOrder[a.slug] ?? (a.order || 99);
            const orderB = priorityOrder[b.slug] ?? (b.order || 99);
            return orderA - orderB;
        });
    }, [leaders, fallbackLeaders]);

    // Filter leaders based on tab - loads a single row of 4 leaders
    const filteredLeaders = useMemo(() => {
        if (filter === "all") return sortedList.slice(0, 4);
        if (filter === "democratic") {
            return sortedList.filter(l => {
                const party = resolve(l.party).toLowerCase();
                const pos = resolve(l.position).toLowerCase();
                return party.includes("congress") || party.includes("democratic") || party.includes("कांग्रेस") || party.includes("प्रजातान्त्रिक") || pos.includes("1951");
            }).slice(0, 4);
        }
        if (filter === "left") {
            return sortedList.filter(l => {
                const party = resolve(l.party).toLowerCase();
                return party.includes("communist") || party.includes("uml") || party.includes("cpn") || party.includes("कम्युनिस्ट") || party.includes("एमाले") || party.includes("जनवादी");
            }).slice(0, 4);
        }
        if (filter === "constitutional") {
            return sortedList.filter(l => {
                const pos = resolve(l.position).toLowerCase();
                const desc = resolve(l.desc).toLowerCase();
                const party = resolve(l.party).toLowerCase();
                return pos.includes("prime minister") || pos.includes("king") || party.includes("constitutional") || party.includes("संवैधानिक") || desc.includes("constitution") || desc.includes("संविधान") || desc.includes("प्रधानमन्त्री");
            }).slice(0, 4);
        }
        return sortedList.slice(0, 4);
    }, [sortedList, filter, isNepali]);

    // Dignified initials mapping for archival seals
    const getLeaderMonogram = (slug: string, name: string) => {
        const monogramMapEn: Record<string, string> = {
            "bp-koirala": "BPK",
            "pushpa-lal-shrestha": "PLS",
            "ganesh-man-singh": "GMS",
            "man-mohan-adhikari": "MMA",
            "krishna-prasad-bhattarai": "KPB",
            "madan-bhandari": "MB",
            "madan-kumar-bhandari": "MB",
            "girija-prasad-koirala": "GPK",
            "ram-raja-prasad-singh": "RRPS",
            "tribhuvan-shah": "TRB",
            "prithvi-narayan": "PNS",
            "bhimsen-thapa": "BST",
            "king-birendra-bir-bikram-shah-dev": "BRN",
            "mahendra-bir-bikram-shah-dev": "MHD",
        };
        const monogramMapNe: Record<string, string> = {
            "bp-koirala": "वि.पी.",
            "pushpa-lal-shrestha": "पुष्पलाल",
            "ganesh-man-singh": "गणेशमान",
            "man-mohan-adhikari": "मनमोहन",
            "krishna-prasad-bhattarai": "किशुनजी",
            "madan-bhandari": "मदन",
            "madan-kumar-bhandari": "मदन",
            "girija-prasad-koirala": "गिरिजा",
            "ram-raja-prasad-singh": "रामराजा",
            "tribhuvan-shah": "त्रिभुवन",
            "prithvi-narayan": "पृथ्वी",
            "bhimsen-thapa": "भीमसेन",
            "king-birendra-bir-bikram-shah-dev": "वीरेन्द्र",
            "mahendra-bir-bikram-shah-dev": "महेन्द्र",
        };

        if (isNepali && monogramMapNe[slug]) return monogramMapNe[slug];
        if (monogramMapEn[slug]) return monogramMapEn[slug];

        // Generic fallback initials
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 3).toUpperCase();
    };

    return (
        <section id="political-architects" className="py-14 bg-background border-b border-border">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Section Header - Stepped down size for visual rhythm */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-foreground pb-4 mb-6 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-foreground/80 flex items-center gap-1.5">
                            <Landmark size={13} className="text-foreground/80" />
                            {isNepali ? "ऐतिहासिक नेतृत्व · जीवनी अभिलेख" : "HISTORIC LEADERS · BIOGRAPHY ARCHIVE"}
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                            {isNepali ? "प्रजातान्त्रिक नेपालका वास्तुकारहरू" : "Architects of Democratic Nepal"}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                            {isNepali
                                ? "राणा विरोधी आन्दोलन, पञ्चायत विरुद्धको संघर्ष, र गणतान्त्रिक संविधान निर्माणमा नेतृत्वदायी भूमिका निर्वाह गर्ने ऐतिहासिक व्यक्तित्वहरूको आधिकारिक अभिलेख।"
                                : "Verified biographical records of statesmen who shaped Nepal’s 1951 revolution, parliamentary milestones, and constitutional transitions."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href="/leaders"
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-foreground hover:underline uppercase tracking-wider"
                        >
                            <span>{isNepali ? "सबै २८ नेताहरूको सूची" : "Explore All 28 Profiles"}</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {/* Filter Tabs Bar */}
                <div className="flex items-center justify-between gap-4 mb-8 overflow-x-auto pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                                filter === "all"
                                    ? "text-foreground border-b-2 border-foreground font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {isNepali ? "सबै नेताहरू (All)" : "All Leaders"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter("democratic")}
                            className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                                filter === "democratic"
                                    ? "text-foreground border-b-2 border-foreground font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {isNepali ? "प्रजातान्त्रिक आन्दोलन" : "Democratic Movement"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter("left")}
                            className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                                filter === "left"
                                    ? "text-foreground border-b-2 border-foreground font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {isNepali ? "वामपन्थी आन्दोलन" : "Progressive & Left"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter("constitutional")}
                            className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                                filter === "constitutional"
                                    ? "text-foreground border-b-2 border-foreground font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {isNepali ? "संवैधानिक नेतृत्व" : "Constitutional Leaders"}
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground shrink-0">
                        <ShieldCheck size={12} className="text-foreground/75" />
                        <span>{isNepali ? "प्रमाणित ऐतिहासिक जीवनी" : "VERIFIED HISTORICAL ARCHIVE"}</span>
                    </div>
                </div>

                {/* Single Row of 4 Archival Leaders (4 cols on lg, 2 on sm, 1 on mobile) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/40 gap-6 lg:gap-0">
                    {filteredLeaders.map((leader, idx) => {
                        const name = resolve(leader.name);
                        const desc = resolve(leader.desc);
                        const position = resolve(leader.position);
                        const years = resolve(leader.years);
                        const party = resolve(leader.party);
                        const quote = (leader as any).quote ? resolve((leader as any).quote) : "";
                        const monogram = getLeaderMonogram(leader.slug, name);

                        // Resolve authentic portrait image (prefer verified local archive portrait)
                        const portraitImage = (leader.image && !leader.image.includes("unsplash") && !leader.image.includes("placeholder"))
                            ? leader.image
                            : LEADER_PORTRAIT_MAP[leader.slug] || "";

                        // Resolve Wikipedia archival link
                        const wikiUrl = (leader.dataSources && leader.dataSources[0]?.url)
                            || LEADER_WIKI_MAP[leader.slug]
                            || `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/\s+/g, "_"))}`;

                        return (
                            <article 
                                key={leader.slug || idx} 
                                className={`flex flex-col justify-between group ${
                                    idx === 0 
                                        ? "lg:pr-5 pb-6 sm:pb-0" 
                                        : idx === 3 
                                        ? "lg:pl-5 pt-6 sm:pt-0" 
                                        : "lg:px-5 py-6 sm:py-0"
                                }`}
                            >
                                <div>
                                    {/* Archival Portrait Plate (Clean hairline frame, zero floating badge clutter) */}
                                    <Link 
                                        href={`/leaders/${leader.slug}`} 
                                        className="block overflow-hidden rounded-2xs bg-muted relative aspect-[4/5] border border-border/60 group-hover:border-foreground/50 transition-all shadow-2xs"
                                    >
                                        {portraitImage ? (
                                            <>
                                                <Image
                                                    src={portraitImage}
                                                    alt={name}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                    className="object-cover object-top filter grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                                <div className="w-16 h-16 rounded-full border border-foreground/30 bg-muted/40 flex flex-col items-center justify-center shadow-2xs mb-2 transition-transform duration-300 group-hover:scale-105">
                                                    <span className="font-serif font-black text-base text-foreground tracking-wider uppercase leading-none">
                                                        {monogram}
                                                    </span>
                                                    <span className="text-[7px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                                                        RECORD
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                                                    {isNepali ? "ऐतिहासिक अभिलेख" : "HISTORICAL RECORD"}
                                                </span>
                                            </div>
                                        )}
                                    </Link>

                                    {/* Metadata Bar below portrait */}
                                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase pt-2.5 pb-1 border-b border-border/30">
                                        <span className="font-semibold text-foreground/80 truncate max-w-[130px]">
                                            {party || (isNepali ? "स्वतन्त्र" : "Independent")}
                                        </span>
                                        <span>{years}</span>
                                    </div>

                                    {/* Leader Information Body */}
                                    <div className="pt-2 flex flex-col gap-1.5">
                                        <Link href={`/leaders/${leader.slug}`} className="block">
                                            <h3 className="font-serif text-lg font-bold text-foreground group-hover:underline underline-offset-2 transition-colors leading-snug">
                                                {name}
                                            </h3>
                                        </Link>

                                        {position && (
                                            <span className="text-[11.5px] font-medium text-muted-foreground leading-normal line-clamp-1">
                                                {position}
                                            </span>
                                        )}

                                        <p className="text-[12.5px] text-foreground/80 line-clamp-2 leading-relaxed mt-0.5">
                                            {desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer: Profile + Wikipedia Archive Link */}
                                <div className="pt-2.5 mt-3 border-t border-border/30 flex items-center justify-between gap-2 text-xs">
                                    <Link 
                                        href={`/leaders/${leader.slug}`}
                                        className="inline-flex items-center gap-1 font-bold text-foreground hover:underline uppercase tracking-wider text-[11px] truncate font-mono"
                                    >
                                        <span>{isNepali ? "विवरण" : "Profile"}</span>
                                        <ArrowRight size={10} className="shrink-0" />
                                    </Link>
                                    {wikiUrl && (
                                        <a
                                            href={wikiUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:underline uppercase tracking-wider shrink-0"
                                            title={isNepali ? "विकिपिडिया ऐतिहासिक स्रोत" : "Wikipedia historical archive"}
                                        >
                                            <span>{isNepali ? "विकिपिडिया" : "Wikipedia"}</span>
                                            <ExternalLink size={9} className="shrink-0" />
                                        </a>
                                    )}
                                </div>

                            </article>
                        );
                    })}
                </div>

                {/* Broadsheet Holdings Catalog Band (Clean horizontal rule, no rounded card box) */}
                <div className="mt-10 pt-5 border-t-2 border-foreground/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xs bg-foreground text-background grid place-items-center shrink-0">
                            <Library size={16} />
                        </div>
                        <div>
                            <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted-foreground font-semibold block">
                                {isNepali ? "द लिडर्स ऐतिहासिक अभिलेख संग्रह" : "THE LEADERS DEMOCRATIC ARCHIVE"}
                            </span>
                            <span className="text-xs sm:text-sm font-serif font-bold text-foreground">
                                {isNepali 
                                    ? "२८ ऐतिहासिक नेताहरू · ५००+ दुर्लभ दस्तावेजहरू · संसद तथा आन्दोलनका महत्त्वपूर्ण सन्धिहरू" 
                                    : "28 Historical Profiles · 500+ Official Documents · Parliamentary Transcripts & Accords"}
                            </span>
                        </div>
                    </div>

                    <Link
                        href="/leaders"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs border border-foreground bg-foreground text-background hover:bg-foreground/90 transition-colors text-xs font-bold uppercase tracking-wider whitespace-nowrap font-mono shadow-2xs"
                    >
                        <span>{isNepali ? "सबै प्रोफाइल हेर्नुहोस्" : "Browse All Profiles"}</span>
                        <ArrowRight size={11} />
                    </Link>
                </div>

            </div>
        </section>
    );
}
