import React, { useState, useEffect } from 'react';
import type { Profile } from '../types';
import { supabase } from '../src/lib/supabaseClient';

interface ProfilePageProps {
  user: Profile;
  setUser: (user: Profile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    upi_id: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        upi_id: user.upi_id || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uid = user.id;

      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          upi_id: formData.upi_id,
        })
        .eq('id', uid)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile: ' + error.message);
      } else if (!data) {
        console.warn('No profile row was updated. Check RLS policies and whether the uid matches user row columns.');
        alert('No profile row was updated — check RLS/policies or whether the user row exists for this account.');
      } else {
        alert('Profile updated successfully!');
        setUser(data as Profile);
      }
    } catch (err: any) {
      console.error('Unexpected error updating profile:', err);
      alert('Unexpected error: ' + err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (deleteConfirmationEmail !== user.email) {
      alert('Email address does not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting profile: ' + error.message);
      } else {
        alert('Profile deleted successfully.');
        await supabase.auth.signOut();
        // Redirect or update UI state
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Unexpected error deleting profile:', err);
      alert('Unexpected error: ' + err?.message || String(err));
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">My Profile</h1>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleUpdateProfile}>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <input type="email" id="email" value={user.email} disabled className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number</label>
              <input type="tel" name="phone_number" id="phone_number" value={formData.phone_number} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="upi_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">UPI ID for Payouts</label>
              <input type="text" name="upi_id" id="upi_id" value={formData.upi_id} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 text-right rounded-b-2xl">
            <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Danger Zone</h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-red-500/50">
          <div className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Delete Your Account</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <button onClick={() => setShowDeleteModal(true)} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Deletion</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              To confirm, please type your email address (<span className="font-mono">{user.email}</span>) in the box below.
            </p>
            <div className="mt-4">
              <input
                type="email"
                value={deleteConfirmationEmail}
                onChange={(e) => setDeleteConfirmationEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="py-2 px-4 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleteConfirmationEmail !== user.email}
                className="py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
