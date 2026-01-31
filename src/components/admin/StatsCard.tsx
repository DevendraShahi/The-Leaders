'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    delay?: number;
    color?: 'blue' | 'green' | 'purple' | 'orange';
}

export default function StatsCard({
    title,
    value,
    description,
    icon,
    trend,
    trendValue,
    delay = 0,
    color = 'blue'
}: StatsCardProps) {
    const colorStyles = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-emerald-500 to-emerald-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
    };

    const iconBgStyles = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${iconBgStyles[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                        {trendValue}
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}
                    </div>
                )}
            </div>

            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                {title}
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {value}
                </span>
                {description && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </span>
                )}
            </div>
        </motion.div>
    );
}
