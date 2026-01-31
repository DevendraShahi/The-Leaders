'use client';

import { Construction } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700">
                    <Construction className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Under Maintenance
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mb-8">
                We are currently updating our website to provide you with a better experience. We will be back shortly.
            </p>

            <div className="animate-pulse flex gap-2 justify-center mb-8">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animation-delay-200"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animation-delay-400"></div>
            </div>

            <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} The Leaders. All rights reserved.
            </p>
        </div>
    );
}
