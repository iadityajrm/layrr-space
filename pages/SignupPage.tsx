
import React, { useState } from 'react';
import type { User } from '../types';
import { Onboarding } from '../components/Onboarding';

interface SignupPageProps {
    onSignupSuccess: () => void;
    onSwitchToLogin: () => void;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onSwitchToLogin, setUser }) => {
    const [step, setStep] = useState(1);
    const [formAnimation, setFormAnimation] = useState('animate-fade-in');
    const [pageAnimation, setPageAnimation] = useState('');
    
    const [formData, setFormData] = useState<User>({
        firstName: '', lastName: '', city: '', email: '', mobile: '', upiId: '', password: '', totalEarnings: 0
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormAnimation('animate-fade-out');
        setTimeout(() => {
            setUser(formData);
            setStep(2);
        }, 300); // match animation duration
    };
    
    const handleCompleteOnboarding = () => {
        setPageAnimation('animate-fade-out');
        setTimeout(onSignupSuccess, 300); // match animation duration and call parent
    };

    return (
        <div className={`w-full max-w-lg p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg ${pageAnimation}`}>
            {step === 1 && (
                 <div className={formAnimation}>
                    <div className="text-center">
                         <img 
                                                    src="/logo-black.svg" 
                          alt="Layrr Logo" 
                          className="h-10 mx-auto object-contain dark:hidden"
                        />
                         <img 
                                                    src="/logo-white.svg" 
                          alt="Layrr Logo White" 
                          className="h-10 mx-auto object-contain hidden dark:block"
                        />
                        <h1 className="mt-6 text-2xl font-bold text-center text-slate-900 dark:text-white">Create your account</h1>
                        <p className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400">Join Layrr and start earning.</p>
                    </div>
                    <form className="mt-8" onSubmit={handleDetailsSubmit}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <input type="text" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                               <input type="text" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                            </div>
                            <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                             <input type="password" name="password" placeholder="Password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <input type="tel" name="mobile" placeholder="Mobile Number" required value={formData.mobile} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                               <input type="text" name="city" placeholder="City" required value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                            </div>
                             <input type="text" name="upiId" placeholder="UPI ID for Payouts" required value={formData.upiId} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                        </div>
                        <div className="mt-6">
                            <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                Continue
                            </button>
                        </div>
                    </form>
                    <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                        Already have an account?{' '}
                        <button onClick={onSwitchToLogin} className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in
                        </button>
                    </p>
                </div>
            )}
            {step === 2 && <div className="animate-fade-in"><Onboarding onComplete={handleCompleteOnboarding} /></div>}
        </div>
    )
};
