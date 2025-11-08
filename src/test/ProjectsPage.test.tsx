import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectsPage } from '../../pages/ProjectsPage';
import { Project, Template } from '../../types';

describe('ProjectsPage - Clickable Entries', () => {
  const mockOnSelectProject = vi.fn();

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
    } as Template,
  });

  it('should make entire project entries clickable', () => {
    const mockProjects = [
      createMockProject('1', 'Active Project', 'active'),
      createMockProject('2', 'Pending Project', 'pending'),
    ];

    render(
      <ProjectsPage
        projects={mockProjects}
        onSelectProject={mockOnSelectProject}
      />
    );

    const projectCards = screen.getAllByRole('article');
    expect(projectCards).toHaveLength(2);

    // Check that each card has cursor-pointer class
    projectCards.forEach(card => {
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  it('should call onSelectProject when clicking on project entry', async () => {
    const user = userEvent.setup();
    const mockProjects = [
      createMockProject('1', 'Active Project', 'active'),
    ];

    render(
      <ProjectsPage
        projects={mockProjects}
        onSelectProject={mockOnSelectProject}
      />
    );

    const projectCard = screen.getByRole('article');
    await user.click(projectCard);

    expect(mockOnSelectProject).toHaveBeenCalledWith(mockProjects[0]);
    expect(mockOnSelectProject).toHaveBeenCalledTimes(1);
  });

  it('should not have View Details button', () => {
    const mockProjects = [
      createMockProject('1', 'Active Project', 'active'),
    ];

    render(
      <ProjectsPage
        projects={mockProjects}
        onSelectProject={mockOnSelectProject}
      />
    );

    // Check that "View Details" button is not present
    const viewDetailsButtons = screen.queryByText('View Details');
    expect(viewDetailsButtons).not.toBeInTheDocument();
  });

  it('should retain View Live link functionality', () => {
    const mockProjects = [
      createMockProject('1', 'Active Project', 'active'),
    ];

    render(
      <ProjectsPage
        projects={mockProjects}
        onSelectProject={mockOnSelectProject}
      />
    );

    // Check that "View Live" link is present
    const viewLiveLink = screen.getByText('View Live');
    expect(viewLiveLink).toBeInTheDocument();
    expect(viewLiveLink).toHaveAttribute('href', '/test-project');
    expect(viewLiveLink).toHaveAttribute('target', '_blank');
    expect(viewLiveLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should handle keyboard navigation for accessibility', async () => {
    const user = userEvent.setup();
    const mockProjects = [
      createMockProject('1', 'Active Project', 'active'),
    ];

    render(
      <ProjectsPage
        projects={mockProjects}
        onSelectProject={mockOnSelectProject}
      />
    );

    const projectCard = screen.getByRole('article');
    
    // Tab to the card
    await user.tab();
    expect(projectCard).toHaveFocus();

    // Press Enter to select
    await user.keyboard('{Enter}');
    expect(mockOnSelectProject).toHaveBeenCalledWith(mockProjects[0]);

    // Reset mock
    mockOnSelectProject.mockClear();

    // Press Space to select
    await user.keyboard(' ');
    expect(mockOnSelectProject).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('should prevent event bubbling for View Live link', () => {
    const mockProjects = [
      createMockProject('1', 'Active Project', 'active'),
    ];

    render(
      <ProjectsPage
        projects={mockProjects}
        onSelectProject={mockOnSelectProject}
      />
    );

    const viewLiveLink = screen.getByText('View Live');
    
    // Simulate click on View Live link
    fireEvent.click(viewLiveLink);

    // onSelectProject should not be called when clicking View Live
    expect(mockOnSelectProject).not.toHaveBeenCalled();
  });

  it('should display project information correctly', () => {
    const mockProjects = [
      createMockProject('1', 'Test Project', 'active'),
    ];

    render(
      <ProjectsPage
        projects={mockProjects}
        onSelectProject={mockOnSelectProject}
      />
    );

    // Check project name
    expect(screen.getByText('Test Project')).toBeInTheDocument();

    // Check status badge
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Check created date
    expect(screen.getByText(/Created on/)).toBeInTheDocument();
  });

  it('should handle empty projects list', () => {
    render(
      <ProjectsPage
        projects={[]}
        onSelectProject={mockOnSelectProject}
      />
    );

    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('should handle different project statuses with appropriate styling', () => {
    const mockProjects = [
      createMockProject('1', 'Active Project', 'active'),
      createMockProject('2', 'Pending Project', 'pending'),
      createMockProject('3', 'Completed Project', 'completed'),
    ];

    render(
      <ProjectsPage
        projects={mockProjects}
        onSelectProject={mockOnSelectProject}
      />
    );

    const projectCards = screen.getAllByRole('article');
    expect(projectCards).toHaveLength(3);

    // Check status badges
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});