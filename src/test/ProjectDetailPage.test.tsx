import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectDetailPage from '../../pages/ProjectDetailPage';
import { Project, Template } from '../../types';

// Mock the supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      upload: vi.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
      })),
    },
  },
}));

// Mock QRCode
vi.mock('qrcode', () => ({
  toDataURL: vi.fn(() => Promise.resolve('mock-qr-code-data-url')),
}));

describe('ProjectDetailPage - Dynamic Field Rendering', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '1234567890',
    avatar_url: 'mock-avatar-url',
    total_earnings: 1000,
    created_at: '2024-01-01T00:00:00Z',
  };

  const createMockProject = (templateCategory: string, fieldMapping?: any): Project => ({
    id: 'project-123',
    user_id: 'user-123',
    template_id: 'template-123',
    template_category: templateCategory,
    project_name: 'Test Project',
    slug: 'test-project',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    theme_color: '#3b82f6',
    logo_url: 'mock-logo-url',
    data1: 'Test Data 1',
    data2: 'Test Data 2',
    data3: 'Test Data 3',
    data4: 'Test Data 4',
    data5: 'Test Data 5',
    data6: 'Test Data 6',
    data7: 'Test Data 7',
    data8: 'Test Data 8',
    templates: {
      id: 'template-123',
      created_at: '2024-01-01',
      title: 'Test Template',
      description: 'Test Description',
      category: templateCategory,
      price: 99,
      commission_rate: 10,
      preview_url: 'mock-preview-url',
      is_featured: true,
      field_mapping: fieldMapping,
    } as Template,
  });

  it('should render landing category fields correctly', () => {
    const landingFieldMapping = {
      data1: 'Hero Title',
      data2: 'Hero Subtitle',
      data3: 'Call to Action Text',
      data4: 'Feature 1 Title',
      data5: 'Feature 1 Description',
      data6: 'Feature 2 Title',
      data7: 'Feature 2 Description',
      data8: 'Footer Text',
    };

    const mockProject = createMockProject('landing', landingFieldMapping);

    render(
      <ProjectDetailPage
        project={mockProject}
        user={mockUser}
        onBack={vi.fn()}
        onProjectUpdate={vi.fn()}
      />
    );

    // Check that the template category is displayed
    expect(screen.getByText('Template Category: landing')).toBeInTheDocument();

    // Check that field labels are correctly mapped
    expect(screen.getByLabelText('Hero Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Hero Subtitle')).toBeInTheDocument();
    expect(screen.getByLabelText('Call to Action Text')).toBeInTheDocument();
    expect(screen.getByLabelText('Feature 1 Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Feature 1 Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Feature 2 Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Feature 2 Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Footer Text')).toBeInTheDocument();
  });

  it('should render feedback category fields correctly', () => {
    const feedbackFieldMapping = {
      data1: 'Feedback Form Title',
      data2: 'Welcome Message',
      data3: 'Question 1',
      data4: 'Question 2',
      data5: 'Question 3',
      data6: 'Thank You Message',
      data7: 'Contact Email',
      data8: 'Company Name',
    };

    const mockProject = createMockProject('feedback', feedbackFieldMapping);

    render(
      <ProjectDetailPage
        project={mockProject}
        user={mockUser}
        onBack={vi.fn()}
        onProjectUpdate={vi.fn()}
      />
    );

    // Check that the template category is displayed
    expect(screen.getByText('Template Category: feedback')).toBeInTheDocument();

    // Check that field labels are correctly mapped
    expect(screen.getByLabelText('Feedback Form Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Welcome Message')).toBeInTheDocument();
    expect(screen.getByLabelText('Question 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Question 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Question 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Thank You Message')).toBeInTheDocument();
    expect(screen.getByLabelText('Contact Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
  });

  it('should render default fields when no field mapping is available', () => {
    const mockProject = createMockProject('unknown-category', null);

    render(
      <ProjectDetailPage
        project={mockProject}
        user={mockUser}
        onBack={vi.fn()}
        onProjectUpdate={vi.fn()}
      />
    );

    // Check that the template category is displayed
    expect(screen.getByText('Template Category: unknown-category')).toBeInTheDocument();

    // Check that default field labels are used
    expect(screen.getByLabelText('Data 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Data 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Data 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Data 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Data 5')).toBeInTheDocument();
    expect(screen.getByLabelText('Data 6')).toBeInTheDocument();
    expect(screen.getByLabelText('Data 7')).toBeInTheDocument();
    expect(screen.getByLabelText('Data 8')).toBeInTheDocument();
  });

  it('should show warning when template category is not found', () => {
    const mockProject = createMockProject('', null);

    render(
      <ProjectDetailPage
        project={mockProject}
        user={mockUser}
        onBack={vi.fn()}
        onProjectUpdate={vi.fn()}
      />
    );

    // Check that a warning is displayed when template category is not found
    expect(screen.getByText('Warning: Template category not found')).toBeInTheDocument();
  });

  it('should handle field value updates correctly', async () => {
    const landingFieldMapping = {
      data1: 'Hero Title',
      data2: 'Hero Subtitle',
    };

    const mockProject = createMockProject('landing', landingFieldMapping);
    const mockOnProjectUpdate = vi.fn();

    render(
      <ProjectDetailPage
        project={mockProject}
        user={mockUser}
        onBack={vi.fn()}
        onProjectUpdate={mockOnProjectUpdate}
      />
    );

    const heroTitleInput = screen.getByLabelText('Hero Title');
    const heroSubtitleInput = screen.getByLabelText('Hero Subtitle');

    // Check initial values
    expect(heroTitleInput).toHaveValue('Test Data 1');
    expect(heroSubtitleInput).toHaveValue('Test Data 2');

    // Update values
    fireEvent.change(heroTitleInput, { target: { value: 'New Hero Title' } });
    fireEvent.change(heroSubtitleInput, { target: { value: 'New Hero Subtitle' } });

    // Click save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the update to be processed
    await waitFor(() => {
      expect(mockOnProjectUpdate).toHaveBeenCalled();
    });
  });

  it('should display correct field values for different template categories', () => {
    const testCases = [
      {
        category: 'landing',
        fieldMapping: { data1: 'Hero Title', data2: 'Hero Subtitle' },
        expectedValues: { 'Hero Title': 'Test Data 1', 'Hero Subtitle': 'Test Data 2' },
      },
      {
        category: 'feedback',
        fieldMapping: { data1: 'Feedback Form Title', data2: 'Welcome Message' },
        expectedValues: { 'Feedback Form Title': 'Test Data 1', 'Welcome Message': 'Test Data 2' },
      },
    ];

    testCases.forEach(({ category, fieldMapping, expectedValues }) => {
      const mockProject = createMockProject(category, fieldMapping);

      const { unmount } = render(
        <ProjectDetailPage
          project={mockProject}
          user={mockUser}
          onBack={vi.fn()}
          onProjectUpdate={vi.fn()}
        />
      );

      Object.entries(expectedValues).forEach(([label, expectedValue]) => {
        const input = screen.getByLabelText(label);
        expect(input).toHaveValue(expectedValue);
      });

      unmount();
    });
  });
});