import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the API service
vi.mock('../../services/api', () => ({
  api: {
    auth: {
      me: vi.fn().mockResolvedValue(null),
      login: vi.fn(),
      register: vi.fn(),
    },
  },
  setAuthToken: vi.fn(),
  getAuthToken: vi.fn().mockReturnValue(null),
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('LoginForm Browser Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form by default', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account to access the transaction dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /don't have an account/i })).toBeInTheDocument();
  });

  it('should switch to registration form when toggle button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: /don't have an account/i }));

    expect(document.querySelector('[data-slot="card-title"]')).toHaveTextContent('Create Account');
    expect(screen.getByText('Create a new account to get started with transaction management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /already have an account/i })).toBeInTheDocument();
  });

  it('should switch back to login form from registration', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Switch to registration
    await user.click(screen.getByRole('button', { name: /don't have an account/i }));
    expect(document.querySelector('[data-slot="card-title"]')).toHaveTextContent('Create Account');

    // Switch back to login
    await user.click(screen.getByRole('button', { name: /already have an account/i }));
    expect(document.querySelector('[data-slot="card-title"]')).toHaveTextContent('Welcome Back');
  });

  it('should update email input value', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    await user.type(emailInput, 'test@example.com');

    expect(emailInput.value).toBe('test@example.com');
  });

  it('should update password input value', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    await user.type(passwordInput, 'password123');

    expect(passwordInput.value).toBe('password123');
  });

  it('should show loading state when form is submitted', async () => {
    const user = userEvent.setup();
    
    // Mock login to return a pending promise
    const { api } = await import('../../services/api');
    vi.mocked(api.auth.login).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password');
    await user.click(submitButton);

    expect(screen.getByText('Signing In...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /don't have an account/i })).toBeDisabled();
  });

  it('should show registration loading state', async () => {
    const user = userEvent.setup();
    
    // Mock register to return a pending promise
    const { api } = await import('../../services/api');
    vi.mocked(api.auth.register).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Switch to registration mode
    await user.click(screen.getByRole('button', { name: /don't have an account/i }));

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password');
    await user.click(submitButton);

    expect(screen.getByText('Creating Account...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should display error message on failed login', async () => {
    const user = userEvent.setup();
    
    const { api } = await import('../../services/api');
    vi.mocked(api.auth.login).mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    // Wait for error to appear
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('should handle form validation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Try to submit empty form
    await user.click(submitButton);

    // The browser should handle HTML5 validation for required fields
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    
    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
    expect(emailInput.type).toBe('email');
    expect(passwordInput.type).toBe('password');
  });

  it('should clear error when switching between login and register', async () => {
    const user = userEvent.setup();
    
    const { api } = await import('../../services/api');
    vi.mocked(api.auth.login).mockRejectedValue(new Error('Login failed'));
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Fill form and submit to get an error
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for error to appear
    expect(await screen.findByText('Login failed')).toBeInTheDocument();

    // Switch to registration mode - error should disappear
    await user.click(screen.getByRole('button', { name: /don't have an account/i }));
    
    expect(screen.queryByText('Login failed')).not.toBeInTheDocument();
  });

  it('should maintain form values when switching modes', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    // Fill form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Switch to registration mode
    await user.click(screen.getByRole('button', { name: /don't have an account/i }));

    // Values should be maintained
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });
});