"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { normalizeTextColor, textColorPalette } from '@/lib/post-studio/text-colors';
import styles from './PostStudio.module.css';

export function Modal({ children, labelledBy, onClose, blocked = false, wide = false }: { children: ReactNode; labelledBy: string; onClose: () => void; blocked?: boolean; wide?: boolean }) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        dialog.showModal();
        return () => dialog.close();
    }, []);
    return <dialog ref={ref} className={`${styles.nativeDialog} ${wide ? styles.wideDialog : ''}`} aria-labelledby={labelledBy} onCancel={event => { event.preventDefault(); if (!blocked) onClose(); }}>
        <div className={styles.studio} style={{ minHeight: 0 }}><div className={`${styles.dialog} ${wide ? styles.wideDialogContent : ''}`}>{children}</div></div>
    </dialog>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
    return <details className={styles.section}><summary>{title}</summary><div className={styles.sectionContent}>{children}</div></details>;
}
export function Slider({ label, value, min, max, disabled, vertical, onStart, onChange, onEnd }: {
    label: string; value: number; min: number; max: number; disabled?: boolean; vertical?: boolean;
    onStart: () => void; onChange: (value: number) => void; onEnd: () => void;
}) {
    return <div className={styles.slider}>
        <label><span>{label}</span><output>{Math.round(value)}%</output></label>
        <div className={vertical ? styles.sliderVertical : undefined}>
            <input aria-label={label} aria-orientation={vertical ? 'vertical' : 'horizontal'} type="range" min={min} max={max} step={1} value={value} disabled={disabled}
                onPointerDown={onStart} onPointerUp={onEnd} onPointerCancel={onEnd} onBlur={onEnd}
                onKeyDown={event => { if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) onStart(); }}
                onKeyUp={onEnd} onChange={event => onChange(Number(event.target.value))} />
            {vertical && <span className={styles.subtle}>Up / down<br />from template position</span>}
        </div>
    </div>;
}
export function ColorPicker({ label, color, disabled, onChange, reset = null }: {
    label: string; color: string | null; disabled?: boolean; onChange: (color: string | null) => void; reset?: string | null;
}) {
    const [custom, setCustom] = useState(color || '');
    const normalized = normalizeTextColor(custom);
    return <div className={styles.field}>
        <div className={styles.swatches}>{textColorPalette.map(swatch => <button key={swatch.value} type="button" aria-label={`${label}: ${swatch.name}`} title={swatch.name} aria-pressed={color === swatch.value} disabled={disabled}
            className={styles.swatch} style={{ background: swatch.value }} onClick={() => onChange(swatch.value)} />)}</div>
        <label className={styles.field}><span>Custom hex</span><input className={styles.input} aria-label={`${label} custom hex`} value={custom} onChange={event => setCustom(event.target.value)} placeholder="#FFFFFF" disabled={disabled} maxLength={7} /></label>
        <div className={styles.row}><button className={styles.button} disabled={disabled || !normalized} onClick={() => onChange(normalized)}>Apply</button><button className={styles.button} disabled={disabled} onClick={() => onChange(reset)}>Reset color</button></div>
    </div>;
}
