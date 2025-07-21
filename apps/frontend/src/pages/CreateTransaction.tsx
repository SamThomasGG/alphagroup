import { CreateTransactionHeader } from '../components/transactions/CreateTransactionHeader';
import { TransactionForm } from '../components/transactions/TransactionForm';

export function CreateTransaction() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <CreateTransactionHeader />
        <TransactionForm />
      </div>
    </div>
  );
}
