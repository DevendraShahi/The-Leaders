'use client';

import { ShieldAlert } from 'lucide-react';

interface MaintenanceState {
    isActive: boolean;
    reason?: string;
}

interface MaintenanceRowProps {
    label: string;
    path: string[];
    state: MaintenanceState;
    onChange: (path: string[], newState: MaintenanceState) => void;
    isMain?: boolean;
}

export function MaintenanceRow({
    label,
    path,
    state,
    onChange,
    isMain = false
}: MaintenanceRowProps) {
    if (!state) return null;

    return (
        <div className={`group transition-all duration-300 ${isMain ? 'p-4 sm:p-6' : 'p-3 sm:p-4 border-l-2 border-border ml-2 sm:ml-4 hover:bg-muted/30'}`}>
            <div className="flex items-start gap-4">
                <div className="pt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={state.isActive}
                            onChange={(e) => {
                                onChange(path, { ...state, isActive: e.target.checked });
                            }}
                        />
                        <div className="w-11 h-6 bg-muted-foreground/20 rounded-full peer 
                            peer-focus:ring-2 peer-focus:ring-primary/20 
                            peer-checked:after:translate-x-full peer-checked:after:border-white 
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                            after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                            after:transition-all peer-checked:bg-primary hover:bg-muted-foreground/30 transition-colors"></div>
                    </label>
                </div>

                <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className={`font-bold uppercase tracking-wide transition-colors ${isMain ? 'text-lg text-foreground' : 'text-sm text-muted-foreground group-hover:text-foreground'
                            }`}>
                            {label}
                        </span>
                        {state.isActive && (
                            <span className="inline-flex w-fit items-center gap-1.5 text-[10px] text-destructive font-mono font-bold bg-destructive/10 px-2 py-1 rounded-sm border border-destructive/20 animate-in fade-in duration-300">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive"></span>
                                </span>
                                MAINTENANCE ACTIVE
                            </span>
                        )}
                    </div>

                    {state.isActive && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                            <input
                                type="text"
                                placeholder="Enter reason for maintenance mode..."
                                value={state.reason || ''}
                                onChange={(e) => {
                                    onChange(path, { ...state, reason: e.target.value });
                                }}
                                className="w-full bg-background border-b-2 border-border focus:border-primary px-3 py-2 text-sm outline-none font-manrope transition-all placeholder:text-muted-foreground/50"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
