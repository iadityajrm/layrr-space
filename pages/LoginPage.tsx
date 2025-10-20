
import React, { useState } from 'react';
import type { User } from '../types';

interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
    onSwitchToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate login
        if (email === 'alex.doe@layrr.space' && password === 'password') {
            onLoginSuccess({
                firstName: 'Alex',
                lastName: 'Doe',
                city: 'San Francisco',
                email: 'alex.doe@layrr.space',
                mobile: '555-123-4567',
                upiId: 'alex.doe@bank',
                totalEarnings: 249.75,
            });
        } else {
            alert('Invalid credentials');
        }
    };
    
    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
            <div className="text-center">
                 <img 
                  src="/logo-dark.svg" 
                  alt="Layrr Logo" 
                  className="h-10 mx-auto object-contain dark:hidden"
                />
                 <img 
                  src="/logo-light.svg"
                  alt="Layrr Logo White" 
                  className="h-10 mx-auto object-contain hidden dark:block"
                />
                <h1 className="mt-6 text-2xl font-bold text-center text-slate-900 dark:text-white">Welcome back</h1>
                <p className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400">Sign in to continue to Layrr</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                <div className="rounded-lg shadow-sm -space-y-px">
                    <div>
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                        <input id="email-address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-t-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Email address" />
                    </div>
                    <div>
                        <label htmlFor="password-login" className="sr-only">Password</label>
                        <input id="password-login" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-b-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Password" />
                    </div>
                </div>

                <div>
                    <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Sign in
                    </button>
                </div>
            </form>
             <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <button onClick={onSwitchToSignup} className="font-medium text-primary-600 hover:text-primary-500">
                    Sign up
                </button>
            </p>
        </div>
    );
};
