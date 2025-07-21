import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { Transaction } from '../types/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardHeader } from '../components/transactions/DashboardHeader';
import { StatsCards } from '../components/transactions/StatsCards';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { AlertCircle } from 'lucide-react';

export function ViewTransactions() {
  const { hasPermission } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const canInputTransactions = hasPermission('can_input_transactions');
  const canApproveTransactions = hasPermission('can_approve_transactions');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await api.transactions.list();
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load transactions'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.transactions.approve(id);
      await loadTransactions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to approve transaction'
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader canInputTransactions={canInputTransactions} />

        <StatsCards transactions={transactions} />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TransactionTable
          transactions={transactions}
          canApproveTransactions={canApproveTransactions}
          canInputTransactions={canInputTransactions}
          isLoading={isLoading}
          onApprove={handleApprove}
        />
      </div>
    </div>
  );
}
