import React, { useState } from 'react';

export const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert('Feedback submitted successfully!');
      setFeedback('');
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Submit Feedback</h1>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Your Feedback
            </label>
            <textarea
              id="feedback"
              name="feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="We'd love to hear your thoughts!"
            />
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 text-right rounded-b-2xl">
            <button
              type="submit"
              disabled={submitting || !feedback}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
