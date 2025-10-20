
import React from 'react';
import { TemplateIcon, BriefcaseIcon, CheckSquareIcon } from './Icons';

interface OnboardingProps {
    onComplete: () => void;
}

const OnboardingStep: React.FC<{ icon: React.ReactNode; title: string; description: string, delay: string }> = ({ icon, title, description, delay }) => (
    <div className="flex items-start space-x-4 animate-fade-in-up opacity-0" style={{ animationDelay: delay }}>
        <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900/50 p-3 rounded-xl">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-gray-600 dark:text-gray-300">{description}</p>
        </div>
    </div>
);


export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">How Layrr Works</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Your simple path to earning commissions.</p>
            
            <div className="mt-8 space-y-6 text-left">
                <OnboardingStep 
                    icon={<TemplateIcon className="w-6 h-6 text-primary-600 dark:text-primary-300" />}
                    title="1. Choose a Template"
                    description="Browse our library of professionally designed templates built for local businesses."
                    delay="100ms"
                />
                 <OnboardingStep 
                    icon={<BriefcaseIcon className="w-6 h-6 text-primary-600 dark:text-primary-300" />}
                    title="2. Sell to a Vendor"
                    description="Showcase and sell a template to a local business. Once they agree, you 'purchase' it here to create a project."
                    delay="200ms"
                />
                 <OnboardingStep 
                    icon={<CheckSquareIcon className="w-6 h-6 text-primary-600 dark:text-primary-300" />}
                    title="3. Customize & Verify"
                    description="Customize the project, upload a photo as proof of sale, and get your commission paid out."
                    delay="300ms"
                />
            </div>

            <div className="mt-10 animate-fade-in-up opacity-0" style={{ animationDelay: '400ms' }}>
                <button 
                    onClick={onComplete}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
};
