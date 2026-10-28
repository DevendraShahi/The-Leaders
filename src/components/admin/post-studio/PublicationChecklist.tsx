"use client";
import { useState } from 'react';
import type { PostDraft } from '@/lib/post-studio/drafts';
import { publicationChecks, type PublicationCheck } from '@/lib/post-studio/editorial';
import s from './PostStudio.module.css';
export default function PublicationChecklist({ slides, technicalChecks = [] }: { slides: PostDraft[]; technicalChecks?: PublicationCheck[] }) {
    const [open, setOpen] = useState(true);
    const editorialChecks = slides.flatMap((slide, index) => publicationChecks(slide.design).map(check => ({ ...check, label: `${slides.length > 1 ? `Page ${index + 1}: ` : ''}${check.label}` })));
    const checks = [...editorialChecks, ...technicalChecks];
    const warnings = checks.filter(check => check.level !== 'pass');
    return <section className={s.edition} aria-label="Publication checklist"><button className={s.button} aria-expanded={open} onClick={() => setOpen(value => !value)}>Publication checklist · {warnings.length ? `${warnings.length} to review` : 'reviewed'}</button>{open && <><p className={s.subtle}>Source verification is your assessment. Text fit, fonts and image loading are checked again when each PNG renders.</p><ul>{checks.map((check, index) => <li key={index} style={{ color: check.level === 'error' ? 'var(--studio-red)' : undefined }}>{check.level === 'pass' ? '✓' : check.level === 'error' ? '!' : '○'} {check.label}</li>)}</ul></>}</section>;
}
