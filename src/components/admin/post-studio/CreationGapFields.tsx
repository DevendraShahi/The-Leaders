"use client";
import { nplTeams } from '@/lib/post-studio/cricket-catalog';
import { creationValue, type CreationGap } from '@/lib/post-studio/creation-workflow';
import type { PostDesign } from '@/lib/post-studio/types';
import css from './PromptCreationModal.module.css';

export default function CreationGapFields({ fields, designs, onChange }: { fields: CreationGap[]; designs: PostDesign[]; onChange: (field: CreationGap, value: unknown) => void }) {
    return <div className={css.fields}>{fields.map(field => {
        const value = creationValue(designs[field.page ?? 0], field.path);
        if (field.type === 'profile') {
            const profile = (value ?? {}) as Record<string, string>;
            return <fieldset key={field.key} className={css.tableFields}><legend>{field.label}</legend>{(['captain', 'headCoach', 'homeCity'] as const).map(key => <label className={css.field} key={key}><span>{key === 'captain' ? 'Captain' : key === 'headCoach' ? 'Head coach' : 'Home city'}</span><input maxLength={90} value={profile[key] ?? ''} onChange={event => onChange(field, { captain: '', headCoach: '', homeCity: '', ...profile, [key]: event.target.value })} /></label>)}</fieldset>;
        }
        if (field.type === 'select') return <label key={field.key} className={css.field}><span>{field.label}</span><select value={String(value ?? '')} onChange={event => onChange(field, event.target.value || null)}><option value="">Not confirmed</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
        if (field.type === 'rows') {
            const rows = (value ?? []) as Record<string, unknown>[];
            const max = field.path.endsWith('fixtures') || field.path.endsWith('statRows') ? 6 : field.path.endsWith('standings') ? 8 : 11;
            return <fieldset key={field.key} className={css.tableFields}><legend>{field.label}</legend>
                {rows.map((row, index) => <div key={index} className={css.dataRow}>
                    <div className={css.rowHeading}><strong>{field.label} · {index + 1}</strong><button type="button" onClick={() => onChange(field, rows.filter((_, i) => i !== index))} aria-label={`Remove ${field.label} row ${index + 1}`}>Remove</button></div>
                    <div className={css.fields}>{field.columns?.map(column => {
                        const change = (next: unknown) => onChange(field, rows.map((current, i) => i === index ? { ...current, [column.key]: next } : current));
                        const label = `${field.label} ${index + 1} · ${column.label}`;
                        return <label key={column.key} className={css.field}><span>{column.label}</span>{column.type === 'team' ? <select aria-label={label} value={String(row[column.key] ?? '')} onChange={event => change(event.target.value)}><option value="">Choose team</option>{nplTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select> : column.type === 'checkbox' ? <input aria-label={label} type="checkbox" checked={Boolean(row[column.key])} onChange={event => change(event.target.checked)} /> : <input aria-label={label} type={column.type} min={column.type === 'number' ? 0 : undefined} step={column.type === 'number' ? 1 : undefined} value={String(row[column.key] ?? '')} onChange={event => change(column.type === 'number' ? event.target.value === '' ? null : Number(event.target.value) : event.target.value)} />}</label>;
                    })}</div>
                </div>)}
                <button type="button" className={css.secondary} disabled={rows.length >= max} onClick={() => onChange(field, [...rows, Object.fromEntries(field.columns!.map(column => [column.key, column.type === 'number' ? null : column.type === 'checkbox' ? false : '']))])}>Add {field.label === 'Fixtures' ? 'fixture' : 'row'}</button>
            </fieldset>;
        }
        return <label key={field.key} className={css.field}><span>{field.label}</span>{field.type === 'lines' ? <textarea rows={5} value={Array.isArray(value) ? value.join('\n') : ''} onChange={event => onChange(field, event.target.value.split('\n').map(line => line.trim()).filter(Boolean))} /> : <input type={field.type} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? 1 : undefined} value={String(value ?? '')} onChange={event => onChange(field, field.type === 'number' ? event.target.value === '' ? null : Number(event.target.value) : event.target.value)} />}{field.path.endsWith('overs') && <small>Use cricket overs, such as 14.2.</small>}</label>;
    })}</div>;
}
