'use client';

import { useState } from 'react';
import RichTextEditor from './RichTextEditor';

interface BilingualRichTextProps {
    label: string;
    valueEn: string;
    valueNe: string;
    onChangeEn: (value: string) => void;
    onChangeNe: (value: string) => void;
    placeholderEn?: string;
    placeholderNe?: string;
    required?: boolean;
    className?: string;
}

export default function BilingualRichText({
    label,
    valueEn,
    valueNe,
    onChangeEn,
    onChangeNe,
    placeholderEn,
    placeholderNe,
    required = false,
    className
}: BilingualRichTextProps) {
    const [activeTab, setActiveTab] = useState<'en' | 'ne'>('en');

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {/* Tab Buttons */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => setActiveTab('en')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'en'
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    English
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('ne')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'ne'
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    नेपाली (Nepali)
                </button>
            </div>

            {/* Editor Content */}
            <div className="mt-2">
                <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                    <RichTextEditor
                        value={valueEn}
                        onChange={onChangeEn}
                        placeholder={placeholderEn}
                    />
                </div>
                <div className={activeTab === 'ne' ? 'block' : 'hidden'}>
                    <RichTextEditor
                        value={valueNe}
                        onChange={onChangeNe}
                        placeholder={placeholderNe}
                    />
                </div>
            </div>
            <p className="text-xs text-gray-400 text-right mt-1">
                Editing in {activeTab === 'en' ? 'English' : 'Nepali'}
            </p>
        </div>
    );
}
