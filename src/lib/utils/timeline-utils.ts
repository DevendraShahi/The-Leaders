import { TimelineEvent, MonthGroup, DayGroup, TimelineData } from "@/lib/types/timeline-types";

export function groupTimelineData(data: TimelineData): MonthGroup[] {
    const events = data.timeline_events;
    const groups: { [key: string]: MonthGroup } = {};

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => {
        return new Date(a.date_gregorian).getTime() - new Date(b.date_gregorian).getTime();
    });

    sortedEvents.forEach((event) => {
        const date = new Date(event.date_gregorian);
        const year = date.getFullYear();
        const monthIndex = date.getMonth();
        const monthName = date.toLocaleString('default', { month: 'long' });
        const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
        const day = date.getDate();
        const dateKey = event.date_gregorian;

        // Initialize Month Group
        if (!groups[monthKey]) {
            groups[monthKey] = {
                monthKey,
                monthName,
                year,
                days: [],
            };
        }

        // Find or Create Day Group within Month
        let dayGroup = groups[monthKey].days.find((d) => d.date === dateKey);
        if (!dayGroup) {
            dayGroup = {
                date: dateKey,
                day,
                month: monthName,
                nepaliDate: event.date_nepali,
                events: [],
            };
            groups[monthKey].days.push(dayGroup);
        }

        // Add Event to Day
        dayGroup.events.push(event);
    });

    // Convert object to array and sort months
    return Object.values(groups).sort((a, b) => {
        return a.monthKey.localeCompare(b.monthKey);
    });
}

export function formatTime(time: string): string {
    if (!time || time.toLowerCase() === "time unknown") return "All Day";
    return time;
}
