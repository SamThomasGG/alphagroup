import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function CreateTransactionHeader() {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/transactions')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Transactions
      </Button>
      <h1 className="text-3xl font-bold">Create New Transaction</h1>
      <p className="text-muted-foreground mt-2">
        Add a new transaction to the system for approval
      </p>
    </div>
  );
}