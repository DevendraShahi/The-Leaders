"use client";

import { Children, cloneElement, isValidElement, useId, type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import s from './StudioEditor.module.css';

export function Field({ label, children }: { label: string; children: ReactNode }) {
    const id = useId();
    const nodes = Children.toArray(children);
    return <div className={s.field}><Label htmlFor={id}>{label}</Label>{nodes.map((node, index) => isValidElement(node)
        ? cloneElement(node as ReactElement<{ id?: string; 'aria-describedby'?: string }>, index === 0 ? { id, 'aria-describedby': nodes.length > 1 ? `${id}-help` : undefined } : { id: `${id}-help` })
        : node)}</div>;
}

/** Shared shadcn Button, with workspace geometry kept separate from site-wide styles. */
export function StudioButton({ variant = 'ghost', className, ...props }: ComponentProps<typeof Button>) {
    return <Button type="button" variant={variant} className={cn(s.controlButton, className)} {...props} />;
}

export function IconButton({ label, children, className, ...props }: Omit<ComponentProps<typeof Button>, 'aria-label'> & { label: string }) {
    return <Tooltip><TooltipTrigger asChild><StudioButton variant="ghost" size="icon" aria-label={label} title={label} className={cn(s.iconButton, className)} {...props}>{children}</StudioButton></TooltipTrigger><TooltipContent className={cn(s.theme, s.tooltip)} sideOffset={8}>{label}</TooltipContent></Tooltip>;
}

export function StudioSelect({ options, label, placeholder, className, id, 'aria-describedby': description, ...props }: ComponentProps<typeof Select> & {
    options: { value: string; label: string; detail?: string }[];
    label: string; placeholder?: string; className?: string; id?: string; 'aria-describedby'?: string;
}) {
    return <Select {...props}><SelectTrigger id={id} aria-label={label} aria-describedby={description} className={cn(s.selectTrigger, className)}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent position="popper" sideOffset={6} className={cn(s.theme, s.selectMenu)}>{options.map(option => <SelectItem value={option.value} key={option.value} className={s.selectItem}><span><span>{option.label}</span>{option.detail && <small>{option.detail}</small>}</span></SelectItem>)}</SelectContent></Select>;
}
