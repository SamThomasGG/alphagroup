import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Transaction } from '@/types/auth.ts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Eye,
  Check,
  User,
  CalendarDays,
  PoundSterling,
  FileText,
  UserCheck,
  Clock,
} from 'lucide-react';

function TransactionTableHeader() {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Eye className="h-5 w-5" />
        All Transactions
      </CardTitle>
      <CardDescription>
        Complete list of all transactions in the system
      </CardDescription>
    </CardHeader>
  );
}

interface TransactionTableProps {
  transactions: Transaction[];
  canApproveTransactions: boolean;
  canInputTransactions: boolean;
  isLoading: boolean;
  onApprove: (id: string) => void;
}

export const TransactionTable = React.memo(function TransactionTable({
  transactions,
  canApproveTransactions,
  canInputTransactions,
  isLoading,
  onApprove,
}: TransactionTableProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };

  if (isLoading) {
    return (
      <Card>
        <TransactionTableHeader />
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-muted border-t-foreground rounded-full animate-spin" />
              Loading transactions...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <TransactionTableHeader />
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first transaction
            </p>
            {canInputTransactions && (
              <Button onClick={() => navigate('/create-transaction')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Transaction
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <TransactionTableHeader />
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Created By</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Approved By</TableHead>
                <TableHead className="font-semibold">Approved</TableHead>
                {canApproveTransactions && (
                  <TableHead className="font-semibold">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {transaction.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium">
                      <PoundSterling className="h-4 w-4 text-muted-foreground" />
                      {formatPrice(transaction.priceGBP)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {transaction.createdBy.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      {formatDate(transaction.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === 'approved'
                          ? 'default'
                          : 'secondary'
                      }
                      className={
                        transaction.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }
                    >
                      {transaction.status === 'approved' ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.approvedBy ? (
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        {transaction.approvedBy.email}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.approvedAt ? (
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {formatDate(transaction.approvedAt)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  {canApproveTransactions && (
                    <TableCell>
                      {transaction.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => onApprove(transaction.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
