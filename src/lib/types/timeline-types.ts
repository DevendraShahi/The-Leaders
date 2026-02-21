export interface TimelineEvent {
    event_id: number;
    date_gregorian: string;
    date_nepali: string;
    time: string;
    timezone: string;
    event_headline: string;
    event_category: string;
    actors_involved: string[];
    location: string;
    brief_description: string;
    source_publication: string;
    source_url: string;
    source_date: string;
    confidence_level: string;
    related_events?: number[];
    keywords: string[];
}

export interface DayGroup {
    date: string; // YYYY-MM-DD
    day: number;
    month: string;
    nepaliDate: string;
    events: TimelineEvent[];
}

export interface MonthGroup {
    monthKey: string; // YYYY-MM
    monthName: string;
    year: number;
    days: DayGroup[];
}

export interface TimelineData {
    metadata: {
        generation_timestamp: string;
        total_event_count: number;
        date_range_covered: string;
        coverage_gaps: string[];
        data_source: string;
    };
    timeline_events: TimelineEvent[];
}
