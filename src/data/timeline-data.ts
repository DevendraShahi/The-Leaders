
export interface LocalizedText {
    en: string;
    ne: string;
}

export interface TimelineEpisode {
    id: string;
    title: LocalizedText;
    description: LocalizedText;
    year: string;
    image?: string;
}

export interface TimelineSeries {
    id: string;
    title: LocalizedText;
    description: LocalizedText;
    period: LocalizedText;
    episodes: TimelineEpisode[];
    wikipediaTopic?: string;
}

export const timelineData: TimelineSeries[] = [
    {
        id: "ancient-kingdom",
        title: { en: "Ancient Kingdoms", ne: "प्राचीन राज्यहरू" },
        description: {
            en: "The rise of early dynasties and the political groundwork that preceded modern Nepal.",
            ne: "प्रारम्भिक वंशहरूको उदय र आधुनिक नेपालअघिको राजनीतिक आधार निर्माण।",
        },
        period: { en: "Before 1769", ne: "१७६९ भन्दा पहिले" },
        wikipediaTopic: "History_of_Nepal",
        episodes: [
            {
                id: "ancient-episode-1",
                title: { en: "Kirat Period", ne: "किरात काल" },
                description: {
                    en: "Among the earliest known rulers of the Kathmandu Valley with enduring cultural influence.",
                    ne: "काठमाडौं उपत्यकाका प्रारम्भिक ज्ञात शासकहरू जसको सांस्कृतिक प्रभाव दीर्घकालीन रह्यो।",
                },
                year: "800 BCE - 300 CE",
            },
            {
                id: "ancient-episode-2",
                title: { en: "Licchavi Kingdom", ne: "लिच्छवि राज्य" },
                description: {
                    en: "A formative era of administration, art, trade, and statecraft in the valley.",
                    ne: "उपत्यकामा प्रशासन, कला, व्यापार र राज्य सञ्चालनको आधार बनाएको युग।",
                },
                year: "400 - 750 CE",
            },
            {
                id: "ancient-episode-3",
                title: { en: "Malla Confederation", ne: "मल्ल महासंघ" },
                description: {
                    en: "Rival city-states advanced architecture and culture while competing for dominance.",
                    ne: "प्रतिस्पर्धी नगर राज्यहरूले प्रभुत्वको प्रतिस्पर्धासँगै वास्तुकला र संस्कृतिलाई उचाइमा पुर्याए।",
                },
                year: "1200 - 1769 CE",
            },
            {
                id: "ancient-episode-4",
                title: { en: "Unification Begins", ne: "एकीकरणको सुरुवात" },
                description: {
                    en: "Prithvi Narayan Shah launched the campaign from Gorkha toward territorial unification.",
                    ne: "पृथ्वीनारायण शाहले गोरखाबाट भौगोलिक एकीकरणको अभियान सुरु गरे।",
                },
                year: "1743",
            },
            {
                id: "ancient-episode-5",
                title: { en: "Battle of Kirtipur", ne: "कीर्तिपुरको युद्ध" },
                description: {
                    en: "A crucial military turning point in the decline of Malla-era autonomy.",
                    ne: "मल्लकालीन स्वायत्तताको क्षयमा निर्णायक सैन्य मोड बनेको संघर्ष।",
                },
                year: "1767",
            },
        ],
    },
    {
        id: "shah-dynasty",
        title: { en: "Shah Dynasty", ne: "शाह वंश" },
        description: {
            en: "The consolidation of the Shah state and the expansion of unified rule.",
            ne: "शाह राज्यको सुदृढीकरण र एकीकृत शासनको विस्तार।",
        },
        period: { en: "1769-1846", ne: "१७६९-१८४६" },
        wikipediaTopic: "Shah_dynasty",
        episodes: [
            {
                id: "shah-episode-1",
                title: { en: "Unification of Nepal", ne: "नेपाल एकीकरण" },
                description: {
                    en: "The unification campaign culminated in a centralized Shah monarchy.",
                    ne: "एकीकरण अभियानको परिणामस्वरूप केन्द्रीकृत शाह राजतन्त्र स्थापित भयो।",
                },
                year: "1768",
            },
            {
                id: "shah-episode-2",
                title: { en: "Anglo-Nepalese War", ne: "अंग्रेज-नेपाल युद्ध" },
                description: {
                    en: "Conflict with the East India Company reshaped Nepal's strategic boundaries.",
                    ne: "इस्ट इन्डिया कम्पनीसँगको युद्धले नेपालको रणनीतिक सीमारेखा पुनर्परिभाषित गर्‍यो।",
                },
                year: "1814 - 1816",
            },
            {
                id: "shah-episode-3",
                title: { en: "Sugauli Treaty", ne: "सुगौली सन्धि" },
                description: {
                    en: "The treaty formalized territorial losses and set the foundation of modern borders.",
                    ne: "यस सन्धिले भू-क्षेत्रीय क्षति औपचारिक गर्दै आधुनिक सीमाको आधार तय गर्‍यो।",
                },
                year: "1816",
            },
            {
                id: "shah-episode-4",
                title: { en: "Kot Massacre", ne: "कोत पर्व" },
                description: {
                    en: "A violent power shift opened the door to Rana dominance.",
                    ne: "हिंसात्मक सत्ता परिवर्तनले राणा प्रभुत्वको ढोका खोल्यो।",
                },
                year: "1846",
            },
        ],
    },
    {
        id: "rana-regime",
        title: { en: "Rana Regime", ne: "राणा शासन" },
        description: {
            en: "A hereditary oligarchy concentrated executive power for over a century.",
            ne: "वंशानुगत कुलीन शासनले शताब्दीभन्दा बढी समय कार्यकारी शक्ति केन्द्रित गर्‍यो।",
        },
        period: { en: "1846-1951", ne: "१८४६-१९५१" },
        wikipediaTopic: "Rana_dynasty",
        episodes: [
            {
                id: "rana-episode-1",
                title: { en: "Rana Rule Established", ne: "राणा शासन स्थापना" },
                description: {
                    en: "The hereditary prime minister system reduced the monarchy to a symbolic role.",
                    ne: "वंशानुगत प्रधानमन्त्री व्यवस्थाले राजतन्त्रलाई प्रतीकात्मक भूमिकामा सीमित गर्‍यो।",
                },
                year: "1846",
            },
            {
                id: "rana-episode-2",
                title: { en: "Isolation Policy", ne: "एकान्त नीति" },
                description: {
                    en: "Restricted external engagement shaped Nepal's image as a closed state.",
                    ne: "बाह्य सम्पर्कमा प्रतिबन्धले नेपाललाई बन्द राज्यको छवि दियो।",
                },
                year: "1850 - 1900",
            },
            {
                id: "rana-episode-3",
                title: { en: "Visit to Britain", ne: "बेलायत भ्रमण" },
                description: {
                    en: "High-level foreign exposure accelerated debate on selective modernization.",
                    ne: "उच्चस्तरीय विदेशी सम्पर्कले सीमित आधुनिकीकरणबारे बहसलाई गति दियो।",
                },
                year: "1908",
            },
            {
                id: "rana-episode-4",
                title: { en: "Educational Reforms", ne: "शैक्षिक सुधार" },
                description: {
                    en: "Formal schooling expanded, though access remained unequal and controlled.",
                    ne: "औपचारिक शिक्षा विस्तार भयो, तर पहुँच असमान र नियन्त्रणयुक्त रह्यो।",
                },
                year: "1910 - 1940",
            },
            {
                id: "rana-episode-5",
                title: { en: "World War II", ne: "द्वितीय विश्वयुद्ध" },
                description: {
                    en: "Gurkha deployment increased Nepal's global military profile.",
                    ne: "गोर्खा तैनातीले नेपालको अन्तर्राष्ट्रिय सैनिक उपस्थिति बलियो बनायो।",
                },
                year: "1939 - 1945",
            },
            {
                id: "rana-episode-6",
                title: { en: "Democracy Movement Begins", ne: "लोकतान्त्रिक आन्दोलन सुरु" },
                description: {
                    en: "Opposition networks organized for representative politics and civil rights.",
                    ne: "प्रतिनिधिमूलक राजनीति र नागरिक अधिकारका लागि विपक्षी सञ्जालहरू संगठित हुन थाले।",
                },
                year: "1947",
            },
        ],
    },
    {
        id: "democratic-movement",
        title: { en: "Democratic Movement", ne: "लोकतान्त्रिक आन्दोलन" },
        description: {
            en: "The transition period from Rana collapse to party politics and public mandate.",
            ne: "राणा पतनपछि दलीय राजनीति र जनम्यान्डेटतर्फको संक्रमणकाल।",
        },
        period: { en: "1951-1990", ne: "१९५१-१९९०" },
        wikipediaTopic: "1951_Nepalese_revolution",
        episodes: [
            {
                id: "democratic-episode-1",
                title: { en: "Revolution of 1951", ne: "१९५१ को क्रान्ति" },
                description: {
                    en: "The anti-Rana coalition restored the monarchy in a constitutional framework.",
                    ne: "राणा विरोधी गठबन्धनले संवैधानिक संरचनाभित्र राजसंस्था पुनर्स्थापित गर्‍यो।",
                },
                year: "1951",
            },
            {
                id: "democratic-episode-2",
                title: { en: "First Parliamentary Elections", ne: "पहिलो संसदीय निर्वाचन" },
                description: {
                    en: "Nepal held its first competitive parliamentary poll under the 1959 constitution.",
                    ne: "१९५९ को संविधानअन्तर्गत नेपालले पहिलो प्रतिस्पर्धी संसदीय निर्वाचन गर्‍यो।",
                },
                year: "1959",
            },
            {
                id: "democratic-episode-3",
                title: { en: "Royal Coup", ne: "राजकीय कू" },
                description: {
                    en: "Parliament was dismissed and executive authority was re-centralized.",
                    ne: "संसद विघटन गरियो र कार्यकारी अधिकार पुनः केन्द्रीकृत गरियो।",
                },
                year: "1960",
            },
            {
                id: "democratic-episode-4",
                title: { en: "Panchayat System", ne: "पञ्चायती व्यवस्था" },
                description: {
                    en: "A partyless political structure institutionalized top-down rule.",
                    ne: "दलीय प्रतिस्पर्धा बिना शीर्ष-केन्द्रित राजनीतिक संरचना संस्थागत बनाइयो।",
                },
                year: "1961",
            },
            {
                id: "democratic-episode-5",
                title: { en: "Referendum 1980", ne: "१९८० जनमतसंग्रह" },
                description: {
                    en: "A national vote tested competing models of governance under pressure.",
                    ne: "दबाबबीच शासनका प्रतिस्पर्धी मोडेलहरूबारे राष्ट्रिय मतदान सम्पन्न भयो।",
                },
                year: "1980",
            },
            {
                id: "democratic-episode-6",
                title: { en: "Jana Andolan I", ne: "जनआन्दोलन-१" },
                description: {
                    en: "Mass mobilization re-opened multi-party democratic space.",
                    ne: "जनआन्दोलनले बहुदलीय लोकतान्त्रिक स्थान पुनः खोल्यो।",
                },
                year: "1990",
            },
        ],
    },
    {
        id: "constitutional-monarchy",
        title: { en: "Constitutional Era", ne: "संवैधानिक काल" },
        description: {
            en: "A fragile democratic phase marked by insurgency, instability, and constitutional struggle.",
            ne: "विद्रोह, अस्थिरता र संवैधानिक संघर्षले चिनिएको अस्थिर लोकतान्त्रिक चरण।",
        },
        period: { en: "1990-2008", ne: "१९९०-२००८" },
        wikipediaTopic: "Nepalese_Civil_War",
        episodes: [
            {
                id: "constitutional-episode-1",
                title: { en: "New Constitution", ne: "नयाँ संविधान" },
                description: {
                    en: "The 1990 constitution formalized constitutional monarchy and rights discourse.",
                    ne: "१९९० को संविधानले संवैधानिक राजतन्त्र र अधिकार विमर्शलाई औपचारिकता दियो।",
                },
                year: "1990",
            },
            {
                id: "constitutional-episode-2",
                title: { en: "First Post-1990 Elections", ne: "१९९० पछिको पहिलो निर्वाचन" },
                description: {
                    en: "Competitive electoral politics resumed under restored parliamentary order.",
                    ne: "पुनर्स्थापित संसदीय व्यवस्थाअन्तर्गत प्रतिस्पर्धी निर्वाचन राजनीति पुनः सुरु भयो।",
                },
                year: "1991",
            },
            {
                id: "constitutional-episode-3",
                title: { en: "Maoist Insurgency Begins", ne: "माओवादी विद्रोहको सुरुवात" },
                description: {
                    en: "Armed conflict transformed state capacity, civil life, and national security.",
                    ne: "सशस्त्र द्वन्द्वले राज्य क्षमता, नागरिक जीवन र राष्ट्रिय सुरक्षामा गहिरो प्रभाव पार्‍यो।",
                },
                year: "1996",
            },
            {
                id: "constitutional-episode-4",
                title: { en: "Royal Massacre", ne: "राजदरबार हत्याकाण्ड" },
                description: {
                    en: "A national shock triggered succession crisis and deeper institutional distrust.",
                    ne: "राष्ट्रलाई स्तब्ध बनाएको घटनाले उत्तराधिकार संकट र संस्थाप्रति अविश्वास बढायो।",
                },
                year: "2001",
            },
            {
                id: "constitutional-episode-5",
                title: { en: "State of Emergency", ne: "संकटकाल घोषणा" },
                description: {
                    en: "Emergency powers expanded military deployment and constrained civic space.",
                    ne: "संकटकालीन अधिकारले सैनिक परिचालन विस्तार गर्‍यो र नागरिक स्वतन्त्रता संकुचित गर्‍यो।",
                },
                year: "2001",
            },
            {
                id: "constitutional-episode-6",
                title: { en: "Jana Andolan II", ne: "जनआन्दोलन-२" },
                description: {
                    en: "A broad civic coalition forced political reset and restored parliament.",
                    ne: "व्यापक नागरिक एकताले राजनीतिक पुनर्संरचना गराउँदै संसद पुनर्स्थापित गरायो।",
                },
                year: "2006",
            },
            {
                id: "constitutional-episode-7",
                title: { en: "Peace Agreement", ne: "शान्ति सम्झौता" },
                description: {
                    en: "The Comprehensive Peace Accord formally ended the armed conflict.",
                    ne: "व्यापक शान्ति सम्झौताले सशस्त्र द्वन्द्वलाई औपचारिक रूपमा अन्त्य गर्‍यो।",
                },
                year: "2006",
            },
        ],
    },
    {
        id: "federal-republic",
        title: { en: "Federal Republic", ne: "संघीय गणतन्त्र" },
        description: {
            en: "Nepal's current phase of federal democratic restructuring after monarchy abolition.",
            ne: "राजतन्त्र अन्त्यपछि संघीय लोकतान्त्रिक पुनर्संरचनाको वर्तमान चरण।",
        },
        period: { en: "2008-Present", ne: "२००८-वर्तमान" },
        wikipediaTopic: "Federal_Democratic_Republic_of_Nepal",
        episodes: [
            {
                id: "federal-episode-1",
                title: { en: "Constituent Assembly Elections", ne: "संविधानसभा निर्वाचन" },
                description: {
                    en: "Elections created a new mandate to redesign the state structure.",
                    ne: "निर्वाचनले राज्य संरचना पुनःनिर्माणका लागि नयाँ जनादेश सिर्जना गर्‍यो।",
                },
                year: "2008",
            },
            {
                id: "federal-episode-2",
                title: { en: "Abolition of Monarchy", ne: "राजतन्त्रको अन्त्य" },
                description: {
                    en: "Nepal formally transitioned from monarchy to federal democratic republic.",
                    ne: "नेपाल औपचारिक रूपमा राजतन्त्रबाट संघीय लोकतान्त्रिक गणतन्त्रमा रूपान्तरित भयो।",
                },
                year: "2008",
            },
            {
                id: "federal-episode-3",
                title: { en: "Constitution Drafting", ne: "संविधान निर्माण प्रक्रिया" },
                description: {
                    en: "Extended negotiations shaped identity, federalism, and institutional powers.",
                    ne: "लामो राजनीतिक वार्ताले पहिचान, संघीयता र संस्थागत अधिकारको ढाँचा तय गर्‍यो।",
                },
                year: "2008 - 2015",
            },
            {
                id: "federal-episode-4",
                title: { en: "Constitution Promulgated", ne: "संविधान जारी" },
                description: {
                    en: "The 2015 constitution established the federal framework and governance tiers.",
                    ne: "२०१५ को संविधानले संघीय ढाँचा र शासनका तहहरूलाई संस्थागत गर्‍यो।",
                },
                year: "2015",
            },
            {
                id: "federal-episode-5",
                title: { en: "Federal Implementation", ne: "संघीय कार्यान्वयन" },
                description: {
                    en: "Provincial and local governments began operating under the new system.",
                    ne: "नयाँ व्यवस्थाअन्तर्गत प्रदेश र स्थानीय सरकारहरू सञ्चालनमा आए।",
                },
                year: "2017",
            },
            {
                id: "federal-episode-6",
                title: { en: "Election 2026", ne: "निर्वाचन २०२६" },
                description: {
                    en: "A high-stakes electoral cycle expected to influence the next federal phase.",
                    ne: "अर्को संघीय चरणलाई प्रभावित गर्ने उच्च महत्त्वको निर्वाचन चक्र।",
                },
                year: "2026",
            },
        ],
    },
];
