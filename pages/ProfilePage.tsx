import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { TrashIcon } from '../components/Icons';

interface ProfilePageProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, setUser }) => {
  const [formData, setFormData] = useState<User>(user);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');

  useEffect(() => {
    if(user) {
        setFormData(user);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value } as User));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(formData);
    // Here you would typically make an API call to save the data
    alert('Profile saved successfully!');
  };
  
  const isDeleteDisabled = deleteEmailInput !== user.email;

  if (!user) {
      return null; // Or a loading spinner
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and account settings.</p>
      </div>

      {/* Profile Information Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-gray-700"/>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-gray-700"/>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                <input type="text" name="city" id="city" value={formData.city} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-gray-700"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-0 focus:border-primary-500 bg-gray-100 dark:bg-gray-900" readOnly/>
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                <input type="tel" name="mobile" id="mobile" value={formData.mobile} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-gray-700"/>
              </div>
              <div>
                <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">UPI ID</label>
                <input type="text" name="upiId" id="upiId" value={formData.upiId} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-gray-700"/>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-right rounded-b-lg">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-200">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Delete Account Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
         <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-red-700 dark:text-red-400">Delete Account</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <div className="mt-5">
                <button 
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-200"
                >
                  {showDeleteConfirm ? 'Cancel' : 'Delete Profile'}
                </button>
            </div>
            {showDeleteConfirm && (
                <div className="mt-6 p-4 border-l-4 border-red-400 bg-red-50 dark:bg-red-900/20">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <TrashIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                To confirm, please type your email address (<strong className="font-bold">{user.email}</strong>) in the box below.
                            </p>
                            <input 
                                type="email"
                                value={deleteEmailInput}
                                onChange={(e) => setDeleteEmailInput(e.target.value)}
                                autoComplete="off"
                                className="mt-2 block w-full max-w-sm px-4 py-3 border-red-300 dark:border-red-500 rounded-md shadow-sm focus:ring-0 focus:border-red-500 bg-white dark:bg-gray-700"
                            />
                            <button
                                disabled={isDeleteDisabled}
                                className="mt-4 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed"
                            >
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};