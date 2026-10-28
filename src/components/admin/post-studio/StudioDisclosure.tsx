"use client";

import { useId, type CSSProperties, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import css from './StudioDisclosure.module.css';

/** Native keyboard/toggle semantics with one consistent Studio disclosure header. */
export function StudioDisclosure({ title, description, icon, badge, variant = 'compact', className = '', style, children, defaultOpen = false }: {
    title: ReactNode; description?: string; icon?: ReactNode; badge?: ReactNode;
    variant?: 'compact' | 'feature'; className?: string; style?: CSSProperties; children: ReactNode; defaultOpen?: boolean;
}) {
    const descriptionId = useId();
    return <details className={`${css.disclosure} ${className}`} style={style} data-variant={variant} open={defaultOpen || undefined}>
        <summary className={css.trigger} aria-label={typeof title === 'string' ? title : undefined} aria-describedby={description ? descriptionId : undefined}>
            {icon && <span className={css.icon} aria-hidden="true">{icon}</span>}
            <span className={css.copy}><span className={css.title}>{title}</span>{description && <span className={css.description} id={descriptionId}>{description}</span>}</span>
            {badge && <span className={css.badge}>{badge}</span>}
            <span className={css.indicator} aria-hidden="true"><ChevronDown size={16} strokeWidth={1.7} /></span>
        </summary>
        <div className={css.content}>{children}</div>
    </details>;
}
