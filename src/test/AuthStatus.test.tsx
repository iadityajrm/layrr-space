import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectDetailPage } from '../../pages/ProjectDetailPage';
import { Project, Profile } from '../../types';

// Mock supabase client to observe calls
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => Promise.resolve({ data: { status: 'published' }, error: null })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      select: vi.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
      })),
    },
  },
}));

describe('User Status Enforcement', () => {
  const baseProject: Project = {
    id: 'p1',
    user_id: 'u1',
    template_id: 't1',
    project_name: 'Test Project',
    slug: 'test-project',
    status: 'unpublished',
    created_at: new Date().toISOString(),
  };

  const activeUser: Profile = {
    id: 'u1',
    email: 'active@example.com',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const suspendedUser: Profile = {
    id: 'u1',
    email: 'suspended@example.com',
    status: 'suspended',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('allows publish for active users', async () => {
    render(
      <ProjectDetailPage
        project={baseProject}
        user={activeUser}
        onBack={vi.fn()}
        onProjectUpdate={vi.fn()}
      />
    );

    const publishButton = screen.getByRole('button', { name: /publish/i });
    expect(publishButton).toBeEnabled();
    fireEvent.click(publishButton);
    // Alert might show success; ensure not blocked
    expect(window.alert).not.toHaveBeenCalledWith('Account suspended - please contact support');
  });

  it('blocks publish for suspended users and shows message', async () => {
    render(
      <ProjectDetailPage
        project={baseProject}
        user={suspendedUser}
        onBack={vi.fn()}
        onProjectUpdate={vi.fn()}
      />
    );

    const publishButton = screen.getByRole('button', { name: /publish/i });
    expect(publishButton).toBeDisabled();
    // Trigger handler via click (should early-return)
    fireEvent.click(publishButton);
    expect(window.alert).toHaveBeenCalledWith('Account suspended - please contact support');
    // Verify suspended banner is present
    expect(screen.getByText(/Account suspended - please contact support/i)).toBeInTheDocument();
  });
});