import React from 'react';
import type { Activity } from '../types';

export const ActivityItem: React.FC<Activity> = ({ description, timestamp, icon }) => {
    return (
        <li className="flex items-start space-x-4 p-2 -m-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex-shrink-0 mt-1">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-slate-800 dark:text-slate-200">{description}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{timestamp}</p>
            </div>
        </li>
    );
};
