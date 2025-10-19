
import React from 'react';
import type { Activity } from '../types';

export const ActivityItem: React.FC<Activity> = ({ description, timestamp, icon }) => {
    return (
        <li className="flex items-start space-x-4 p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex-shrink-0 mt-1">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">{description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timestamp}</p>
            </div>
        </li>
    );
};
