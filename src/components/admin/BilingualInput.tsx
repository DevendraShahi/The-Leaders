'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Languages } from 'lucide-react';

interface BilingualInputProps {
    label: string;
    valueEn: string;
    valueNe: string;
    onChangeEn: (value: string) => void;
    onChangeNe: (value: string) => void;
    errorEn?: string;
    errorNe?: string;
    placeholderEn?: string;
    placeholderNe?: string;
    type?: 'text' | 'textarea';
    required?: boolean;
    className?: string;
}

export default function BilingualInput({
    label,
    valueEn,
    valueNe,
    onChangeEn,
    onChangeNe,
    errorEn,
    errorNe,
    placeholderEn,
    placeholderNe,
    type = 'text',
    required = false,
    className
}: BilingualInputProps) {
    const [activeTab, setActiveTab] = useState<'en' | 'ne'>('en');

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>

                {/* Language Toggler */}
                <div className="flex p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setActiveTab('en')}
                        className={cn(
                            "px-3 py-1 text-xs font-medium rounded-md transition-all",
                            activeTab === 'en'
                                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        English
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('ne')}
                        className={cn(
                            "px-3 py-1 text-xs font-medium rounded-md transition-all",
                            activeTab === 'ne'
                                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        नेपाली
                    </button>
                </div>
            </div>

            {/* Input Field */}
            <div className="relative">
                {type === 'textarea' ? (
                    <textarea
                        value={activeTab === 'en' ? valueEn : valueNe}
                        onChange={(e) => activeTab === 'en' ? onChangeEn(e.target.value) : onChangeNe(e.target.value)}
                        placeholder={activeTab === 'en' ? (placeholderEn || "Enter content in English") : (placeholderNe || "नेपालीमा सामग्री लेख्नुहोस्")}
                        className={cn(
                            "flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-white dark:bg-gray-900/50",
                            (activeTab === 'en' && errorEn) || (activeTab === 'ne' && errorNe) ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                    />
                ) : (
                    <input
                        type="text"
                        value={activeTab === 'en' ? valueEn : valueNe}
                        onChange={(e) => activeTab === 'en' ? onChangeEn(e.target.value) : onChangeNe(e.target.value)}
                        placeholder={activeTab === 'en' ? (placeholderEn || "English text") : (placeholderNe || "नेपाली पाठ")}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-white dark:bg-gray-900/50",
                            (activeTab === 'en' && errorEn) || (activeTab === 'ne' && errorNe) ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                    />
                )}

                {/* Language Indicator Icon inside input */}
                <div className="absolute right-3 top-3 text-xs font-bold text-gray-300 dark:text-gray-600 pointer-events-none uppercase">
                    {activeTab}
                </div>
            </div>

            {/* Errors */}
            {(errorEn || errorNe) && (
                <div className="text-xs space-y-1">
                    {errorEn && <p className="text-red-500">EN: {errorEn}</p>}
                    {errorNe && <p className="text-red-500">NE: {errorNe}</p>}
                </div>
            )}
        </div>
    );
}
