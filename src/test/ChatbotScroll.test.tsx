import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock the supabase client and other dependencies
const mockSupabase = {
  auth: {
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
    })),
  },
};

vi.mock('../lib/supabaseClient', () => {
  const mockSupabase = {
    auth: {
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'user-123' } } } })),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
      })),
    },
  };
  return { supabase: mockSupabase };
});

vi.mock('@google/generative-ai', () => {
  const mockGenerativeAI = {
    getGenerativeModel: () => ({
      startChat: () => ({
        sendMessage: () => Promise.resolve({ response: { text: () => 'Mocked response' } }),
      }),
    }),
  };
  return { GoogleGenerativeAI: vi.fn(() => mockGenerativeAI) };
});


describe('Chatbot Scroll Behavior', () => {
  it('should have proper CSS classes for scroll behavior', async () => {
    // Mock session and profile data
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
    };

    const mockProfile = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      phone_number: '1234567890',
      total_earnings: 1000,
      created_at: '2024-01-01T00:00:00Z',
    };

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'light'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // Mock the auth state
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback: any) => {
      callback('SIGNED_IN', mockSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // Mock the profile fetch
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockProfile, error: null })),
            })),
          })),
        } as any;
      }
      if (table === 'projects') {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        } as any;
      }
      if (table === 'templates') {
        return {
          select: vi.fn(() => Promise.resolve({ data: [], error: null })),
        } as any;
      }
      return {} as any;
    });

    render(<App />);

    // Check that the main container has overflow-hidden class
    const mainContainer = document.querySelector('.flex.h-screen.bg-white');
    expect(mainContainer).toHaveClass('overflow-hidden');

    // Check that the chatbot container has proper positioning classes
    const chatbotContainer = (await screen.findByTestId('chatbot-component')).parentElement;
    expect(chatbotContainer).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50', 'pointer-events-none');
  });

  it('should not affect page scroll behavior', () => {
    // This test verifies that the chatbot doesn't interfere with page scrolling
    // by checking that the main content area has proper overflow settings
    
    const mainContent = document.querySelector('.flex-1.flex.flex-col.overflow-hidden');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveClass('overflow-hidden');
  });

  it('should maintain floating position without layout impact', async () => {
    // Verify that the chatbot maintains its fixed position
    // without affecting the layout of other elements
    
    const chatbotContainer = (await screen.findByTestId('chatbot-component')).parentElement;
    
    // Check that it's positioned fixed
    expect(chatbotContainer).toHaveClass('fixed');
    
    // Check that it has pointer-events-none on the container
    expect(chatbotContainer).toHaveClass('pointer-events-none');
    
    // The chatbot component itself should have pointer-events-auto
    const chatbotComponent = await screen.findByTestId('chatbot-component');
    expect(chatbotComponent).toHaveClass('pointer-events-auto');
  });
});