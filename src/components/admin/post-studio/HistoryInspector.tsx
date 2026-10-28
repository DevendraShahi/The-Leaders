"use client";

import { useEffect, useState } from 'react';
import { historyFieldLabels, historyPromptFields, historyStamp, historyTemplate, type HistoryFieldId } from '@/lib/post-studio/history-catalog';
import { blankHistoryData, historyFieldLimits, type HistoryData } from '@/lib/post-studio/history-data';
import { historyAuthor, historyCopy, historyEyebrow, historyIssues } from '@/lib/post-studio/history-design';
import type { PostDesign } from '@/lib/post-studio/types';
import { Section } from './Controls';
import css from './CricketStudio.module.css';
import styles from './PostStudio.module.css';

type Edit = (change: (current: PostDesign) => PostDesign) => void;

function TextField({ label, value, onChange, hint, multiline = false, maxLength }: {
    label: string; value: string; onChange: (value: string) => void; hint?: string; multiline?: boolean; maxLength: number;
}) {
    const [text, setText] = useState(value);
    useEffect(() => { setText(value); }, [value]);
    const input = {
        'aria-label': label, value: text, maxLength,
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setText(event.target.value); onChange(event.target.value); },
    };
    return <label className={css.kitLabel}>
        <span>{label}</span>
        {multiline ? <textarea {...input} rows={4} /> : <input {...input} type="text" />}
        {hint && <small className={css.fieldHint}>{hint}</small>}
        <small className={css.fieldHint}>{text.length} / {maxLength} characters</small>
    </label>;
}

const fieldHints: Partial<Record<HistoryFieldId, string>> = {
    year: 'The original event year, not the publication year.',
    dateLabel: 'Short date shown with the year, for example 4 MARCH.',
    fact: 'A short introduction for the main page. Put longer explanations on paragraph pages.',
    body: 'Write the details here. Add another paragraph page when the story needs more room.',
    lifespan: 'Birth and death years, for example 1918 – 2013.',
};

export default function HistoryInspector({ design, onChange }: { design: PostDesign; onChange: Edit }) {
    const data = design.history ?? blankHistoryData();
    const fields: readonly HistoryFieldId[] = data.pageKind === 'paragraph' ? ['body'] : historyPromptFields[data.template];
    const issues = historyIssues(design);
    const field = <K extends keyof HistoryData>(key: K, value: HistoryData[K]) =>
        onChange(current => ({ ...current, ...(key === 'fact' ? { summary: '' } : {}), history: { ...(current.history ?? blankHistoryData()), sample: false, [key]: value } }));
    const changeLanguage = (language: 'en' | 'ne') => onChange(current => {
        const before = current.history ?? blankHistoryData(), specNow = historyTemplate(before.template);
        const stamp = historyStamp(before.template, before.language);
        const defaultHeadline = current.headline === specNow.headline || current.headline === specNow.headlineNe;
        return {
            ...current,
            headline: defaultHeadline ? (language === 'ne' ? specNow.headlineNe : specNow.headline) : current.headline,
            category: current.category === stamp ? historyStamp(before.template, language) : current.category,
            eyebrow: current.eyebrow === historyEyebrow(before.language) ? historyEyebrow(language) : current.eyebrow,
            author: current.author === historyAuthor(before.language) ? historyAuthor(language) : current.author,
            history: { ...before, language },
        };
    });
    const clearEvent = () => onChange(current => ({ ...current, summary: '', history: { ...blankHistoryData(data.template), language: data.language, pageKind: data.pageKind } }));

    return <div className={css.cricketFields}>
        <p className={css.fieldHint}>{data.pageKind === 'paragraph' ? 'Paragraph page · add the longer explanation below. Use Text for its heading.' : 'Main page · add the date, year, subject and a short introduction. Use Add page for longer paragraphs.'}</p>
        <div className={css.dataGrid}>
            <label className={css.kitLabel}>
                <span>Language</span>
                <select aria-label="History language" value={data.language} onChange={event => changeLanguage(event.target.value as 'en' | 'ne')}>
                    <option value="en">English</option>
                    <option value="ne">नेपाली</option>
                </select>
            </label>

        </div>
        <Section title={data.pageKind === 'paragraph' ? 'Paragraph content' : 'Event details'}>
            <p className={css.fieldHint}>Enter only facts you can source. Empty fields stay out of the finished post.</p>
            <div className={css.cricketFields}>
                {fields.map(id => <TextField key={id} label={historyFieldLabels[id]} value={id === 'fact' ? data.fact || design.summary : data[id]} maxLength={historyFieldLimits[id]}
                    multiline={id === 'fact' || id === 'body'} hint={fieldHints[id]} onChange={value => field(id, value)} />)}
            </div>
            <button className={styles.button} onClick={clearEvent}>{data.pageKind === 'paragraph' ? 'Clear paragraph text' : 'Clear event fields'}</button>
        </Section>
        <Section title="Source & update">
            <div className={css.cricketFields}>
                <TextField label="Source URL" value={data.sourceUrl} maxLength={300} hint="The published source for this event. The artwork does not print it." onChange={value => field('sourceUrl', value)} />
                <label className={css.kitLabel}>
                    <span>Last update · Nepal time</span>
                    <input aria-label="Last update in Nepal time" type="datetime-local" value={data.updatedAt ? new Date(new Date(data.updatedAt).getTime() + 345 * 60000).toISOString().slice(0, 16) : ''}
                        onChange={event => field('updatedAt', event.target.value ? new Date(event.target.value + '+05:45').toISOString() : '')} />
                </label>
                <button className={styles.button} onClick={() => field('updatedAt', new Date().toISOString())}>Mark updated now</button>
            </div>
        </Section>
        <Section title="Copy limits">
            <p className={css.fieldHint}>Heading at most {historyCopy.headline} characters. Cover context at most 240; paragraph text at most 900.</p>
        </Section>
        {issues.map(issue => <p key={issue} className={css.fieldError} role="alert">{issue}</p>)}
    </div>;
}
