import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TransactionTable } from './TransactionTable';
import type { Transaction } from '../../types/auth';

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

// Sample transaction data
const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Office Supplies',
    priceGBP: 150.50,
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    createdById: 'user-1',
    createdBy: {
      id: 'user-1',
      email: 'john@example.com',
    },
    approvedById: null,
    approvedBy: null,
    approvedAt: null,
  },
  {
    id: 'tx-2',
    title: 'Software License',
    priceGBP: 299.99,
    status: 'approved',
    createdAt: '2024-01-14T09:15:00Z',
    createdById: 'user-2',
    createdBy: {
      id: 'user-2',
      email: 'jane@example.com',
    },
    approvedById: 'user-3',
    approvedBy: {
      id: 'user-3',
      email: 'admin@example.com',
    },
    approvedAt: '2024-01-14T14:20:00Z',
  },
];

describe('TransactionTable Browser Tests', () => {
  const defaultProps = {
    transactions: mockTransactions,
    canApproveTransactions: true,
    canInputTransactions: true,
    isLoading: false,
    onApprove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render table with transaction data', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('All Transactions')).toBeInTheDocument();
    expect(screen.getByText('Complete list of all transactions in the system')).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Created By')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Approved By')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check transaction data
    expect(screen.getByText('Office Supplies')).toBeInTheDocument();
    expect(screen.getByText('Software License')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('should format prices correctly', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('£150.50')).toBeInTheDocument();
    expect(screen.getByText('£299.99')).toBeInTheDocument();
  });

  it('should format dates correctly', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} />
      </TestWrapper>
    );

    // Check that dates are formatted (exact format may vary by locale)
    // Use getAllByText to handle multiple matching elements
    const jan15Elements = screen.getAllByText(/15\/01\/2024/);
    const jan14Elements = screen.getAllByText(/14\/01\/2024/);
    
    expect(jan15Elements.length).toBeGreaterThan(0);
    expect(jan14Elements.length).toBeGreaterThan(0);
  });

  it('should show loading state', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} isLoading={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
    expect(screen.queryByText('Office Supplies')).not.toBeInTheDocument();
  });

  it('should show empty state when no transactions', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} transactions={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('No transactions found')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first transaction')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create transaction/i })).toBeInTheDocument();
  });

  it('should not show create button in empty state when user cannot input transactions', async () => {
    render(
      <TestWrapper>
        <TransactionTable 
          {...defaultProps} 
          transactions={[]} 
          canInputTransactions={false} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('No transactions found')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create transaction/i })).not.toBeInTheDocument();
  });

  it('should navigate to create transaction page when create button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} transactions={[]} />
      </TestWrapper>
    );

    const createButton = screen.getByRole('button', { name: /create transaction/i });
    await user.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith('/create-transaction');
  });

  it('should show approve button for pending transactions when user can approve', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} />
      </TestWrapper>
    );

    const approveButtons = screen.getAllByRole('button', { name: /approve/i });
    expect(approveButtons).toHaveLength(1); // Only one pending transaction
  });

  it('should not show approve button when user cannot approve transactions', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} canApproveTransactions={false} />
      </TestWrapper>
    );

    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('should call onApprove when approve button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnApprove = vi.fn();
    
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} onApprove={mockOnApprove} />
      </TestWrapper>
    );

    const approveButton = screen.getByRole('button', { name: /approve/i });
    await user.click(approveButton);

    expect(mockOnApprove).toHaveBeenCalledWith('tx-1');
  });

  it('should show different status badges for pending and approved transactions', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} />
      </TestWrapper>
    );

    const pendingBadge = screen.getByText('pending');
    const approvedBadge = screen.getByText('approved');

    expect(pendingBadge).toBeInTheDocument();
    expect(approvedBadge).toBeInTheDocument();

    // Check that badges have different styling classes
    expect(pendingBadge.closest('.bg-yellow-100')).toBeTruthy();
    expect(approvedBadge.closest('.bg-green-100')).toBeTruthy();
  });

  it('should show dash for missing approved by and approved at fields', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} />
      </TestWrapper>
    );

    // Find the pending transaction row and check for dashes
    const tableRows = screen.getAllByRole('row');
    const pendingRow = tableRows.find(row => row.textContent?.includes('Office Supplies'));
    
    expect(pendingRow).toBeTruthy();
    // There should be dashes in the approved by and approved at columns for pending transactions
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('should display icons for various fields', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} />
      </TestWrapper>
    );

    // Check that various icons are present in the DOM
    // Note: We're checking for the presence of icon elements by their typical structure
    const iconElements = document.querySelectorAll('svg');
    expect(iconElements.length).toBeGreaterThan(0);
  });

  it('should handle transactions with different statuses correctly', async () => {
    const transactionsWithVariousStatuses: Transaction[] = [
      {
        ...mockTransactions[0],
        status: 'pending',
      },
      {
        ...mockTransactions[1],
        status: 'approved',
      },
    ];

    render(
      <TestWrapper>
        <TransactionTable 
          {...defaultProps} 
          transactions={transactionsWithVariousStatuses} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
    
    // Only pending transactions should have approve buttons
    const approveButtons = screen.getAllByRole('button', { name: /approve/i });
    expect(approveButtons).toHaveLength(1);
  });

  it('should be responsive with overflow handling', async () => {
    render(
      <TestWrapper>
        <TransactionTable {...defaultProps} />
      </TestWrapper>
    );

    const tableContainer = document.querySelector('.overflow-x-auto');
    expect(tableContainer).toBeInTheDocument();
  });
});