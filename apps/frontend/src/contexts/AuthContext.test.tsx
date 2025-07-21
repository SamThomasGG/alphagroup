import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { api, getAuthToken, setAuthToken } from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    auth: {
      me: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
    },
  },
  setAuthToken: vi.fn(),
  getAuthToken: vi.fn().mockReturnValue(null),
}));

// Test component to access the auth context
function TestComponent() {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="user-email">{auth.user?.email || 'No user'}</div>
      <div data-testid="is-loading">{auth.isLoading.toString()}</div>
      <div data-testid="has-read-permission">
        {auth.hasPermission('read').toString()}
      </div>
      <button onClick={() => auth.login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={() => auth.register('new@example.com', 'password')}>
        Register
      </button>
      <button onClick={auth.logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('AuthProvider', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Reset getAuthToken to return null by default
      vi.mocked(getAuthToken).mockReturnValue(null);
    });
    it('should initialize with loading state and fetch user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        permissions: ['read', 'write'],
      };

      vi.mocked(api.auth.me).mockResolvedValue(mockUser);
      // Mock that we have a token so it tries to fetch user
      vi.mocked(getAuthToken).mockReturnValue('mock-token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially loading
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');

      // Wait for user to be loaded
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('has-read-permission')).toHaveTextContent('true');
    });

    it('should handle failed user fetch gracefully', async () => {
      vi.mocked(api.auth.me).mockRejectedValue(new Error('Unauthorized'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should handle login successfully', async () => {
      const mockAuthResponse = {
        access_token: 'token123',
        user: {
          id: '1',
          email: 'test@example.com',
          permissions: ['read'],
        },
      };

      vi.mocked(api.auth.me).mockResolvedValue(null);
      vi.mocked(api.auth.login).mockResolvedValue(mockAuthResponse);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      // Perform login
      await act(async () => {
        screen.getByText('Login').click();
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(api.auth.login).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('should handle register successfully', async () => {
      const mockAuthResponse = {
        access_token: 'token123',
        user: {
          id: '2',
          email: 'new@example.com',
          permissions: [],
        },
      };

      vi.mocked(api.auth.me).mockResolvedValue(null);
      vi.mocked(api.auth.register).mockResolvedValue(mockAuthResponse);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      // Perform register
      await act(async () => {
        screen.getByText('Register').click();
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com');
      expect(api.auth.register).toHaveBeenCalledWith('new@example.com', 'password');
    });

    it('should handle logout', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        permissions: ['read'],
      };

      vi.mocked(api.auth.me).mockResolvedValue(mockUser);
      // Mock that we have a token so it tries to fetch user
      vi.mocked(getAuthToken).mockReturnValue('mock-token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for user to be loaded
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });

      // Perform logout
      act(() => {
        screen.getByText('Logout').click();
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should handle network errors during login', async () => {
      vi.mocked(api.auth.me).mockResolvedValue(null);
      vi.mocked(api.auth.login).mockRejectedValue(new Error('fetch failed'));

      function ErrorTestComponent() {
        const auth = useAuth();
        const [error, setError] = React.useState<string>('');
        
        const handleLogin = async () => {
          try {
            await auth.login('test@example.com', 'password');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
          }
        };
        
        return (
          <div>
            <div data-testid="is-loading">{auth.isLoading.toString()}</div>
            <button onClick={handleLogin}>Login</button>
            <div data-testid="error">{error}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <ErrorTestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Unable to connect to the server. Please check your internet connection.');
      });
    });

    it('should handle network errors during register', async () => {
      vi.mocked(api.auth.me).mockResolvedValue(null);
      vi.mocked(api.auth.register).mockRejectedValue(new Error('fetch failed'));

      function ErrorTestComponent() {
        const auth = useAuth();
        const [error, setError] = React.useState<string>('');
        
        const handleRegister = async () => {
          try {
            await auth.register('new@example.com', 'password');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
          }
        };
        
        return (
          <div>
            <div data-testid="is-loading">{auth.isLoading.toString()}</div>
            <button onClick={handleRegister}>Register</button>
            <div data-testid="error">{error}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <ErrorTestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await act(async () => {
        screen.getByText('Register').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Unable to connect to the server. Please check your internet connection.');
      });
    });

    it('should check permissions correctly', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        permissions: ['read', 'write'],
      };

      vi.mocked(api.auth.me).mockResolvedValue(mockUser);
      // Mock that we have a token so it tries to fetch user
      vi.mocked(getAuthToken).mockReturnValue('mock-token');

      function PermissionTestComponent() {
        const auth = useAuth();
        
        return (
          <div>
            <div data-testid="has-read">{auth.hasPermission('read').toString()}</div>
            <div data-testid="has-write">{auth.hasPermission('write').toString()}</div>
            <div data-testid="has-delete">{auth.hasPermission('delete').toString()}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <PermissionTestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('has-read')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('has-write')).toHaveTextContent('true');
      expect(screen.getByTestId('has-delete')).toHaveTextContent('false');
    });

    it('should return false for permissions when no user', async () => {
      vi.mocked(api.auth.me).mockResolvedValue(null);

      function PermissionTestComponent() {
        const auth = useAuth();
        
        return (
          <div data-testid="has-read">{auth.hasPermission('read').toString()}</div>
        );
      }

      await act(async () => {
        render(
          <AuthProvider>
            <PermissionTestComponent />
          </AuthProvider>
        );
      });

      expect(screen.getByTestId('has-read')).toHaveTextContent('false');
    });
  });
});