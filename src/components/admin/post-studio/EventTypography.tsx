"use client";

/** One condensed foreground mark with three decorative outline repetitions. */
export function EventTypography({ value, wicket, nepali, paper, accent, className }: {
    value: string; wicket: boolean; nepali: boolean; paper: boolean; accent: string; className?: string;
}) {
    const ink = paper ? '#12282e' : '#fff9ed';
    const muted = paper ? '#40565b' : '#c6d1d6';
    const type = { fontFamily: nepali && !wicket ? 'Hind_700Bold' : 'Onest_700Bold', fontSize: wicket ? 186 : nepali ? 184 : 210, fontWeight: 700, textLength: wicket ? 164 : 128, lengthAdjust: 'spacingAndGlyphs' as const };
    return <svg className={className} viewBox={`0 0 ${wicket ? 260 : 220} 230`} role="img" aria-label={value} preserveAspectRatio="xMidYMid meet" data-event-letter={value}>
        {[3, 2, 1].map(step => <text key={step} {...type} x={24 + step * 18} y={215 - step * 15} fill="none" stroke={step === 1 ? accent : muted} strokeWidth={step === 1 ? 1.6 : 1} opacity={step === 3 ? .18 : step === 2 ? .34 : .65} aria-hidden="true">{value}</text>)}
        <text {...type} x="24" y="215" fill={ink} stroke={ink} strokeWidth=".6" aria-hidden="true">{value}</text>
    </svg>;
}
