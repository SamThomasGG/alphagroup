import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TransactionForm } from './TransactionForm';

// Mock the API service
vi.mock('../../services/api', () => ({
  api: {
    transactions: {
      create: vi.fn(),
    },
  },
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
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('TransactionForm Browser Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render transaction form with all required fields', async () => {
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    expect(screen.getByText('Enter the details for the new transaction. All transactions require approval before being processed.')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount \(gbp\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create transaction/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should update title input value', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    await user.type(titleInput, 'Office Supplies Purchase');

    expect(titleInput.value).toBe('Office Supplies Purchase');
  });

  it('should update price input value', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    const priceInput = screen.getByLabelText(/amount \(gbp\)/i) as HTMLInputElement;
    await user.clear(priceInput);
    await user.type(priceInput, '150.50');

    expect(priceInput.value).toBe('150.5');
  });

  it('should have correct input attributes for validation', async () => {
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    const priceInput = screen.getByLabelText(/amount \(gbp\)/i) as HTMLInputElement;

    expect(titleInput.required).toBe(true);
    expect(titleInput.type).toBe('text');
    
    expect(priceInput.required).toBe(true);
    expect(priceInput.type).toBe('number');
    expect(priceInput.step).toBe('0.01');
    expect(priceInput.min).toBe('0');
  });

  it('should show loading state when form is submitted', async () => {
    const user = userEvent.setup();
    
    // Mock create to return a pending promise
    const { api } = await import('../../services/api');
    vi.mocked(api.transactions.create).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText(/title/i);
    const priceInput = screen.getByLabelText(/amount \(gbp\)/i);
    const submitButton = screen.getByRole('button', { name: /create transaction/i });

    await user.type(titleInput, 'Test Transaction');
    await user.type(priceInput, '100.00');
    await user.click(submitButton);

    expect(screen.getByText('Creating Transaction...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('should successfully create transaction and navigate', async () => {
    const user = userEvent.setup();
    
    const { api } = await import('../../services/api');
    const mockTransaction = {
      id: '123',
      title: 'Test Transaction',
      priceGBP: 100.00,
      status: 'pending'
    };
    vi.mocked(api.transactions.create).mockResolvedValue(mockTransaction);
    
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText(/title/i);
    const priceInput = screen.getByLabelText(/amount \(gbp\)/i);
    const submitButton = screen.getByRole('button', { name: /create transaction/i });

    await user.type(titleInput, 'Test Transaction');
    await user.type(priceInput, '100.00');
    await user.click(submitButton);

    expect(api.transactions.create).toHaveBeenCalledWith({
      title: 'Test Transaction',
      priceGBP: 100.00,
    });

    // Wait for navigation
    expect(mockNavigate).toHaveBeenCalledWith('/transactions');
  });

  it('should display error message on failed transaction creation', async () => {
    const user = userEvent.setup();
    
    const { api } = await import('../../services/api');
    vi.mocked(api.transactions.create).mockRejectedValue(new Error('Validation failed: Title is required'));
    
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText(/title/i);
    const priceInput = screen.getByLabelText(/amount \(gbp\)/i);
    const submitButton = screen.getByRole('button', { name: /create transaction/i });

    await user.type(titleInput, 'Test Transaction');
    await user.type(priceInput, '100.00');
    await user.click(submitButton);

    // Wait for error to appear (validation message should be cleaned)
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('should handle cancel button click', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/transactions');
  });

  it('should clear error when form is resubmitted', async () => {
    const user = userEvent.setup();
    
    const { api } = await import('../../services/api');
    
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText(/title/i);
    const priceInput = screen.getByLabelText(/amount \(gbp\)/i);
    const submitButton = screen.getByRole('button', { name: /create transaction/i });

    // First submission that fails
    vi.mocked(api.transactions.create).mockRejectedValue(new Error('Server error'));
    
    await user.type(titleInput, 'Test Transaction');
    await user.type(priceInput, '100.00');
    await user.click(submitButton);

    // Wait for error to appear
    expect(await screen.findByText('Server error')).toBeInTheDocument();

    // Second submission that succeeds
    vi.mocked(api.transactions.create).mockResolvedValue({ id: '123' });
    
    await user.click(submitButton);

    // Error should be cleared immediately when form is submitted
    expect(screen.queryByText('Server error')).not.toBeInTheDocument();
  });

  it('should handle decimal values correctly', async () => {
    const user = userEvent.setup();
    
    const { api } = await import('../../services/api');
    vi.mocked(api.transactions.create).mockResolvedValue({ id: '123' });
    
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText(/title/i);
    const priceInput = screen.getByLabelText(/amount \(gbp\)/i);
    const submitButton = screen.getByRole('button', { name: /create transaction/i });

    await user.type(titleInput, 'Test Transaction');
    await user.type(priceInput, '99.99');
    await user.click(submitButton);

    expect(api.transactions.create).toHaveBeenCalledWith({
      title: 'Test Transaction',
      priceGBP: 99.99,
    });
  });

  it('should display pound symbol in price input', async () => {
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    // Check that the pound symbol is displayed
    expect(screen.getByText('£')).toBeInTheDocument();
  });

  it('should show helpful text for price input', async () => {
    render(
      <TestWrapper>
        <TransactionForm />
      </TestWrapper>
    );

    expect(screen.getByText('Enter the transaction amount in British Pounds')).toBeInTheDocument();
  });
});