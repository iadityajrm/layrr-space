import React, { useState, useEffect } from 'react';
import type { Assignment, Profile, ReviewSettings } from '../types';
import { supabase } from '../src/lib/supabaseClient';
import { ArrowLeftIcon } from '../components/Icons';

interface ProjectDetailPageProps {
  project: Assignment;
  user: Profile;
  onBack: () => void;
  onProjectUpdate: (project: Assignment) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project, user, onBack, onProjectUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Partial<ReviewSettings>>({});
  const [slugInput, setSlugInput] = useState<string>(project.slug || '');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(project.public_url || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('review_page_settings')
        .select('*')
        .eq('assignment_id', project.assignment_id || project.id)
        .maybeSingle();

      if (data) {
        setSettings(data as any);
        setSlugInput((data as any).slug || '');
        setQrDataUrl((data as any).public_url || null);
      }
    };
    fetchSettings();
  }, [project.assignment_id, project.id]);

  const generateSlug = (base: string) => {
    return base.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const generatePublicUrl = (slug: string) => {
    const origin = window.location.origin;
    return `${origin}/r/${slug}`;
  };

  const handleLogoUpload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `${user.id}-${project.id}-logo-${Date.now()}.${ext}`;
    setUploading(true);
    setUploadError(null);
    const { error } = await supabase.storage.from('review_logos').upload(fileName, file);
    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return null;
    }
    const { data } = supabase.storage.from('review_logos').getPublicUrl(fileName);
    setUploading(false);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slug = slugInput ? generateSlug(slugInput) : generateSlug((project.title || project.assignment_id || project.id) as string);
      const public_url = generatePublicUrl(slug);

      const payload: any = {
        assignment_id: project.assignment_id || project.id,
        project_id: project.id,
        slug,
        public_url,
        redirect_url_high_rating: settings.redirect_url_high_rating || null,
        internal_feedback_config: settings.internal_feedback_config || null,
        theme_color: settings.theme_color || null,
        logo_url: settings.logo_url || null
      };

      const { data, error } = await supabase
        .from('review_page_settings')
        .upsert(payload, { onConflict: 'assignment_id' })
        .select()
        .maybeSingle();

      if (error) throw error;

      // update assignments row
      const updatePayload: any = {
        title: project.title || project.assignment_id,
        slug,
        public_url,
        // keep a reference for debugging / policy checks
        project_id: project.id
      };

      const upd = await supabase
        .from('assignments')
        .update(updatePayload)
        .eq('id', project.id)
        .maybeSingle();

      if (upd.error) console.error('Error updating assignment row:', upd.error);

      setSettings(data as any);
      setQrDataUrl(public_url);
      setSaving(false);
      onProjectUpdate({ ...(project as any), slug, public_url, title: updatePayload.title } as any);
    } catch (e: any) {
      console.error(e);
      alert('Save error: ' + (e?.message || String(e)));
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <button onClick={onBack} className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6">
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back to Projects</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.title || project.assignment_id || project.id}</h1>
          <p className="text-slate-500 dark:text-slate-400">Template: {Array.isArray(project.templates) ? project.templates[0]?.title : (project.templates as any)?.title || 'N/A'}</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Customize Review Page</h3>
            <div className="space-y-4">
              <label className="block text-sm">
                <div className="text-slate-600 mb-1">Business / Place Name</div>
                <input value={project.title || ''} onChange={(e) => onProjectUpdate({ ...(project as any), title: e.target.value } as any)} className="w-full border rounded px-3 py-2" />
              </label>

              <label className="block text-sm">
                <div className="text-slate-600 mb-1">Question Title</div>
                <input value={(settings.internal_feedback_config && settings.internal_feedback_config.split('|')?.[0]) || ''} onChange={(e) => setSettings(s => ({ ...(s || {}), internal_feedback_config: `${e.target.value}|${settings.internal_feedback_config?.split('|')?.[1] || ''}` }))} className="w-full border rounded px-3 py-2" placeholder="How was Zoca Cafe?" />
              </label>

              <label className="block text-sm">
                <div className="text-slate-600 mb-1">Redirect URL for 4–5 stars</div>
                <input value={settings.redirect_url_high_rating || ''} onChange={(e) => setSettings(s => ({ ...(s || {}), redirect_url_high_rating: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="https://google.com/..." />
              </label>

              <label className="block text-sm">
                <div className="text-slate-600 mb-1">Internal Feedback / Thank you (also endpoint)</div>
                <textarea value={settings.internal_feedback_config || ''} onChange={(e) => setSettings(s => ({ ...(s || {}), internal_feedback_config: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Thanks for your feedback... or POST endpoint URL" />
              </label>

              <label className="block text-sm">
                <div className="text-slate-600 mb-1">Theme Color</div>
                <input type="color" value={settings.theme_color || '#0ea5a4'} onChange={(e) => setSettings(s => ({ ...(s || {}), theme_color: e.target.value }))} />
              </label>

              <label className="block text-sm">
                <div className="text-slate-600 mb-1">Logo Upload (optional)</div>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if (!e.target.files || !e.target.files[0]) return;
                  const publicUrl = await handleLogoUpload(e.target.files[0]);
                  if (publicUrl) setSettings(s => ({ ...(s || {}), logo_url: publicUrl }));
                }} />
                {uploading && <div className="text-sm text-slate-500 mt-2">Uploading...</div>}
                {uploadError && <div className="text-sm text-red-500 mt-2">{uploadError}</div>}
              </label>

              <label className="block text-sm">
                <div className="text-slate-600 mb-1">Slug (public path)</div>
                <input value={slugInput} onChange={(e) => setSlugInput(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="zoca-cafe-review" />
              </label>

              <div className="flex items-center space-x-3">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded">{saving ? 'Saving...' : 'Save & Publish'}</button>
                <button onClick={() => { setSettings({}); setSlugInput(''); }} className="px-4 py-2 border rounded">Reset</button>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Live Preview</h3>
            <div className="border rounded p-4" style={{ borderColor: settings.theme_color || '#e5e7eb' }}>
              <div className="text-lg font-bold mb-2">{project.title || 'Your Business'}</div>
              <div className="mb-3">{(settings.internal_feedback_config && settings.internal_feedback_config.split('|')?.[0]) || 'How was your experience?'}</div>
              <div className="flex items-center space-x-2 mb-3">
                {[5,4,3,2,1].map(i => (
                  <button key={i} className="px-2 py-1 bg-yellow-400 rounded" onClick={() => {
                    const rating = i;
                    if (rating >= 4) {
                      window.open(settings.redirect_url_high_rating || settings.public_url || '#', '_blank');
                    } else {
                      alert(settings.internal_feedback_config || 'Show internal feedback form');
                    }
                  }}>{i}★</button>
                ))}
              </div>
              <div className="text-sm text-slate-500">Public link: <a className="underline" href={qrDataUrl || '#'} target="_blank" rel="noreferrer">{qrDataUrl || '—'}</a></div>
              <div className="mt-4">
                <div className="text-xs text-slate-500 mb-1">QR (downloadable)</div>
                {qrDataUrl ? (
                  <a href={qrDataUrl} target="_blank" rel="noreferrer" className="inline-block border rounded p-2">Open Link</a>
                ) : (
                  <div className="text-sm text-slate-400">QR will be available after publish</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
