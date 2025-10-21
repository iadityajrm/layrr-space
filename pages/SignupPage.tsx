import React, { useState } from 'react';
import { supabase } from '../src/lib/supabaseClient';

interface SignupPageProps {
    onSwitchToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone_number: '',
        upi_id: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    name: formData.name,
                    phone_number: formData.phone_number,
                    upi_id: formData.upi_id,
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg text-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check your email!</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    We've sent a confirmation link to your email address. Please click the link to complete your registration.
                </p>
                 <button onClick={onSwitchToLogin} className="font-medium text-primary-600 hover:text-primary-500">
                    Back to Sign in
                </button>
            </div>
        );
    }

    return (
        <div className={`w-full max-w-lg p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg`}>
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
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <form className="mt-8" onSubmit={handleSignup}>
                <div className="space-y-4">
                   <input type="text" name="name" placeholder="Full Name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                    <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                     <input type="password" name="password" placeholder="Password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <input type="tel" name="phone_number" placeholder="Mobile Number" required value={formData.phone_number} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                       <input type="text" name="upi_id" placeholder="UPI ID for Payouts" required value={formData.upi_id} onChange={handleInputChange} className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"/>
                    </div>
                </div>
                <div className="mt-6">
                    <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                        {loading ? 'Creating account...' : 'Create Account'}
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
    )
};
