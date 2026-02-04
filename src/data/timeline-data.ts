
export interface TimelineEpisode {
    id: string;
    title: string;
    description: string;
    year: string;
    image?: string;
}

export interface TimelineSeries {
    id: string;
    title: string;
    description: string;
    period: string;
    episodes: TimelineEpisode[];
    wikipediaTopic?: string;
}

// Nepal political history series definitions
export const timelineData: TimelineSeries[] = [
    {
        id: 'ancient-kingdom',
        title: 'Ancient Kingdoms',
        description: 'The formation of early dynasties and the unification of Nepal under the Malla kings.',
        period: 'Before 1769',
        wikipediaTopic: 'History_of_Nepal',
        episodes: [
            {
                id: 'ancient-episode-1',
                title: 'Kirat Period',
                description: 'The earliest recorded rulers of the Kathmandu valley, known for their cultural and religious contributions.',
                year: '800 BCE - 300 CE'
            },
            {
                id: 'ancient-episode-2',
                title: 'Licchavi Kingdom',
                description: 'A golden age of art, architecture, and trade that established Nepal as a significant power in South Asia.',
                year: '400 - 750 CE'
            },
            {
                id: 'ancient-episode-3',
                title: 'Malla Confederation',
                description: 'Three rival kingdoms in Kathmandu valley that competed in art, architecture, and culture.',
                year: '1200 - 1769 CE'
            },
            {
                id: 'ancient-episode-4',
                title: 'Unification Begins',
                description: 'Prithvi Narayan Shah starts the campaign to unify Nepal from Gorkha.',
                year: '1743'
            },
            {
                id: 'ancient-episode-5',
                title: 'Battle of Kirtipur',
                description: 'A decisive battle that marked the beginning of Malla dynasty\'s end.',
                year: '1767'
            }
        ]
    },
    {
        id: 'shah-dynasty',
        title: 'Shah Dynasty',
        description: 'The rise of the Shah dynasty and the unification of Nepal by Prithvi Narayan Shah.',
        period: '1769-1846',
        wikipediaTopic: 'Shah_dynasty',
        episodes: [
            {
                id: 'shah-episode-1',
                title: 'Unification of Nepal',
                description: 'Prithvi Narayan Shah completes the unification of Nepal, establishing the Shah dynasty.',
                year: '1768'
            },
            {
                id: 'shah-episode-2',
                title: 'Anglo-Nepalese War',
                description: 'War with the British East India Company that defined Nepal\'s modern boundaries.',
                year: '1814 - 1816'
            },
            {
                id: 'shah-episode-3',
                title: 'Sugauli Treaty',
                description: 'Treaty that established Nepal\'s current boundaries and lost significant territories.',
                year: '1816'
            },
            {
                id: 'shah-episode-4',
                title: 'Kot Massacre',
                description: 'A pivotal event that led to the rise of Jung Bahadur Rana and the decline of royal power.',
                year: '1846'
            }
        ]
    },
    {
        id: 'rana-regime',
        title: 'Rana Regime',
        description: 'The autocratic rule of the Rana dynasty that isolated Nepal for over a century.',
        period: '1846-1951',
        wikipediaTopic: 'Rana_dynasty',
        episodes: [
            {
                id: 'rana-episode-1',
                title: 'Establishment of Rana Rule',
                description: 'Jung Bahadur Rana establishes the hereditary prime ministership, reducing kings to figureheads.',
                year: '1846'
            },
            {
                id: 'rana-episode-2',
                title: 'Isolation Policy',
                description: 'Nepal remains closed to outside influence, earning the name "Hermit Kingdom".',
                year: '1850 - 1900'
            },
            {
                id: 'rana-episode-3',
                title: 'Visit to England',
                description: 'Prime Minister Chandra Shumsher visits Britain, marking the beginning of modernization.',
                year: '1908'
            },
            {
                id: 'rana-episode-4',
                title: 'Educational Reforms',
                description: 'Introduction of formal education and limited modernization programs.',
                year: '1910 - 1940'
            },
            {
                id: 'rana-episode-5',
                title: 'World War II',
                description: 'Nepalese Gurkha troops fight alongside the British, gaining international recognition.',
                year: '1939 - 1945'
            },
            {
                id: 'rana-episode-6',
                title: 'Democracy Movement Begins',
                description: 'Formation of Nepali Congress and start of pro-democracy movements.',
                year: '1947'
            }
        ]
    },
    {
        id: 'democratic-movement',
        title: 'Democratic Movement',
        description: 'The 1951 revolution that ended Rana rule and established constitutional monarchy.',
        period: '1951-1990',
        wikipediaTopic: '1951_Nepalese_revolution',
        episodes: [
            {
                id: 'democratic-episode-1',
                title: 'Revolution of 1951',
                description: 'Joint movement by Nepali Congress and King Tribhuvan ends Rana rule.',
                year: '1951'
            },
            {
                id: 'democratic-episode-2',
                title: 'First Parliamentary Elections',
                description: 'Nepal\'s first democratic elections under the 1959 constitution.',
                year: '1959'
            },
            {
                id: 'democratic-episode-3',
                title: 'Royal Coup',
                description: 'King Mahendra dismisses the government and begins direct rule.',
                year: '1960'
            },
            {
                id: 'democratic-episode-4',
                title: 'Panchayat System',
                description: 'Establishment of party-less system under royal guidance.',
                year: '1961'
            },
            {
                id: 'democratic-episode-5',
                title: 'Referendum 1980',
                description: 'Referendum to choose between Panchayat system and multi-party democracy.',
                year: '1980'
            },
            {
                id: 'democratic-episode-6',
                title: 'Jana Andolan I',
                description: 'People\'s movement that restores multi-party democracy.',
                year: '1990'
            }
        ]
    },
    {
        id: 'constitutional-monarchy',
        title: 'Constitutional Era',
        description: 'The period of constitutional monarchy marked by political instability and Maoist insurgency.',
        period: '1990-2008',
        wikipediaTopic: 'Nepalese_Civil_War',
        episodes: [
            {
                id: 'constitutional-episode-1',
                title: 'New Constitution',
                description: 'Promulgation of the 1990 constitution establishing constitutional monarchy.',
                year: '1990'
            },
            {
                id: 'constitutional-episode-2',
                title: 'First Post-Democracy Elections',
                description: 'Nepali Congress wins majority in first elections after 1990 restoration.',
                year: '1991'
            },
            {
                id: 'constitutional-episode-3',
                title: 'Maoist Insurgency Begins',
                description: 'Launch of "People\'s War" by CPN (Maoist) that led to a decade-long conflict.',
                year: '1996'
            },
            {
                id: 'constitutional-episode-4',
                title: 'Royal Massacre',
                description: 'Tragic event at Narayanhiti Palace that leads to King Gyananda\'s ascension.',
                year: '2001'
            },
            {
                id: 'constitutional-episode-5',
                title: 'State of Emergency',
                description: 'Declaration of emergency and deployment of army against Maoist rebels.',
                year: '2001'
            },
            {
                id: 'constitutional-episode-6',
                title: 'Jana Andolan II',
                description: 'Second people\'s movement that forces the king to reinstate parliament.',
                year: '2006'
            },
            {
                id: 'constitutional-episode-7',
                title: 'Peace Agreement',
                description: 'Comprehensive Peace Accord ending the decade-long Maoist insurgency.',
                year: '2006'
            }
        ]
    },
    {
        id: 'federal-republic',
        title: 'Federal Republic',
        description: 'The establishment of Nepal as a federal democratic republic after abolishing the monarchy.',
        period: '2008-Present',
        wikipediaTopic: 'Federal_Democratic_Republic_of_Nepal',
        episodes: [
            {
                id: 'federal-episode-1',
                title: 'Constituent Assembly Elections',
                description: 'Historic elections that led to the abolition of monarchy.',
                year: '2008'
            },
            {
                id: 'federal-episode-2',
                title: 'Abolition of Monarchy',
                description: 'Nepal becomes a federal democratic republic.',
                year: '2008'
            },
            {
                id: 'federal-episode-3',
                title: 'Constitution Drafting',
                description: 'Years of deliberation and negotiations for a new constitution.',
                year: '2008 - 2015'
            },
            {
                id: 'federal-episode-4',
                title: 'Constitution Promulgated',
                description: 'Adoption of the new constitution establishing federal structure.',
                year: '2015'
            },
            {
                id: 'federal-episode-5',
                title: 'Federal Implementation',
                description: 'Establishment of provincial governments and local governance.',
                year: '2017'
            },
            {
                id: 'federal-episode-6',
                title: 'Election 2026',
                description: 'Upcoming general elections that will shape Nepal\'s future.',
                year: '2026'
            }
        ]
    }
];
