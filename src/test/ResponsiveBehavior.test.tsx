import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectsPage } from '../../pages/ProjectsPage';
import { ProjectDetailPage } from '../../pages/ProjectDetailPage';
import { Project, Template, Profile } from '../../types';

// Mock dependencies
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

describe('Responsive Behavior Tests', () => {
  const mockUser: Profile = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    phone_number: '1234567890',
    total_earnings: 1000,
    created_at: '2024-01-01T00:00:00Z',
  };

  const createMockProject = (id: string, name: string, status: string): Project => ({
    id,
    user_id: 'user-123',
    template_id: 'template-123',
    template_category: 'landing',
    project_name: name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    status,
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
      category: 'landing',
      price: 99,
      commission_rate: 10,
      preview_url: 'https://example.com/preview',
      is_featured: true,
      field_mapping: {
        data1: 'Hero Title',
        data2: 'Hero Subtitle',
        data3: 'Call to Action',
      },
    } as Template,
  });

  beforeEach(() => {
    // Reset viewport to desktop size by default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
  });

  describe('ProjectsPage Responsive Behavior', () => {
    it('should display projects in grid layout on desktop', () => {
      const mockProjects = [
        createMockProject('1', 'Desktop Project 1', 'active'),
        createMockProject('2', 'Desktop Project 2', 'pending'),
        createMockProject('3', 'Desktop Project 3', 'completed'),
      ];

      render(
        <ProjectsPage
          projects={mockProjects}
          onSelectProject={vi.fn()}
        />
      );

      const projectCards = screen.getAllByRole('article');
      expect(projectCards).toHaveLength(3);

      // Check for responsive grid classes
      const gridContainer = screen.getByTestId('projects-grid');
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
    });

    it('should maintain clickable behavior on mobile devices', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const mockProjects = [
        createMockProject('1', 'Mobile Project', 'active'),
      ];

      render(
        <ProjectsPage
          projects={mockProjects}
          onSelectProject={vi.fn()}
        />
      );

      const projectCard = screen.getByRole('article');
      expect(projectCard).toHaveClass('cursor-pointer');
      expect(projectCard).toHaveClass('hover:shadow-lg');
      expect(projectCard).toHaveClass('transition-all', 'duration-200');
    });

    it('should display project cards with proper responsive spacing', () => {
      const mockProjects = [
        createMockProject('1', 'Spacing Test Project', 'active'),
      ];

      render(
        <ProjectsPage
          projects={mockProjects}
          onSelectProject={vi.fn()}
        />
      );

      const projectCard = screen.getByRole('article');
      // Check for responsive padding and spacing
      expect(projectCard).toHaveClass('p-6', 'sm:p-8');
      expect(projectCard).toHaveClass('rounded-lg', 'shadow-md');
    });

    it('should handle touch events on mobile devices', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const mockOnSelectProject = vi.fn();
      const mockProjects = [
        createMockProject('1', 'Touch Test Project', 'active'),
      ];

      render(
        <ProjectsPage
          projects={mockProjects}
          onSelectProject={mockOnSelectProject}
        />
      );

      const projectCard = screen.getByRole('article');
      
      // Simulate touch event
      fireEvent.touchStart(projectCard, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(projectCard, { changedTouches: [{ clientX: 100, clientY: 100 }] });

      expect(mockOnSelectProject).toHaveBeenCalledWith(mockProjects[0]);
    });
  });

  describe('ProjectDetailPage Responsive Behavior', () => {
    it('should display form fields in responsive layout', () => {
      const mockProject = createMockProject('1', 'Responsive Test Project', 'active');

      render(
        <ProjectDetailPage
          project={mockProject}
          user={mockUser}
          onBack={vi.fn()}
          onProjectUpdate={vi.fn()}
        />
      );

      // Check form container responsive classes
      const formContainer = screen.getByTestId('project-detail-form');
      expect(formContainer).toHaveClass('max-w-4xl', 'mx-auto', 'p-4', 'sm:p-6', 'lg:p-8');

      // Check form grid layout
      const formGrid = screen.getByTestId('form-grid');
      expect(formGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4', 'sm:gap-6');
    });

    it('should handle custom fields with responsive input sizing', () => {
      const mockProject = createMockProject('1', 'Custom Fields Project', 'active');

      render(
        <ProjectDetailPage
          project={mockProject}
          user={mockUser}
          onBack={vi.fn()}
          onProjectUpdate={vi.fn()}
        />
      );

      const inputFields = screen.getAllByRole('textbox');
      inputFields.forEach(input => {
        expect(input).toHaveClass('w-full', 'px-3', 'py-2', 'sm:px-4', 'sm:py-3');
      });
    });

    it('should display action buttons with responsive sizing', () => {
      const mockProject = createMockProject('1', 'Buttons Test Project', 'active');

      render(
        <ProjectDetailPage
          project={mockProject}
          user={mockUser}
          onBack={vi.fn()}
          onProjectUpdate={vi.fn()}
        />
      );

      const actionButtons = screen.getAllByRole('button');
      actionButtons.forEach(button => {
        expect(button).toHaveClass('px-4', 'py-2', 'sm:px-6', 'sm:py-3');
      });
    });

    it('should handle template category display responsively', () => {
      const mockProject = createMockProject('1', 'Category Test Project', 'active');

      render(
        <ProjectDetailPage
          project={mockProject}
          user={mockUser}
          onBack={vi.fn()}
          onProjectUpdate={vi.fn()}
        />
      );

      const categoryElement = screen.getByText('Template Category: landing');
      expect(categoryElement).toHaveClass('text-sm', 'sm:text-base', 'font-medium');
    });
  });

  describe('Cross-Device Compatibility', () => {
    const deviceSizes = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
    ];

    deviceSizes.forEach(({ name, width, height }) => {
      it(`should maintain functionality on ${name} devices (${width}x${height})`, () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: height,
        });

        const mockProjects = [
          createMockProject('1', `${name} Test Project`, 'active'),
        ];

        const { unmount } = render(
          <ProjectsPage
            projects={mockProjects}
            onSelectProject={vi.fn()}
          />
        );

        // Verify basic functionality is maintained
        const projectCard = screen.getByRole('article');
        expect(projectCard).toBeInTheDocument();
        expect(projectCard).toHaveClass('cursor-pointer');

        unmount();
      });
    });
  });
});