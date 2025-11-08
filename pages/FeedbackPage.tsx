import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabaseClient';
import { Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { Project } from '../types';

export const FeedbackPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) {
        setError('Project slug not provided.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('id, project_name, user_id, status, slug, templates(id, template_name, question_title)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project data.');
      } else if (data) {
        setProject(data);
      } else {
        setError('Project not found.');
      }
      setLoading(false);
    };

    fetchProject();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!project) {
      alert('Project data not loaded. Cannot submit feedback.');
      setSubmitting(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      // User is not required to be logged in for public feedback
      // if (!user) {
      //   throw new Error("You must be logged in to submit feedback.");
      // }

      const now = new Date();
      const { error } = await supabase.from('feedbacks').insert([
        {
          project_id: project.id,
          username: user?.email || 'anonymous', // Use anonymous if user not logged in
          feedback,
          stars: rating,
          time: now.toTimeString().split(' ')[0],
          date: now.toISOString().split('T')[0],
          created_at: now.toISOString(),
        },
      ]);

      if (error) {
        throw error;
      }

      alert('Feedback submitted successfully!');
      setFeedback('');
      setRating(0);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto text-center text-slate-500 dark:text-slate-400">Loading project...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto text-center text-red-500">{error}</div>;
  }

  if (!project) {
    return <div className="max-w-4xl mx-auto text-center text-red-500">Project data not available.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
        {project.templates?.question_title || `Submit Feedback for ${project.project_name}`}
      </h1>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Rate your experience
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'
                      }`}
                      fill={star <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
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
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 text-right rounded-b-2xl">
            <button
              type="submit"
              disabled={submitting || !feedback || rating === 0}
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
